#!/bin/bash

# Devloo Hosting Deployment Script
set -e

echo "🚀 Starting Devloo Hosting deployment..."

# Check if required environment variables are set
required_vars=("DB_HOST" "DB_PASSWORD" "JWT_SECRET" "PROXMOX_HOST" "PROXMOX_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

# Build and deploy with Docker Compose
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🗄️ Setting up database..."
docker-compose up -d mysql
sleep 30  # Wait for MySQL to be ready

echo "🔧 Running database migrations..."
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD vps_manager < scripts/create-database.sql

echo "🚀 Starting all services..."
docker-compose up -d

echo "🔍 Checking service health..."
sleep 10

# Health checks
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
    docker-compose logs app
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Application is running at: http://localhost:3000"
echo "🔧 Admin panel: http://localhost:3000/dashboard"
