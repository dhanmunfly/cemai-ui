# CemAI UI Deployment Guide
# Complete guide for deploying CemAI Control Tower UI to GCP

## Prerequisites

### 1. GCP Setup
- GCP Project: `cemai-project`
- Region: `us-central1`
- Service Account with required permissions
- Docker installed locally
- gcloud CLI installed and authenticated

### 2. Required GCP APIs
- Cloud Build API
- Cloud Run API
- Artifact Registry API

### 3. Local Dependencies
- Node.js 18+
- Docker
- Git

## Quick Start

### Option 1: Using the Deployment Script (Recommended)

#### For Linux/Mac:
```bash
# Make script executable
chmod +x deploy.sh

# Deploy to development
./deploy.sh dev

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh prod
```

#### For Windows PowerShell:
```powershell
# Deploy to development
.\deploy.ps1 -Environment dev

# Deploy to staging
.\deploy.ps1 -Environment staging

# Deploy to production
.\deploy.ps1 -Environment prod
```

### Option 2: Manual Deployment

#### Step 1: Build and Push Docker Image
```bash
# Set environment variables
export PROJECT_ID=cemai-project
export REGION=us-central1
export REPOSITORY_NAME=cemai-infrastructure-ui-dev
export IMAGE_NAME=cemai-ui
export TAG=latest

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG} .
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG}
```

#### Step 2: Deploy to Cloud Run
```bash
gcloud run deploy cemai-infrastructure-ui-dev \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:${TAG} \
  --region=${REGION} \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=100 \
  --max-instances=10 \
  --min-instances=1 \
  --set-env-vars="API_BASE_URL=https://api-dev.cemai.com,WS_URL=wss://ws-dev.cemai.com,APP_ENV=development" \
  --port=80 \
  --timeout=300
```

## Environment Configuration

### Development Environment
- API Base URL: `https://api-dev.cemai.com`
- WebSocket URL: `wss://ws-dev.cemai.com`
- Environment: `development`
- Mock Data: Enabled
- Debug Tools: Enabled

### Staging Environment
- API Base URL: `https://api-staging.cemai.com`
- WebSocket URL: `wss://ws-staging.cemai.com`
- Environment: `staging`
- Mock Data: Disabled
- Debug Tools: Disabled

### Production Environment
- API Base URL: `https://api.cemai.com`
- WebSocket URL: `wss://ws.cemai.com`
- Environment: `production`
- Mock Data: Disabled
- Debug Tools: Disabled

## CI/CD Pipeline

### Using Cloud Build
The project includes a `cloudbuild.yaml` file for automated CI/CD:

```bash
# Trigger build manually
gcloud builds submit --config cloudbuild.yaml

# Set up automatic triggers
gcloud builds triggers create github \
  --repo-name=cemai-ui \
  --repo-owner=cemai-team \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

### GitHub Actions (Alternative)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCP Cloud Run

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: cemai-project
      - name: Deploy
        run: ./deploy.sh dev
```

## Monitoring and Health Checks

### Health Check Endpoint
The application exposes a health check endpoint at `/health` that returns:
- Status: `healthy`
- Timestamp
- Version information

### Cloud Run Health Checks
- Liveness Probe: `/health` endpoint
- Readiness Probe: `/health` endpoint
- Initial Delay: 30 seconds
- Period: 10 seconds
- Timeout: 5 seconds
- Failure Threshold: 3

## Security Configuration

### Security Headers
The nginx configuration includes:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content Security Policy

### CORS Configuration
- Configured for API proxy
- WebSocket support enabled
- Credentials handling

## Performance Optimization

### Caching Strategy
- Static assets: 1 year cache
- HTML files: 1 hour cache
- API responses: 5 minutes cache

### Compression
- Gzip compression enabled
- Compression level: 6
- Minimum file size: 1024 bytes

### Resource Limits
- Memory: 512Mi
- CPU: 1 core
- Concurrency: 100 requests
- Max instances: 10
- Min instances: 1

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Re-authenticate with GCP
gcloud auth login
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

#### 2. Permission Errors
```bash
# Check required permissions
gcloud projects get-iam-policy cemai-project
```

#### 3. Build Failures
```bash
# Check build logs
gcloud builds log [BUILD_ID]
```

#### 4. Deployment Failures
```bash
# Check Cloud Run logs
gcloud run services logs cemai-infrastructure-ui-dev --region=us-central1
```

### Debug Commands

#### Check Service Status
```bash
gcloud run services describe cemai-infrastructure-ui-dev --region=us-central1
```

#### View Logs
```bash
gcloud run services logs cemai-infrastructure-ui-dev --region=us-central1 --follow
```

#### Test Health Endpoint
```bash
curl -f https://cemai-infrastructure-ui-dev-cemai-project.us-central1.run.app/health
```

## Rollback Strategy

### Rollback to Previous Version
```bash
# List revisions
gcloud run revisions list --service=cemai-infrastructure-ui-dev --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic cemai-infrastructure-ui-dev \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

### Emergency Rollback
```bash
# Deploy previous known good image
gcloud run deploy cemai-infrastructure-ui-dev \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:PREVIOUS_TAG \
  --region=${REGION}
```

## Cost Optimization

### Resource Optimization
- Use appropriate memory/CPU limits
- Set minimum instances to 0 for dev/staging
- Use Cloud Run's automatic scaling

### Monitoring Costs
```bash
# View Cloud Run costs
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID
```

## Support and Maintenance

### Regular Maintenance Tasks
1. Update base images monthly
2. Monitor security advisories
3. Review and update dependencies
4. Check performance metrics
5. Validate health checks

### Contact Information
- Support Email: support@cemai.com
- Documentation: https://docs.cemai.com
- Issue Tracker: GitHub Issues

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

