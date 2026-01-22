#!/bin/bash
# EC2 Setup Script - Run this ON YOUR EC2 INSTANCE after SSH

set -e

echo "🚀 Setting up Analytical Chatbot on EC2"
echo "========================================"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y docker.io git awscli

# Start Docker
echo "▶️  Starting Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

echo ""
echo "✅ Docker installed successfully!"
echo ""
echo "⚠️  IMPORTANT: You need to logout and login again for Docker permissions"
echo ""
echo "After re-login, run the following commands:"
echo ""
echo "# Configure AWS credentials"
echo "aws configure"
echo ""
echo "# Login to ECR"
echo "aws ecr get-login-password --region us-east-1 | \\"
echo "  docker login --username AWS --password-stdin \\"
echo "  052443863008.dkr.ecr.us-east-1.amazonaws.com"
echo ""
echo "# Pull the image"
echo "docker pull 052443863008.dkr.ecr.us-east-1.amazonaws.com/analytical-chatbot:latest"
echo ""
echo "# Run the container"
echo "docker run -d \\"
echo "  --name analytical-chatbot \\"
echo "  --restart unless-stopped \\"
echo "  -p 80:7860 \\"
echo "  -e GROQ_API_KEY=your_groq_api_key_here \\"
echo "  052443863008.dkr.ecr.us-east-1.amazonaws.com/analytical-chatbot:latest"
echo ""
echo "# Check if running"
echo "docker ps"
echo "docker logs analytical-chatbot"
