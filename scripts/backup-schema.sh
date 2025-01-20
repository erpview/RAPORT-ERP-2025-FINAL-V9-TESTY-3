#!/bin/bash

# Get current timestamp for backup name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
BACKUP_NAME="schema_backup_$TIMESTAMP"

# Create backups directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Creating schema backup..."

# Check if we have Supabase credentials
if [ -f .env ]; then
    source .env
    if [ ! -z "$SUPABASE_PROJECT_ID" ] && [ ! -z "$SUPABASE_ACCESS_TOKEN" ]; then
        # Get schema with policies using pg_dump
        PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump -h "db.$SUPABASE_PROJECT_ID.supabase.co" \
            -U postgres \
            -n public \
            --schema-only \
            --no-owner \
            --no-privileges \
            > "$BACKUP_DIR/${BACKUP_NAME}.sql" 2>/dev/null || \
            echo "Failed to backup schema. Please ensure SUPABASE_PROJECT_ID, SUPABASE_ACCESS_TOKEN, and SUPABASE_DB_PASSWORD are set correctly in .env"

        # If pg_dump failed, try to create schema from our setup scripts
        if [ ! -s "$BACKUP_DIR/${BACKUP_NAME}.sql" ]; then
            echo "Falling back to setup scripts..."
            cat scripts/setup-complete-database.sql > "$BACKUP_DIR/${BACKUP_NAME}.sql"
            
            # Add any additional schema modifications from other scripts
            for script in src/scripts/fix-*.sql; do
                if [ -f "$script" ]; then
                    echo -e "\n-- From $script\n" >> "$BACKUP_DIR/${BACKUP_NAME}.sql"
                    cat "$script" >> "$BACKUP_DIR/${BACKUP_NAME}.sql"
                fi
            done
        fi

        echo "Schema backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.sql"
    else
        echo "Supabase credentials not found in .env - using setup scripts..."
        cat scripts/setup-complete-database.sql > "$BACKUP_DIR/${BACKUP_NAME}.sql"
        
        # Add any additional schema modifications from other scripts
        for script in src/scripts/fix-*.sql; do
            if [ -f "$script" ]; then
                echo -e "\n-- From $script\n" >> "$BACKUP_DIR/${BACKUP_NAME}.sql"
                cat "$script" >> "$BACKUP_DIR/${BACKUP_NAME}.sql"
            fi
        done
        echo "Schema backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.sql"
    fi
else
    echo ".env file not found - using setup scripts..."
    cat scripts/setup-complete-database.sql > "$BACKUP_DIR/${BACKUP_NAME}.sql"
    
    # Add any additional schema modifications from other scripts
    for script in src/scripts/fix-*.sql; do
        if [ -f "$script" ]; then
            echo -e "\n-- From $script\n" >> "$BACKUP_DIR/${BACKUP_NAME}.sql"
            cat "$script" >> "$BACKUP_DIR/${BACKUP_NAME}.sql"
        fi
    done
    echo "Schema backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.sql"
fi
