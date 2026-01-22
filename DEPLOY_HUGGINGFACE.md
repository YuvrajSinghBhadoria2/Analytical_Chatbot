# Deploying to Hugging Face Spaces

This guide will help you deploy the Analytical Finance Chatbot to Hugging Face Spaces.

## Prerequisites

1. **Hugging Face Account**: Sign up at [huggingface.co](https://huggingface.co)
2. **Groq API Key**: Get one from [console.groq.com](https://console.groq.com)

## Step 1: Create a New Space

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Fill in the details:
   - **Space name**: `analytical-finance-chatbot` (or your choice)
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU basic (free tier)
4. Click **"Create Space"**

## Step 2: Push Your Code

### Option A: Using Git (Recommended)

```bash
# Add Hugging Face remote
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/analytical-finance-chatbot

# Rename README for Hugging Face
mv README.md README_GITHUB.md
mv README_HF.md README.md

# Commit the Hugging Face config
git add README.md Dockerfile backend/requirements.txt backend/.env.example
git commit -m "Add Hugging Face deployment configuration"

# Push to Hugging Face
git push hf main
```

### Option B: Using Hugging Face Web Interface

1. Go to your Space's **"Files"** tab
2. Click **"Add file"** → **"Upload files"**
3. Upload these files:
   - `README.md` (rename README_HF.md to README.md)
   - `Dockerfile`
   - All `backend/` files
   - All `frontend-next/` files
4. Commit the changes

## Step 3: Configure Secrets

1. In your Space, go to **"Settings"** tab
2. Scroll to **"Repository secrets"**
3. Add a new secret:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key
4. Click **"Add secret"**

## Step 4: Update API URL in Frontend

Before deploying, update the API URL in `frontend-next/src/lib/api.js`:

```javascript
// Change from:
const API_BASE_URL = 'http://localhost:8000';

// To:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

Then set the environment variable in Hugging Face:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `http://localhost:8000` (backend runs on same container)

## Step 5: Wait for Build

1. Hugging Face will automatically build your Docker image
2. This may take 5-10 minutes
3. Watch the build logs in the **"Logs"** tab
4. Once complete, your app will be live!

## Step 6: Access Your App

Your app will be available at:
```
https://huggingface.co/spaces/YOUR_USERNAME/analytical-finance-chatbot
```

## Troubleshooting

### Build Fails

**Check logs** in the "Logs" tab. Common issues:
- Missing dependencies in `requirements.txt`
- Incorrect Dockerfile syntax
- Port conflicts (ensure using 7860)

### App Doesn't Load

1. Check if both services started (backend + frontend)
2. Verify `GROQ_API_KEY` is set in secrets
3. Check browser console for errors

### API Errors

1. Ensure backend is running on port 8000
2. Verify frontend is connecting to correct API URL
3. Check CORS settings in `backend/main.py`

## Updating Your Space

To update your deployed app:

```bash
# Make changes locally
git add .
git commit -m "Update: description of changes"

# Push to Hugging Face
git push hf main
```

Hugging Face will automatically rebuild and redeploy.

## Cost & Limits

- **Free tier**: CPU basic (sufficient for demo)
- **Upgrade**: For production, consider upgrading to GPU or better CPU
- **Persistent storage**: Conversations are stored in memory (lost on restart)

## Next Steps

Consider adding:
- Persistent database (PostgreSQL on external service)
- Authentication
- Rate limiting
- Analytics

---

**Need help?** Check [Hugging Face Spaces documentation](https://huggingface.co/docs/hub/spaces)
