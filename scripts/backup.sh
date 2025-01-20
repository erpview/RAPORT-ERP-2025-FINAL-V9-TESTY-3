#!/bin/bash

# Get current timestamp for backup name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
BACKUP_NAME="backup_$TIMESTAMP"

# Create backups directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create temporary directory for this backup
TEMP_DIR="/tmp/$BACKUP_NAME"
mkdir -p "$TEMP_DIR"

# Copy all project files except node_modules and backups
echo "Copying all project files..."
rsync -av --exclude='node_modules' --exclude='backups' . "$TEMP_DIR/"

# Create database backup using Supabase
echo "Creating database backup..."
if [ -f .env ]; then
    source .env
    if [ ! -z "$SUPABASE_PROJECT_ID" ] && [ ! -z "$SUPABASE_ACCESS_TOKEN" ]; then
        curl -X POST "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID/database/backup" \
            -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            > "$TEMP_DIR/db_backup.sql" 2>/dev/null || echo "Failed to backup database. Please ensure SUPABASE_PROJECT_ID and SUPABASE_ACCESS_TOKEN are set correctly in .env"
    else
        echo "Skipping database backup - Supabase credentials not found in .env"
    fi
else
    echo "Skipping database backup - .env file not found"
fi

# Create a compressed archive
echo "Creating compressed backup archive..."
cd /tmp
tar -czf "$OLDPWD/$BACKUP_DIR/${BACKUP_NAME}.tar.gz" $BACKUP_NAME
cd "$OLDPWD"

# Clean up
rm -rf "$TEMP_DIR"

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
