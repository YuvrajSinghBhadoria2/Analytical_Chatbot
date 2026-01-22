# Use a single-port approach with nginx reverse proxy

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend-next/package*.json ./
RUN npm ci

COPY frontend-next/ ./
RUN npm run build

# Stage 2: Runtime with nginx + Python
FROM python:3.10-slim

WORKDIR /app

# Install nginx and Node.js
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/next.config.mjs ./frontend/
COPY --from=frontend-builder /app/frontend/src ./frontend/src

# Configure nginx
RUN echo 'server {\n\
    listen 7860;\n\
    server_name _;\n\
    \n\
    # Frontend\n\
    location / {\n\
    proxy_pass http://localhost:3000;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Upgrade $http_upgrade;\n\
    proxy_set_header Connection "upgrade";\n\
    proxy_set_header Host $host;\n\
    proxy_cache_bypass $http_upgrade;\n\
    }\n\
    \n\
    # Backend API\n\
    location /api/ {\n\
    rewrite ^/api/(.*) /$1 break;\n\
    proxy_pass http://localhost:8000;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_buffering off;\n\
    }\n\
    }' > /etc/nginx/sites-available/default

# Create startup script
RUN echo '#!/bin/bash\n\
    nginx\n\
    cd /app/backend && uvicorn main:app --host 127.0.0.1 --port 8000 &\n\
    cd /app/frontend && npm start -- -p 3000 &\n\
    wait -n\n\
    exit $?' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 7860

ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

CMD ["/app/start.sh"]
