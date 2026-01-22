import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT_TEMPLATE = """You are a helpful and professional Financial Portfolio Assistant.

Your objective is to provide clear, insightful, and accurate answers based on the provided data.

CONTEXT:
1. DATA INSIGHTS: These are pre-verified facts computed from the entire dataset. Use these as your primary source of truth for counts, sums, and rankings.
2. SCHEMA SAMPLE: This shows the structure and a few example rows for context.

HOW TO ANSWER:
- Be conversational yet professional. Do NOT mention "Pre-computed facts" or "technical data" to the user. Simply present the numbers as part of your helpful response.
- Use bold text, bullet points, and tables to make the data easy to read.
- **Provide a comprehensive list**: If the DATA INSIGHTS contain many funds or portfolios, include all of them in your answer (using a table or list) instead of just the top few, unless the user specifically asks for a "top X".
- If the data is available, answer directly and clearly.
- If you don't have enough data to answer, say: "I'm sorry, I couldn't find specific information for that in the current data."
- Treat technical terms like 'PL_YTD' as 'Profit and Loss' and 'MV_Base' as 'Market Value'.

STRICT CONSTRAINTS:
- Use only the provided information. No external knowledge.
- Be precise with numbers—do not round them unless requested.

DATA INSIGHTS:
{FACTS}

SCHEMA SAMPLE:
{CSV_DATA}

User Question:
{USER_QUESTION}
"""






class LLMClient:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables.")

        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant"

    def get_answer(self, context: str, question: str, facts: str = "") -> str:
        prompt = SYSTEM_PROMPT_TEMPLATE.format(
            FACTS=facts if facts else "No specific facts computed.",
            CSV_DATA=context,
            USER_QUESTION=question
        )

        try:

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": prompt}],
                temperature=0,
                max_tokens=1000
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"Error communicating with LLM: {str(e)}"
