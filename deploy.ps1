# CemAI UI Quick Deploy Script for Windows PowerShell
# This script provides a simplified deployment process for Windows users

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev"
)

# Configuration
$PROJECT_ID = "cemai-project"
$REGION = "us-central1"
$SERVICE_NAME = "cemai-infrastructure-ui-dev"
$IMAGE_NAME = "cemai-ui"
$REPOSITORY_NAME = "cemai-infrastructure-ui-dev"

# Environment-specific settings
switch ($Environment) {
    "dev" {
        $API_BASE_URL = "https://api-dev.cemai.com"
        $WS_URL = "wss://ws-dev.cemai.com"
        $APP_ENV = "development"
    }
    "staging" {
        $API_BASE_URL = "https://api-staging.cemai.com"
        $WS_URL = "wss://ws-staging.cemai.com"
        $APP_ENV = "staging"
    }
    "prod" {
        $API_BASE_URL = "https://api.cemai.com"
        $WS_URL = "wss://ws.cemai.com"
        $APP_ENV = "production"
    }
}

# Get current commit SHA for tagging
$COMMIT_SHA = (git rev-parse --short HEAD)
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$TAG = "${COMMIT_SHA}-${TIMESTAMP}"

Write-Host "🚀 Starting CemAI UI deployment to $Environment" -ForegroundColor Blue
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Blue
Write-Host "Region: $REGION" -ForegroundColor Blue
Write-Host "Service: $SERVICE_NAME" -ForegroundColor Blue
Write-Host "Tag: $TAG" -ForegroundColor Blue

# Function to check if gcloud is authenticated
function Check-Auth {
    Write-Host "🔐 Checking GCP authentication..." -ForegroundColor Yellow
    $activeAccounts = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if (-not $activeAccounts) {
        Write-Host "❌ Not authenticated with GCP. Please run 'gcloud auth login'" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ GCP authentication verified" -ForegroundColor Green
}

# Function to set project
function Set-Project {
    Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
    gcloud config set project $PROJECT_ID
    Write-Host "✅ Project set to $PROJECT_ID" -ForegroundColor Green
}

# Function to enable required APIs
function Enable-APIs {
    Write-Host "🔧 Enabling required GCP APIs..." -ForegroundColor Yellow
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    Write-Host "✅ Required APIs enabled" -ForegroundColor Green
}

# Function to create Artifact Registry repository if it doesn't exist
function Create-Repository {
    Write-Host "📦 Checking Artifact Registry repository..." -ForegroundColor Yellow
    $repoExists = gcloud artifacts repositories describe $REPOSITORY_NAME --location=$REGION 2>$null
    if (-not $repoExists) {
        Write-Host "📦 Creating Artifact Registry repository..." -ForegroundColor Yellow
        gcloud artifacts repositories create $REPOSITORY_NAME `
            --repository-format=docker `
            --location=$REGION `
            --description="CemAI Infrastructure UI Docker images"
        Write-Host "✅ Repository created" -ForegroundColor Green
    } else {
        Write-Host "✅ Repository already exists" -ForegroundColor Green
    }
}

# Function to configure Docker authentication
function Configure-Docker {
    Write-Host "🐳 Configuring Docker authentication..." -ForegroundColor Yellow
    gcloud auth configure-docker "${REGION}-docker.pkg.dev"
    Write-Host "✅ Docker authentication configured" -ForegroundColor Green
}

# Function to build and push Docker image
function Build-And-Push {
    Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
    
    # Build the image
    docker build -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}" .
    docker build -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest" .
    
    Write-Host "✅ Docker image built" -ForegroundColor Green
    
    Write-Host "📤 Pushing Docker image..." -ForegroundColor Yellow
    docker push "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}"
    docker push "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest"
    
    Write-Host "✅ Docker image pushed" -ForegroundColor Green
}

# Function to deploy to Cloud Run
function Deploy-To-CloudRun {
    Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow
    
    gcloud run deploy $SERVICE_NAME `
        --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}" `
        --region=$REGION `
        --platform=managed `
        --allow-unauthenticated `
        --memory=512Mi `
        --cpu=1 `
        --concurrency=100 `
        --max-instances=10 `
        --min-instances=1 `
        --set-env-vars="API_BASE_URL=${API_BASE_URL},WS_URL=${WS_URL},APP_ENV=${APP_ENV},APP_VERSION=${TAG}" `
        --port=80 `
        --timeout=300 `
        --quiet
        
    Write-Host "✅ Deployment completed" -ForegroundColor Green
}

# Function to get service URL
function Get-ServiceUrl {
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
    Write-Host "🌐 Service URL: $SERVICE_URL" -ForegroundColor Green
}

# Main deployment flow
function Main {
    Write-Host "🎯 CemAI Control Tower UI Deployment" -ForegroundColor Blue
    Write-Host "=====================================" -ForegroundColor Blue
    
    Check-Auth
    Set-Project
    Enable-APIs
    Create-Repository
    Configure-Docker
    Build-And-Push
    Deploy-To-CloudRun
    Get-ServiceUrl
    
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
}

# Run main function
Main

