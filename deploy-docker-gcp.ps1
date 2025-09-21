# CemAI UI Docker Deployment Script for GCP
# This script deploys the CemAI UI to GCP using Docker, Artifact Registry, and Cloud Run

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "gcp-hackathon-25",
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "cemai-ui",
    [Parameter(Mandatory=$false)]
    [string]$ImageName = "cemai-ui"
)

# Configuration
$REPOSITORY_NAME = "cemai-infrastructure-ui"
$TAG = "latest"

Write-Host "🚀 Starting CemAI UI Docker Deployment to GCP" -ForegroundColor Blue
Write-Host "Project ID: $ProjectId" -ForegroundColor Blue
Write-Host "Region: $Region" -ForegroundColor Blue
Write-Host "Service: $ServiceName" -ForegroundColor Blue
Write-Host "Repository: $REPOSITORY_NAME" -ForegroundColor Blue

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
    Write-Host "📋 Setting GCP project to $ProjectId..." -ForegroundColor Yellow
    gcloud config set project $ProjectId
    Write-Host "✅ Project set to $ProjectId" -ForegroundColor Green
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
    $repoExists = gcloud artifacts repositories describe $REPOSITORY_NAME --location=$Region 2>$null
    if (-not $repoExists) {
        Write-Host "📦 Creating Artifact Registry repository..." -ForegroundColor Yellow
        gcloud artifacts repositories create $REPOSITORY_NAME `
            --repository-format=docker `
            --location=$Region `
            --description="CemAI Infrastructure UI Docker images"
        Write-Host "✅ Repository created" -ForegroundColor Green
    } else {
        Write-Host "✅ Repository already exists" -ForegroundColor Green
    }
}

# Function to configure Docker authentication
function Configure-Docker {
    Write-Host "🐳 Configuring Docker authentication..." -ForegroundColor Yellow
    gcloud auth configure-docker "${Region}-docker.pkg.dev"
    Write-Host "✅ Docker authentication configured" -ForegroundColor Green
}

# Function to build and push Docker image
function Build-And-Push {
    Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
    
    # Build the image
    $ImageTag = "${Region}-docker.pkg.dev/${ProjectId}/${REPOSITORY_NAME}/${ImageName}:${TAG}"
    Write-Host "Building image: $ImageTag" -ForegroundColor Cyan
    
    docker build -t $ImageTag .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker build failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Docker image built successfully" -ForegroundColor Green
    
    Write-Host "📤 Pushing Docker image..." -ForegroundColor Yellow
    docker push $ImageTag
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker push failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Docker image pushed successfully" -ForegroundColor Green
}

# Function to deploy to Cloud Run
function Deploy-To-CloudRun {
    Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow
    
    $ImageTag = "${Region}-docker.pkg.dev/${ProjectId}/${REPOSITORY_NAME}/${ImageName}:${TAG}"
    
    gcloud run deploy $ServiceName `
        --image=$ImageTag `
        --region=$Region `
        --platform=managed `
        --allow-unauthenticated `
        --memory=1Gi `
        --cpu=1 `
        --concurrency=100 `
        --max-instances=10 `
        --min-instances=0 `
        --set-env-vars="API_BASE_URL=https://api-dev.cemai.com,WS_URL=wss://ws-dev.cemai.com,APP_ENV=production" `
        --port=80 `
        --timeout=300 `
        --quiet
        
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Cloud Run deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Cloud Run deployment completed" -ForegroundColor Green
}

# Function to get service URL
function Get-ServiceUrl {
    Write-Host "🌐 Getting service URL..." -ForegroundColor Yellow
    $SERVICE_URL = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Service URL: $SERVICE_URL" -ForegroundColor Green
    Write-Host "📱 Open the URL in your browser to see the CemAI Control Tower UI" -ForegroundColor Cyan
}

# Main deployment flow
function Main {
    Write-Host "🎯 CemAI Control Tower UI Docker Deployment" -ForegroundColor Blue
    Write-Host "=============================================" -ForegroundColor Blue
    
    Check-Auth
    Set-Project
    Enable-APIs
    Create-Repository
    Configure-Docker
    Build-And-Push
    Deploy-To-CloudRun
    Get-ServiceUrl
    
    Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🔗 Your CemAI Control Tower UI is now live on Google Cloud Run!" -ForegroundColor Green
}

# Run main function
Main
