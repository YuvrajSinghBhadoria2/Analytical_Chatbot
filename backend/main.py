from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from csv_engine import CSVEngine
from llm_client import LLMClient
import os
import json
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

# Memory storage for conversations
conversations = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if not engine.load_all_csvs():
        print("Warning: No CSV files found.")
    if not engine.validate_schema():
        print("Warning: CSV files are invalid or empty.")
    yield
    # Shutdown

app = FastAPI(title="Analytical Chatbot API", lifespan=lifespan)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

class OldChatResponse(BaseModel):
    answer: str

DATA_DIR = os.getenv("DATA_DIR", "data")
engine = CSVEngine(DATA_DIR)
llm = LLMClient()

# --- Compatibility Endpoints for DevoChat UI ---

@app.get("/auth/status")
async def auth_status():
    return {"logged_in": True, "user": {"id": "user_123", "username": "admin", "role": "admin"}}

@app.get("/auth/user")
async def auth_user():
    return {"id": "user_123", "username": "admin", "role": "admin"}

@app.get("/chat_models")
async def chat_models():
    return {
        "default": "analytical",
        "models": [{
            "model_name": "analytical",
            "model_alias": "Analytical Engine",
            "capabilities": {"stream": True, "inference": False, "search": False, "deep_research": False, "image": False, "mcp": False},
            "controls": {"temperature": True, "reason": True, "verbosity": True, "system_message": True},
            "billing": {"in_billing": 0, "out_billing": 0},
            "description": "Financial Analysis Engine",
            "endpoint": "/chat/conversation"
        }]
    }

@app.get("/image_models")
async def image_models():
    return {"default": None, "models": []}

@app.get("/realtime_models")
async def realtime_models():
    return {"default": None, "models": []}

@app.get("/notice")
async def get_notice():
    return {"message": "Welcome to the Analytical Finance Chatbot!", "hash": "v1"}

@app.post("/chat/new_conversation")
async def new_conversation():
    conversation_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    conversations[conversation_id] = {
        "conversation_id": conversation_id,
        "messages": [],
        "created_at": now,
        "updated_at": now,
        "model": "analytical"
    }
    return conversations[conversation_id]

@app.get("/conversation/all")
async def get_all_conversations():
    return list(conversations.values())

@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversations[conversation_id]

@app.post("/chat/get_alias")
async def get_alias(request: dict):
    # Simple alias generator: take first 20 chars of the text
    text = request.get("text", "New Conversation")
    alias = text[:20] + "..." if len(text) > 20 else text
    return {"alias": alias}

# --- Core Analytical Chat Endpoint (Streaming version for DevoChat) ---

class DevoChatRequest(BaseModel):
    conversation_id: str
    user_message: list # List of dicts with 'text' or 'image'

async def stream_analytical_response(question: str, conversation_id: str):
    try:
        # Get facts and schema
        facts_text = engine.get_analytical_facts(question)
        sample = engine.get_schema_sample()
        
        # Get answer from LLM
        # Note: Our current LLMClient doesn't support streaming from Groq yet, 
        # so we'll simulate streaming for the UI.
        full_answer = llm.get_answer(sample, question, facts_text)
        
        # Update history
        if conversation_id in conversations:
            conversations[conversation_id]["messages"].append({"role": "user", "content": question})
            conversations[conversation_id]["messages"].append({"role": "assistant", "content": full_answer})
            conversations[conversation_id]["updated_at"] = datetime.now().isoformat()

        # Stream chunks to the UI
        # DevoChat expects "data: {\"content\": \"...\"}\n\n"
        chunk_size = 20
        for i in range(0, len(full_answer), chunk_size):
            chunk = full_answer[i:i+chunk_size]
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.post("/chat/conversation")
async def chat_conversation(request: DevoChatRequest):
    conversation_id = request.conversation_id
    # Extract the text message from the list
    user_text = ""
    for item in request.user_message:
        if item.get("type") == "text":
            user_text = item.get("text")
            break
    
    if not user_text:
        raise HTTPException(status_code=400, detail="No text message found")

    return StreamingResponse(
        stream_analytical_response(user_text, conversation_id),
        media_type="text/event-stream"
    )

# --- Keep original endpoint for compatibility ---
@app.post("/chat", response_model=OldChatResponse)
async def chat_legacy(request: ChatRequest):
    facts_text = engine.get_analytical_facts(request.question)
    sample = engine.get_schema_sample()
    answer = llm.get_answer(sample, request.question, facts_text)
    return OldChatResponse(answer=answer)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
