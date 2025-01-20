#!/bin/bash

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Please provide the backup file to restore"
    echo "Usage: ./restore.sh backups/backup_20230101_120000.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
TEMP_DIR="temp_restore"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create temporary directory
mkdir -p $TEMP_DIR

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C $TEMP_DIR

# Get the extracted directory name
BACKUP_DIR=$(ls $TEMP_DIR)

# Stop the development server if it's running
echo "Stopping development server if running..."
pkill -f "vite" || true

# Backup current .env file
if [ -f .env ]; then
    cp .env .env.backup
    echo "Current .env backed up to .env.backup"
fi

# Restore files
echo "Restoring files..."
cp -r "$TEMP_DIR/$BACKUP_DIR/src" .
cp -r "$TEMP_DIR/$BACKUP_DIR/public" . 2>/dev/null || true
cp "$TEMP_DIR/$BACKUP_DIR/package.json" .
cp "$TEMP_DIR/$BACKUP_DIR/package-lock.json" . 2>/dev/null || true
cp "$TEMP_DIR/$BACKUP_DIR/yarn.lock" . 2>/dev/null || true
cp "$TEMP_DIR/$BACKUP_DIR/.env" .
cp "$TEMP_DIR/$BACKUP_DIR/vite.config.ts" . 2>/dev/null || true
cp "$TEMP_DIR/$BACKUP_DIR/tsconfig.json" . 2>/dev/null || true

# Restore database if backup exists
if [ -f "$TEMP_DIR/$BACKUP_DIR/db_backup.sql" ]; then
    echo "Restoring database..."
    if [ -f .env ]; then
        source .env
        if [ ! -z "$SUPABASE_PROJECT_ID" ] && [ ! -z "$SUPABASE_ACCESS_TOKEN" ]; then
            curl -X POST "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID/database/restore" \
                -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
                -H "Content-Type: application/json" \
                -d @"$TEMP_DIR/$BACKUP_DIR/db_backup.sql" || echo "Failed to restore database"
        else
            echo "Skipping database restore - Supabase credentials not found in .env"
        fi
    else
        echo "Skipping database restore - .env file not found"
    fi
fi

# Clean up
echo "Cleaning up..."
rm -rf $TEMP_DIR

# Reinstall dependencies
echo "Reinstalling dependencies..."
if [ -f yarn.lock ]; then
    yarn install
elif [ -f package-lock.json ]; then
    npm ci
else
    npm install
fi

echo "Restore completed!"
echo "You may need to restart your development server"
