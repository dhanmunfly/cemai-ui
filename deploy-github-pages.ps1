# CemAI UI GitHub Pages Deployment Script
# This script deploys the built application to GitHub Pages

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "your-username",
    [Parameter(Mandatory=$false)]
    [string]$RepositoryName = "cemai-ui"
)

Write-Host "🚀 Deploying CemAI UI to GitHub Pages" -ForegroundColor Blue
Write-Host "Repository: $GitHubUsername/$RepositoryName" -ForegroundColor Blue

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ dist folder not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Create a temporary directory for deployment
$DeployDir = "deploy-temp"
if (Test-Path $DeployDir) {
    Remove-Item $DeployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $DeployDir

# Copy dist files to deploy directory
Write-Host "📦 Copying built files..." -ForegroundColor Yellow
Copy-Item "dist/*" $DeployDir -Recurse

# Create a simple index.html redirect for SPA routing
$IndexContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CemAI Control Tower</title>
    <script>
        // Simple SPA routing for GitHub Pages
        if (window.location.pathname !== '/' && !window.location.pathname.includes('.')) {
            window.location.href = '/';
        }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/assets/index-DNKEu3hX.js"></script>
</body>
</html>
"@

Set-Content -Path "$DeployDir/index.html" -Value $IndexContent

# Create a simple README for the deployment
$ReadmeContent = @"
# CemAI Control Tower UI

This is the deployed version of the CemAI Control Tower UI.

## Features
- 🤖 AI-powered decision making
- 📊 Real-time KPI monitoring
- 🎯 Glass Cockpit dashboard
- 🤝 Co-Pilot collaboration
- 🔮 Oracle AI assistance
- 🔐 Secure authentication
- 📱 Responsive design

## Demo Credentials
- Email: demo@cemai.com
- Password: demo123

## Live Demo
Visit: https://$GitHubUsername.github.io/$RepositoryName

## Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for Production
\`\`\`bash
npm run build
\`\`\`
"@

Set-Content -Path "$DeployDir/README.md" -Value $ReadmeContent

Write-Host "✅ Files prepared for deployment" -ForegroundColor Green
Write-Host "📁 Deploy files are in: $DeployDir" -ForegroundColor Green

Write-Host "`n🌐 To deploy to GitHub Pages:" -ForegroundColor Blue
Write-Host "1. Create a new repository on GitHub named '$RepositoryName'" -ForegroundColor White
Write-Host "2. Copy the contents of '$DeployDir' to your repository" -ForegroundColor White
Write-Host "3. Enable GitHub Pages in repository settings" -ForegroundColor White
Write-Host "4. Set source to 'Deploy from a branch' and select 'main'" -ForegroundColor White
Write-Host "5. Your app will be available at: https://$GitHubUsername.github.io/$RepositoryName" -ForegroundColor White

Write-Host "`n🎉 Deployment files ready!" -ForegroundColor Green
Write-Host "📂 Check the '$DeployDir' folder for files to upload to GitHub" -ForegroundColor Green
