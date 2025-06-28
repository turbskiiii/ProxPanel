#!/bin/bash

set -e

echo "🚀 Starting ProxPanel production deployment..."

# Check if required environment variables are set
required_vars=("DB_USER" "DB_PASSWORD" "DB_NAME" "DB_ROOT_PASSWORD" "JWT_SECRET" "PROXMOX_HOST" "PROXMOX_USERNAME" "PROXMOX_PASSWORD")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create necessary directories
mkdir -p logs ssl

# Generate SSL certificates if they don't exist
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "🔐 Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "✅ SSL certificates generated"
fi

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout=300
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
        echo "✅ Services are healthy"
        break
    fi
    
    echo "Waiting for services... ($elapsed/$timeout seconds)"
    sleep 10
    elapsed=$((elapsed + 10))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Services failed to become healthy within $timeout seconds"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Run health check
echo "🏥 Running health check..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

echo "🎉 ProxPanel deployed successfully!"
echo "📊 Access the dashboard at: https://localhost"
echo "📋 View logs with: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down"
