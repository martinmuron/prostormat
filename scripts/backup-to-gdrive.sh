#!/bin/bash

# Prostormat Database Backup to Google Drive
# This script creates compressed backups and uploads them to Google Drive using rclone

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="prostormat_backup_$DATE"
GDRIVE_REMOTE="gdrive"  # rclone remote name for Google Drive
GDRIVE_FOLDER="Prostormat-Backups/Database"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
else
    error ".env.local file not found!"
    exit 1
fi

# Check if rclone is installed
if ! command -v rclone >/dev/null 2>&1; then
    error "rclone not found. Install with: brew install rclone"
    error "Then configure Google Drive: rclone config"
    exit 1
fi

# Check if Google Drive remote is configured
if ! rclone listremotes | grep -q "^${GDRIVE_REMOTE}:$"; then
    error "Google Drive remote '$GDRIVE_REMOTE' not configured"
    error "Run: rclone config"
    exit 1
fi

log "Starting Google Drive backup for Prostormat database"

# Create the backup first
BACKUP_FILE=$(bash ./scripts/backup-database.sh)

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Local backup created: $(basename "$BACKUP_FILE") ($BACKUP_SIZE)"
    
    # Upload to Google Drive
    GDRIVE_PATH="$GDRIVE_REMOTE:$GDRIVE_FOLDER"
    log "Uploading to Google Drive: $GDRIVE_PATH/"
    
    rclone copy "$BACKUP_FILE" "$GDRIVE_PATH/" --progress
    
    if [ $? -eq 0 ]; then
        log "✅ Backup uploaded to Google Drive successfully"
        
        # Clean up local backup after successful upload
        rm "$BACKUP_FILE"
        log "Local backup cleaned up"
        
        # Clean up old Google Drive backups
        log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
        
        # Get list of backup files from Google Drive
        CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d 2>/dev/null || date -v -${RETENTION_DAYS}d +%Y%m%d)
        
        rclone lsf "$GDRIVE_PATH/" | while read -r backup_file; do
            if [[ "$backup_file" =~ prostormat_backup_([0-9]{8})_ ]]; then
                FILE_DATE="${BASH_REMATCH[1]}"
                if [ "$FILE_DATE" -lt "$CUTOFF_DATE" ]; then
                    log "Deleting old backup: $backup_file"
                    rclone delete "$GDRIVE_PATH/$backup_file"
                fi
            fi
        done
        
        # Send success notification email
        if [ -n "$RESEND_API_KEY" ]; then
            curl -s -X POST "https://api.resend.com/emails" \
                -H "Authorization: Bearer $RESEND_API_KEY" \
                -H "Content-Type: application/json" \
                -d "{
                    \"from\": \"Prostormat <noreply@prostormat.cz>\",
                    \"to\": [\"your-email@example.com\"],
                    \"subject\": \"✅ Prostormat Database Backup Uploaded to Google Drive\",
                    \"html\": \"<h2>Database Backup Completed</h2>
                              <p><strong>Backup:</strong> $(basename "$BACKUP_FILE")</p>
                              <p><strong>Size:</strong> $BACKUP_SIZE</p>
                              <p><strong>Location:</strong> Google Drive/$GDRIVE_FOLDER/</p>
                              <p><strong>Created:</strong> $(date)</p>
                              <p><strong>Status:</strong> ✅ Successfully uploaded to Google Drive</p>\"
                }" > /dev/null
            log "Email notification sent"
        fi
        
    else
        error "Failed to upload backup to Google Drive"
        exit 1
    fi
    
else
    error "Local backup creation failed"
    exit 1
fi

log "Google Drive backup process completed successfully"