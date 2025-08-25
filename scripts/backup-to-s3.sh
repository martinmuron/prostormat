#!/bin/bash

# Prostormat Database Backup to AWS S3
# This script creates compressed backups and uploads them to S3 with retention policy

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="prostormat_backup_$DATE"
S3_BUCKET="prostormat-backups"  # Change this to your S3 bucket name
S3_PREFIX="database-backups"
RETENTION_DAYS=30  # Keep backups for 30 days

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

# Validate AWS credentials (set these in your environment)
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    error "AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
fi

log "Starting S3 backup for Prostormat database"

# Create the backup first
BACKUP_FILE=$(bash ./scripts/backup-database.sh)

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Local backup created: $(basename "$BACKUP_FILE") ($BACKUP_SIZE)"
    
    # Upload to S3
    S3_KEY="$S3_PREFIX/$(basename "$BACKUP_FILE")"
    log "Uploading to S3: s3://$S3_BUCKET/$S3_KEY"
    
    # Using AWS CLI (install with: brew install awscli)
    if command -v aws >/dev/null 2>&1; then
        aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/$S3_KEY" \
            --storage-class STANDARD_IA \
            --metadata "created=$(date -u +%Y-%m-%dT%H:%M:%SZ),app=prostormat,type=database-backup"
        
        if [ $? -eq 0 ]; then
            log "✅ Backup uploaded to S3 successfully"
            
            # Clean up local backup after successful upload
            rm "$BACKUP_FILE"
            log "Local backup cleaned up"
            
            # Clean up old S3 backups (older than retention period)
            CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d 2>/dev/null || date -v -${RETENTION_DAYS}d +%Y%m%d)
            
            log "Cleaning up S3 backups older than $RETENTION_DAYS days (before $CUTOFF_DATE)..."
            
            aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" | while read -r line; do
                BACKUP_DATE=$(echo "$line" | grep -o 'prostormat_backup_[0-9]*_' | sed 's/prostormat_backup_//' | sed 's/_$//')
                if [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
                    OLD_BACKUP=$(echo "$line" | awk '{print $4}')
                    if [ -n "$OLD_BACKUP" ]; then
                        log "Deleting old backup: $OLD_BACKUP"
                        aws s3 rm "s3://$S3_BUCKET/$S3_PREFIX/$OLD_BACKUP"
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
                        \"subject\": \"✅ Prostormat Database Backup Uploaded to S3\",
                        \"html\": \"<h2>Database Backup Completed</h2>
                                  <p><strong>Backup:</strong> $(basename "$BACKUP_FILE")</p>
                                  <p><strong>Size:</strong> $BACKUP_SIZE</p>
                                  <p><strong>S3 Location:</strong> s3://$S3_BUCKET/$S3_KEY</p>
                                  <p><strong>Created:</strong> $(date)</p>
                                  <p><strong>Status:</strong> ✅ Successfully uploaded to S3</p>\"
                    }" > /dev/null
                log "Email notification sent"
            fi
            
        else
            error "Failed to upload backup to S3"
            exit 1
        fi
    else
        error "AWS CLI not found. Install with: brew install awscli"
        exit 1
    fi
    
else
    error "Local backup creation failed"
    exit 1
fi

log "S3 backup process completed successfully"