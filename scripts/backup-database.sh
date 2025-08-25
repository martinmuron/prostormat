#!/bin/bash

# Prostormat Database Backup Script
# This script creates compressed PostgreSQL backups and can send them via email or upload to Google Drive

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="prostormat_backup_$DATE"
MAX_BACKUPS=30  # Keep last 30 backups

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
else
    error ".env.local file not found!"
    exit 1
fi

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not found in environment variables"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting database backup for Prostormat"

# Extract database connection details from DATABASE_URL
# DATABASE_URL format: postgres://user:password@host:port/database
DB_URL_CLEAN=$(echo "$DATABASE_URL" | sed 's/?.*$//')  # Remove query parameters
DB_USER=$(echo "$DB_URL_CLEAN" | sed 's/.*:\/\///' | sed 's/:.*@.*//')
DB_PASS=$(echo "$DB_URL_CLEAN" | sed 's/.*:\/\///' | sed 's/.*://' | sed 's/@.*//')
DB_HOST=$(echo "$DB_URL_CLEAN" | sed 's/.*@//' | sed 's/:.*//')
DB_PORT=$(echo "$DB_URL_CLEAN" | sed 's/.*://' | sed 's/\/.*//')
DB_NAME=$(echo "$DB_URL_CLEAN" | sed 's/.*\///')

log "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Create the backup
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.sql"
COMPRESSED_BACKUP="$BACKUP_DIR/$BACKUP_NAME.sql.gz"

log "Creating backup: $BACKUP_FILE"

# Set PGPASSWORD for pg_dump
export PGPASSWORD="$DB_PASS"

# Perform the backup with proper SSL and connection pooling settings
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password \
    --verbose \
    --format=plain \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    > "$BACKUP_FILE" 2>/dev/null; then
    
    log "Backup created successfully"
    
    # Compress the backup
    log "Compressing backup..."
    gzip "$BACKUP_FILE"
    
    # Check compressed file size
    BACKUP_SIZE=$(du -h "$COMPRESSED_BACKUP" | cut -f1)
    log "Compressed backup size: $BACKUP_SIZE"
    
    # Cleanup old backups
    log "Cleaning up old backups (keeping last $MAX_BACKUPS)..."
    cd "$BACKUP_DIR"
    ls -t prostormat_backup_*.sql.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm --
    cd - > /dev/null
    
    REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/prostormat_backup_*.sql.gz 2>/dev/null | wc -l)
    log "Backup cleanup complete. $REMAINING_BACKUPS backups remaining."
    
    log "Backup completed successfully: $COMPRESSED_BACKUP"
    echo "$COMPRESSED_BACKUP"  # Return the backup file path for other scripts
    
else
    error "Backup failed!"
    # Clean up failed backup file
    [ -f "$BACKUP_FILE" ] && rm "$BACKUP_FILE"
    exit 1
fi

# Unset password
unset PGPASSWORD