# Analytical Finance Chatbot

A full-stack AI-powered chatbot for financial data analysis with an OpenAI-inspired interface. The system analyzes CSV data (holdings and trades) and provides intelligent insights through natural language queries with real-time streaming responses.

![Tech Stack](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 Features

### Backend
- **Intelligent Data Analysis**: Processes financial CSV data (holdings & trades)
- **Contextual Facts Engine**: Pre-computes analytical facts for accurate responses
- **LLM-Powered Insights**: Uses Groq's Llama 3.1 for natural language understanding
- **Streaming Responses**: Real-time Server-Sent Events (SSE) for smooth UX
- **Conversation Management**: Persistent conversation history and context

### Frontend
- **OpenAI-Inspired UI**: Clean, minimalist black & white design
- **Real-Time Streaming**: Live message streaming with visual feedback
- **Rich Markdown Support**: Tables, code blocks, lists with proper formatting
- **Responsive Design**: Mobile-friendly with collapsible sidebar
- **Dark Mode**: Automatic light/dark theme support
- **Conversation History**: Sidebar with all past conversations

## 🏗️ Architecture

```
project-proojectloop/
├── backend/                    # FastAPI backend
│   ├── main.py                # API endpoints & streaming logic
│   ├── csv_engine.py          # Data processing & fact extraction
│   ├── llm_client.py          # Groq LLM integration
│   └── data/
│       ├── holdings.csv       # Financial holdings data
│       └── trades.csv         # Trading data
│
└── frontend-next/             # Next.js frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.js      # Root layout with sidebar
    │   │   ├── page.js        # Home page
    │   │   ├── globals.css    # Theme & styling
    │   │   └── c/[id]/        # Dynamic chat routes
    │   ├── components/
    │   │   ├── Sidebar.js     # Conversation list
    │   │   └── ChatInterface.js  # Main chat UI
    │   └── lib/
    │       └── api.js         # API client
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key ([Get one here](https://console.groq.com))

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment** (optional but recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install fastapi uvicorn pandas groq python-dotenv
   ```

4. **Configure environment**:
   Create a `.env` file in the `backend/` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   DATA_DIR=data
   ```

5. **Run the server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend-next
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:3000` (or next available port)

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/status` | Authentication status |
| `GET` | `/chat_models` | Available chat models |
| `POST` | `/chat/new_conversation` | Create new conversation |
| `GET` | `/conversation/all` | List all conversations |
| `GET` | `/conversation/{id}` | Get specific conversation |
| `POST` | `/chat/conversation` | Send message (streaming) |
| `POST` | `/chat/get_alias` | Generate conversation title |

### Example Request

```bash
curl -X POST http://localhost:8000/chat/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_message": [{"type": "text", "text": "Which funds performed better?"}]
  }'
```

## 💡 Example Queries

Try these questions with your data:

- "Which funds performed better depending on the yearly Profit and Loss?"
- "Show me the top 5 portfolios by total holdings"
- "What is the total quantity for YTUM fund?"
- "Which portfolio has the most records?"
- "Compare the performance of Garfield vs Heather funds"

## 🎨 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data processing and analysis
- **Groq**: LLM API (Llama 3.1 8B Instant)
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 15+**: React framework with App Router
- **Tailwind CSS v4**: Utility-first styling
- **React Markdown**: Rich text rendering
- **Lucide React**: Icon library
- **Inter Font**: Clean typography

## 🔧 Configuration

### Backend Environment Variables

```env
GROQ_API_KEY=your_api_key          # Required: Groq API key
DATA_DIR=data                      # Optional: Data directory path
```

### Frontend API Configuration

Update `src/lib/api.js` if your backend runs on a different port:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## 📊 Data Format

The system expects CSV files with the following structure:

### Holdings CSV
- `PortfolioName`: Fund/portfolio identifier
- `PL_YTD`: Year-to-date profit/loss
- `Qty`: Quantity
- `MV_Base`: Market value
- Other financial metrics...

### Trades CSV
- Similar structure with trade-specific fields

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
python test_api.py

# Frontend (if tests are added)
cd frontend-next
npm test
```

### Building for Production

```bash
# Frontend production build
cd frontend-next
npm run build
npm start
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'csv_engine'`
- **Solution**: Run uvicorn from the `backend/` directory

**Problem**: No CSV files found
- **Solution**: Ensure CSV files are in `backend/data/` directory

### Frontend Issues

**Problem**: Grey/blurry text in responses
- **Solution**: Already fixed with `prose-neutral dark:prose-invert` classes

**Problem**: Page reloads on new chat
- **Solution**: Using `window.history.pushState()` instead of router navigation

**Problem**: Tables not rendering
- **Solution**: Ensure `react-markdown` and `remark-gfm` are installed

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using Next.js, FastAPI, and Groq AI**
