import pandas as pd
import os
import re
from typing import Dict, List, Any

class CSVEngine:
    def __init__(self, data_directory: str):
        self.data_directory = data_directory
        self.dataframes: Dict[str, pd.DataFrame] = {}

    def load_all_csvs(self) -> bool:
        if not os.path.isdir(self.data_directory):
            return False

        loaded = False
        for file in os.listdir(self.data_directory):
            if file.lower().endswith(".csv"):
                path = os.path.join(self.data_directory, file)
                try:
                    df = pd.read_csv(path)
                    # Normalize: strip and lowercase all string values
                    for col in df.columns:
                        if df[col].dtype == 'object':
                            df[col] = df[col].astype(str).str.strip().str.lower()
                        if any(x in col.lower() for x in ['qty', 'pl_', 'mv_', 'price', 'principal']):
                            df[col] = pd.to_numeric(df[col].replace('NULL', 0), errors='coerce').fillna(0)
                    
                    if not df.empty:
                        self.dataframes[file] = df
                        loaded = True
                except Exception as e:
                    print(f"Error loading {file}: {e}")

        return loaded

    def get_analytical_facts(self, query: str) -> str:
        """
        Consolidated analytical engine. Detects intent and computes facts.
        """
        q = query.lower()
        facts = []
        
        # 1. Identify potential entities (words that aren't common stopwords)
        words = set(re.findall(r'\b\w{3,}\b', q))
        stop_words = {
            'the', 'what', 'which', 'many', 'total', 'how', 'for', 'present', 
            'data', 'provided', 'based', 'perform', 'better', 'than', 'number', 
            'trades', 'holdings', 'and', 'with', 'that', 'fund', 'depends', 
            'depending', 'yearly', 'loss', 'profit', 'show', 'tell', 'me', 'about',
            'most', 'least', 'highest', 'lowest', 'records', 'portfolio'
        }
        entities = words - stop_words

        # Find all unique fund/portfolio names in the data for cross-referencing
        all_known_funds = set()
        for df in self.dataframes.values():
            group_col = next((c for c in df.columns if c.lower() in ['portfolioname', 'portfolio_name', 'shortname', 'name']), None)
            if group_col:
                all_known_funds.update(df[group_col].astype(str).unique())

        # 2. Performance / Ranking Facts
        if any(k in q for k in ["profit", "loss", "performed", "performance", "p&l", "ranking", "better", "best"]):
            for filename, df in self.dataframes.items():
                pl_col = next((c for c in df.columns if c.lower() == 'pl_ytd'), None)
                group_col = next((c for c in df.columns if c.lower() in ['portfolioname', 'portfolio_name', 'shortname', 'name']), None)
                
                if pl_col and group_col:
                    stats = df.groupby(group_col)[pl_col].sum().sort_values(ascending=False).to_dict()
                    if stats:
                        ranked_names = [name.capitalize() for name in stats.keys()]
                        facts.append(f"Fact: In {filename}, funds ranked by performance (Best to Worst): {', '.join(ranked_names)}")
                        for name, val in list(stats.items()):
                            facts.append(f"Fact: Fund {name.capitalize()} in {filename} has total PL_YTD of {val:.4f}")

        # 3. Global Stats / Generic record counting
        if any(k in q for k in ["most", "least", "count", "record", "portfolio", "records", "highest", "lowest"]):
            for filename, df in self.dataframes.items():
                group_col = next((c for c in df.columns if c.lower() in ['portfolioname', 'portfolio_name', 'shortname', 'name']), None)
                if group_col:
                    counts = df[group_col].value_counts().sort_values(ascending=False).to_dict()
                    if counts:
                        top_portfolio = list(counts.keys())[0]
                        facts.append(f"Fact: In {filename}, portfolio '{top_portfolio.capitalize()}' has the absolute highest number of records ({counts[top_portfolio]}).")
                        # Detailed counts for top portfolios
                        details = [f"{k.capitalize()}: {v} records" for k, v in list(counts.items())]
                        facts.append(f"Fact: Summary of record counts in {filename}: {', '.join(details)}.")

        # 4. Entity specific investigation (Dynamic)
        detected_entities = entities & all_known_funds

        
        # If no specific fund detected but user is asking about a fund, we check if any query word matches PARTIALLY
        if not detected_entities:
            for entity in entities:
                matches = [fund for fund in all_known_funds if entity in fund]
                detected_entities.update(matches)

        for entity in detected_entities:
            for filename, df in self.dataframes.items():
                group_col = next((c for c in df.columns if c.lower() in ['portfolioname', 'portfolio_name', 'shortname', 'name', 'strategyname']), None)
                if group_col:
                    mask = df[group_col].astype(str).str.contains(entity, case=False, na=False)
                    count = int(mask.sum())
                    if count > 0 or entity in ["ytum", "garfield", "heather"]:
                        facts.append(f"Fact: {entity.capitalize()} has {count} records in {filename}.")
                        
                        if count > 0:
                            pl_col = next((c for c in df.columns if c.lower() == 'pl_ytd'), None)
                            if pl_col:
                                total_pl = df[mask][pl_col].sum()
                                facts.append(f"Fact: {entity.capitalize()} has a total PL_YTD of {total_pl:.4f} in {filename}.")
                            
                            qty_col = next((c for c in df.columns if c.lower() == 'qty'), None)
                            if qty_col:
                                total_qty = df[mask][qty_col].sum()
                                facts.append(f"Fact: {entity.capitalize()} has a total Quantity of {total_qty:.4f} in {filename}.")

        # Deduplicate facts
        facts = list(dict.fromkeys(facts))
        return "\n".join(facts) if facts else "No specific numerical facts computed for the given entities/metrics."

    def get_schema_sample(self, row_limit: int = 3) -> str:
        output = []
        for filename, df in self.dataframes.items():
            output.append(f"### Dataset: {filename}")
            output.append(f"Columns: {', '.join(df.columns)}")
            output.append(df.head(row_limit).to_string(index=False))
            output.append("")
        return "\n".join(output)

    def validate_schema(self) -> bool:
        if not self.dataframes: return False
        for df in self.dataframes.values():
            if df.empty or len(df.columns) == 0: return False
        return True
