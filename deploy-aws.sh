#!/bin/bash
# AWS Deployment Script - Analytical Finance Chatbot
# This script automates deployment to AWS App Runner

set -e  # Exit on error

echo "🚀 AWS Deployment Script"
echo "========================"
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
REPO_NAME="analytical-chatbot"
SERVICE_NAME="analytical-chatbot"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install it with: brew install awscli"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

echo -e "${YELLOW}📋 Checking AWS credentials...${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)

if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS Account ID: $ACCOUNT_ID${NC}"
echo ""

# Create ECR repository
echo -e "${YELLOW}📦 Creating ECR repository...${NC}"
aws ecr create-repository \
    --repository-name $REPO_NAME \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null || echo "Repository already exists"

# Login to ECR
echo -e "${YELLOW}🔐 Logging in to ECR...${NC}"
aws ecr get-login-password --region $REGION | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker build -t $REPO_NAME .

# Tag image
echo -e "${YELLOW}🏷️  Tagging image...${NC}"
docker tag $REPO_NAME:latest \
    $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest

# Push to ECR
echo -e "${YELLOW}⬆️  Pushing to ECR...${NC}"
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest

echo ""
echo -e "${GREEN}✅ Docker image successfully pushed to ECR!${NC}"
echo ""
echo "📦 Image URI:"
echo "   $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Go to AWS App Runner Console:"
echo "   https://console.aws.amazon.com/apprunner/home?region=$REGION"
echo ""
echo "2. Click 'Create service'"
echo ""
echo "3. Configure:"
echo "   - Repository type: Container registry"
echo "   - Provider: Amazon ECR"
echo "   - Container image URI: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"
echo "   - Port: 7860"
echo ""
echo "4. Add environment variable:"
echo "   - Name: GROQ_API_KEY"
echo "   - Value: your_groq_api_key"
echo ""
echo "5. Click 'Create & deploy'"
echo ""
echo -e "${GREEN}🎉 Deployment will be ready in ~5 minutes!${NC}"
