#!/bin/bash

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="proxpanel_backup_$TIMESTAMP.sql"

echo "🗄️ Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
    -u root -p${DB_ROOT_PASSWORD} \
    --single-transaction \
    --routines \
    --triggers \
    ${DB_NAME} > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Database backup completed: $BACKUP_DIR/$BACKUP_FILE.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "proxpanel_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"
