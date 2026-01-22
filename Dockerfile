# Multi-stage build for production

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend-next/package*.json ./
RUN npm ci

COPY frontend-next/ ./
RUN npm run build

# Stage 2: Backend + Serve Frontend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Create startup script
RUN echo '#!/bin/bash\n\
    cd /app/backend && uvicorn main:app --host 0.0.0.0 --port 8000 &\n\
    cd /app/frontend && npm start -- -p 7860\n\
    wait' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 7860

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# Start both services
CMD ["/app/start.sh"]
