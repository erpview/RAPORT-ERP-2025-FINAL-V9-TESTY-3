#!/bin/bash

print_usage() {
    echo "Advanced Restore Script"
    echo "Usage: ./restore-advanced.sh [options] <backup_file>"
    echo "Options:"
    echo "  -d, --target-dir <dir>       Restore to a specific directory (default: current directory)"
    echo "  -n, --new-supabase           Create new Supabase configuration"
    echo "  -p, --project-id <id>        New Supabase project ID"
    echo "  -u, --project-url <url>      New Supabase project URL"
    echo "  -k, --anon-key <key>         New Supabase anon key"
    echo "  -s, --service-key <key>      New Supabase service role key"
    echo "  -t, --access-token <token>   New Supabase access token"
    echo "  -h, --help                   Show this help message"
    echo ""
    echo "Example:"
    echo "  ./restore-advanced.sh -d /path/to/new/project -n \\"
    echo "    -p new_project_id -u https://new-project.supabase.co \\"
    echo "    -k new_anon_key -s new_service_key -t new_access_token \\"
    echo "    backups/backup_20231215_120000.tar.gz"
}

# Default values
TARGET_DIR="."
NEW_SUPABASE=false
TEMP_DIR="temp_restore"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--target-dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        -n|--new-supabase)
            NEW_SUPABASE=true
            shift
            ;;
        -p|--project-id)
            NEW_PROJECT_ID="$2"
            shift 2
            ;;
        -u|--project-url)
            NEW_PROJECT_URL="$2"
            shift 2
            ;;
        -k|--anon-key)
            NEW_ANON_KEY="$2"
            shift 2
            ;;
        -s|--service-key)
            NEW_SERVICE_KEY="$2"
            shift 2
            ;;
        -t|--access-token)
            NEW_ACCESS_TOKEN="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

# Validate inputs
if [ -z "$BACKUP_FILE" ]; then
    echo "Error: No backup file specified"
    print_usage
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR" || exit 1

# Create temporary directory
mkdir -p $TEMP_DIR

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C $TEMP_DIR

# Get the extracted directory name
BACKUP_DIR=$(ls $TEMP_DIR)

# Stop the development server if it's running in the target directory
echo "Checking for running development server..."
pkill -f "vite" || true

# Backup current .env file if it exists
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
cp "$TEMP_DIR/$BACKUP_DIR/vite.config.ts" . 2>/dev/null || true
cp "$TEMP_DIR/$BACKUP_DIR/tsconfig.json" . 2>/dev/null || true

# Handle .env file
if [ "$NEW_SUPABASE" = true ]; then
    echo "Creating new .env file with provided Supabase credentials..."
    if [ -z "$NEW_PROJECT_URL" ] || [ -z "$NEW_ANON_KEY" ] || [ -z "$NEW_SERVICE_KEY" ] || [ -z "$NEW_PROJECT_ID" ] || [ -z "$NEW_ACCESS_TOKEN" ]; then
        echo "Error: When using --new-supabase, all Supabase credentials must be provided"
        exit 1
    fi
    
    # Create new .env file with updated credentials
    cat > .env << EOF
VITE_SUPABASE_URL=$NEW_PROJECT_URL
VITE_SUPABASE_ANON_KEY=$NEW_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_KEY
SUPABASE_PROJECT_ID=$NEW_PROJECT_ID
SUPABASE_ACCESS_TOKEN=$NEW_ACCESS_TOKEN
EOF

    # Copy other environment variables from backup
    grep -v "VITE_SUPABASE\|SUPABASE_" "$TEMP_DIR/$BACKUP_DIR/.env" >> .env
else
    cp "$TEMP_DIR/$BACKUP_DIR/.env" .
fi

# Restore database if backup exists and credentials are provided
if [ -f "$TEMP_DIR/$BACKUP_DIR/db_backup.sql" ] && [ "$NEW_SUPABASE" = true ]; then
    echo "Restoring database to new Supabase project..."
    if [ ! -z "$NEW_PROJECT_ID" ] && [ ! -z "$NEW_ACCESS_TOKEN" ]; then
        echo "Creating database schema..."
        curl -X POST "https://api.supabase.com/v1/projects/$NEW_PROJECT_ID/database/restore" \
            -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d @"$TEMP_DIR/$BACKUP_DIR/db_backup.sql" || echo "Failed to restore database"
    fi
elif [ -f "$TEMP_DIR/$BACKUP_DIR/db_backup.sql" ]; then
    echo "Restoring database to existing Supabase project..."
    source .env
    if [ ! -z "$SUPABASE_PROJECT_ID" ] && [ ! -z "$SUPABASE_ACCESS_TOKEN" ]; then
        curl -X POST "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID/database/restore" \
            -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d @"$TEMP_DIR/$BACKUP_DIR/db_backup.sql" || echo "Failed to restore database"
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
echo "Project has been restored to: $TARGET_DIR"
if [ "$NEW_SUPABASE" = true ]; then
    echo "New Supabase configuration has been applied"
fi
echo "You may need to restart your development server"
