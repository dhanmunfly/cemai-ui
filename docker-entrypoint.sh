#!/bin/sh

# Docker entrypoint script for environment variable substitution
# This allows runtime configuration of the frontend without rebuilding

set -e

# Default values
export API_BASE_URL=${API_BASE_URL:-"https://api-dev.cemai.com"}
export WS_URL=${WS_URL:-"wss://ws-dev.cemai.com"}
export APP_ENV=${APP_ENV:-"development"}
export APP_VERSION=${APP_VERSION:-"1.0.0"}

echo "Starting CemAI Control Tower UI..."
echo "API Base URL: $API_BASE_URL"
echo "WebSocket URL: $WS_URL"
echo "Environment: $APP_ENV"
echo "Version: $APP_VERSION"

# Substitute environment variables in the built files
# This is a simple approach - for production, consider using envsubst or similar
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__API_BASE_URL__|$API_BASE_URL|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__WS_URL__|$WS_URL|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__APP_ENV__|$APP_ENV|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__APP_VERSION__|$APP_VERSION|g" {} \;

# Start nginx
exec "$@"

