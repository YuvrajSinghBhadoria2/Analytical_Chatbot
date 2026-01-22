<p align="center">
  <img src="https://img.shields.io/badge/Live-AWS_EC2-orange?style=for-the-badge&logo=amazon-aws" alt="AWS"/>
  <img src="https://img.shields.io/badge/Demo-Hugging_Face-yellow?style=for-the-badge&logo=huggingface" alt="HuggingFace"/>
</p>

# 💹 Analytical Finance Chatbot

> AI-powered financial data analysis chatbot with real-time streaming responses and an OpenAI-inspired interface.

<p align="center">
  <a href="http://44.222.232.223">🚀 Live Demo (AWS)</a> •
  <a href="https://huggingface.co/spaces/yuvis/Analytical_chatbot">🤗 Hugging Face</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Analysis** | Uses Groq's Llama 3.1 for intelligent financial insights |
| ⚡ **Real-time Streaming** | Server-Sent Events (SSE) for smooth response delivery |
| 📊 **Data Processing** | Analyzes CSV data (holdings & trades) with pre-computed facts |
| 🌙 **Dark Mode** | Clean, modern UI with automatic theme support |
| 💬 **Conversation History** | Persistent chat sessions with sidebar navigation |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS EC2 / HF Spaces                      │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │   Next.js 15    │◄───────►│      FastAPI Backend    │   │
│  │   (Frontend)    │   API   │   ┌─────────────────┐   │   │
│  │   Port: 3000    │         │   │   CSV Engine    │   │   │
│  └─────────────────┘         │   │   (Pandas)      │   │   │
│                              │   └─────────────────┘   │   │
│                              │   ┌─────────────────┐   │   │
│                              │   │   LLM Client    │   │   │
│                              │   │   (Groq API)    │   │   │
│                              │   └─────────────────┘   │   │
│                              └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)

### AI & Deployment
![Groq](https://img.shields.io/badge/Groq-Llama_3.1-FF6B6B?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Groq API Key](https://console.groq.com)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_key_here" > .env

# Run server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend-next
npm install
npm run dev
```

Access at: **http://localhost:3000**

---

## 💡 Example Queries

```
📈 "Which funds performed better based on yearly P&L?"
📊 "Show me the top 5 portfolios by total holdings"
🔍 "What is the total quantity for YTUM fund?"
📉 "Compare Garfield vs Heather fund performance"
```

---

## 📦 Deployment

### AWS EC2
```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ip

# Run Docker container
docker run -d -p 80:7860 \
  -e GROQ_API_KEY=your_key \
  your-ecr-image:latest
```
📖 [Full AWS Deployment Guide](./DEPLOY_AWS.md)

### Hugging Face Spaces
```bash
# Push to Hugging Face
git remote add hf https://huggingface.co/spaces/yourusername/app
git push hf main
```
📖 [Full HF Deployment Guide](./DEPLOY_AWS_FREE.md)

---

## 📁 Project Structure

```
├── backend/
│   ├── main.py           # FastAPI endpoints
│   ├── csv_engine.py     # Data processing
│   ├── llm_client.py     # Groq integration
│   └── data/             # CSV files
│
├── frontend-next/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   └── lib/          # API client
│   └── package.json
│
├── Dockerfile            # Docker build
├── deploy-aws.sh         # AWS deployment script
└── ec2-setup.sh          # EC2 setup script
```

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| 🚀 **Live Demo (AWS)** | http://44.222.232.223 |
| 🤗 **Hugging Face** | https://huggingface.co/spaces/yuvis/Analytical_chatbot |
| 📦 **GitHub** | https://github.com/YuvrajSinghBhadoria2/Analytical_Chatbot |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Built with ❤️ by Yuvraj Singh Bhadoria</b><br>
  <sub>FastAPI • Next.js • Groq AI • Docker • AWS</sub>
</p>
