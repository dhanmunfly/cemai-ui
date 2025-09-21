#!/bin/bash

# CemAI UI Deployment Script for GCP
# This script handles building, pushing, and deploying the CemAI Control Tower UI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-"cemai-project"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"cemai-infrastructure-ui-dev"}
IMAGE_NAME="cemai-ui"
REPOSITORY_NAME="cemai-infrastructure-ui-dev"

# Environment-specific settings
ENVIRONMENT=${1:-"dev"}
case $ENVIRONMENT in
  "dev")
    API_BASE_URL="https://api-dev.cemai.com"
    WS_URL="wss://ws-dev.cemai.com"
    APP_ENV="development"
    ;;
  "staging")
    API_BASE_URL="https://api-staging.cemai.com"
    WS_URL="wss://ws-staging.cemai.com"
    APP_ENV="staging"
    ;;
  "prod")
    API_BASE_URL="https://api.cemai.com"
    WS_URL="wss://ws.cemai.com"
    APP_ENV="production"
    ;;
  *)
    echo -e "${RED}Error: Invalid environment. Use 'dev', 'staging', or 'prod'${NC}"
    exit 1
    ;;
esac

# Get current commit SHA for tagging
COMMIT_SHA=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="${COMMIT_SHA}-${TIMESTAMP}"

echo -e "${BLUE}🚀 Starting CemAI UI deployment to ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Service: ${SERVICE_NAME}${NC}"
echo -e "${BLUE}Tag: ${TAG}${NC}"

# Function to check if gcloud is authenticated
check_auth() {
  echo -e "${YELLOW}🔐 Checking GCP authentication...${NC}"
  if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Not authenticated with GCP. Please run 'gcloud auth login'${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ GCP authentication verified${NC}"
}

# Function to set project
set_project() {
  echo -e "${YELLOW}📋 Setting GCP project...${NC}"
  gcloud config set project $PROJECT_ID
  echo -e "${GREEN}✅ Project set to ${PROJECT_ID}${NC}"
}

# Function to enable required APIs
enable_apis() {
  echo -e "${YELLOW}🔧 Enabling required GCP APIs...${NC}"
  gcloud services enable cloudbuild.googleapis.com
  gcloud services enable run.googleapis.com
  gcloud services enable artifactregistry.googleapis.com
  echo -e "${GREEN}✅ Required APIs enabled${NC}"
}

# Function to create Artifact Registry repository if it doesn't exist
create_repository() {
  echo -e "${YELLOW}📦 Checking Artifact Registry repository...${NC}"
  if ! gcloud artifacts repositories describe $REPOSITORY_NAME --location=$REGION >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Creating Artifact Registry repository...${NC}"
    gcloud artifacts repositories create $REPOSITORY_NAME \
      --repository-format=docker \
      --location=$REGION \
      --description="CemAI Infrastructure UI Docker images"
    echo -e "${GREEN}✅ Repository created${NC}"
  else
    echo -e "${GREEN}✅ Repository already exists${NC}"
  fi
}

# Function to configure Docker authentication
configure_docker() {
  echo -e "${YELLOW}🐳 Configuring Docker authentication...${NC}"
  gcloud auth configure-docker ${REGION}-docker.pkg.dev
  echo -e "${GREEN}✅ Docker authentication configured${NC}"
}

# Function to build and push Docker image
build_and_push() {
  echo -e "${YELLOW}🔨 Building Docker image...${NC}"
  
  # Build the image
  docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG} .
  docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest .
  
  echo -e "${GREEN}✅ Docker image built${NC}"
  
  echo -e "${YELLOW}📤 Pushing Docker image...${NC}"
  docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}
  docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest
  
  echo -e "${GREEN}✅ Docker image pushed${NC}"
}

# Function to deploy to Cloud Run
deploy_to_cloud_run() {
  echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
  
  gcloud run deploy $SERVICE_NAME \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG} \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --concurrency=100 \
    --max-instances=10 \
    --min-instances=1 \
    --set-env-vars="API_BASE_URL=${API_BASE_URL},WS_URL=${WS_URL},APP_ENV=${APP_ENV},APP_VERSION=${TAG}" \
    --port=80 \
    --timeout=300 \
    --quiet
    
  echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Function to get service URL
get_service_url() {
  SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
  echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
}

# Function to run health check
health_check() {
  echo -e "${YELLOW}🏥 Running health check...${NC}"
  SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
  
  # Wait a bit for the service to be ready
  sleep 10
  
  if curl -f "${SERVICE_URL}/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
  else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
  fi
}

# Main deployment flow
main() {
  echo -e "${BLUE}🎯 CemAI Control Tower UI Deployment${NC}"
  echo -e "${BLUE}=====================================${NC}"
  
  check_auth
  set_project
  enable_apis
  create_repository
  configure_docker
  build_and_push
  deploy_to_cloud_run
  get_service_url
  health_check
  
  echo -e "${GREEN}🎉 Deployment successful!${NC}"
  echo -e "${GREEN}Service is running at: ${SERVICE_URL}${NC}"
}

# Run main function
main "$@"

