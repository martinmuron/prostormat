#!/bin/bash

# Prostormat Database Backup with Email Notification
# This script creates a backup and sends email notification with backup info

set -e

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

# Validate required environment variables
if [ -z "$RESEND_API_KEY" ]; then
    error "RESEND_API_KEY not found in environment variables"
    exit 1
fi

# Email configuration (you can modify these)
EMAIL_TO="martin@example.com"  # Replace with your email
EMAIL_FROM="Prostormat <noreply@prostormat.cz>"

log "Starting backup with email notification"

# Run the backup
BACKUP_FILE=$(bash ./scripts/backup-database.sh)

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    # Get backup info
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    BACKUP_NAME=$(basename "$BACKUP_FILE")
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    log "Backup successful: $BACKUP_NAME ($BACKUP_SIZE)"
    
    # Determine if we should attach the backup to email
    BACKUP_SIZE_BYTES=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    MAX_EMAIL_SIZE=$((20 * 1024 * 1024))  # 20MB limit for email
    
    if [ "$BACKUP_SIZE_BYTES" -lt "$MAX_EMAIL_SIZE" ]; then
        # Small backup - attach to email
        log "Backup size under 20MB - attaching to email"
        
        # Convert backup to base64 for API
        BACKUP_BASE64=$(base64 -i "$BACKUP_FILE")
        
        # Send email with attachment using Resend API
        curl -X POST "https://api.resend.com/emails" \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"from\": \"$EMAIL_FROM\",
                \"to\": [\"$EMAIL_TO\"],
                \"subject\": \"Prostormat Database Backup - $TIMESTAMP\",
                \"html\": \"<h2>Database Backup Completed</h2>
                          <p><strong>Backup:</strong> $BACKUP_NAME</p>
                          <p><strong>Size:</strong> $BACKUP_SIZE</p>
                          <p><strong>Created:</strong> $TIMESTAMP</p>
                          <p><strong>Status:</strong> ✅ Success</p>
                          <p>The backup file is attached to this email.</p>\",
                \"attachments\": [
                    {
                        \"filename\": \"$BACKUP_NAME\",
                        \"content\": \"$BACKUP_BASE64\"
                    }
                ]
            }"
    else
        # Large backup - send notification only
        log "Backup size over 20MB - sending notification without attachment"
        
        curl -X POST "https://api.resend.com/emails" \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"from\": \"$EMAIL_FROM\",
                \"to\": [\"$EMAIL_TO\"],
                \"subject\": \"Prostormat Database Backup - $TIMESTAMP\",
                \"html\": \"<h2>Database Backup Completed</h2>
                          <p><strong>Backup:</strong> $BACKUP_NAME</p>
                          <p><strong>Size:</strong> $BACKUP_SIZE</p>
                          <p><strong>Created:</strong> $TIMESTAMP</p>
                          <p><strong>Location:</strong> $BACKUP_FILE</p>
                          <p><strong>Status:</strong> ✅ Success</p>
                          <p><em>Note: Backup was too large for email attachment ($BACKUP_SIZE). The backup is stored locally on the server.</em></p>\"
            }"
    fi
    
    if [ $? -eq 0 ]; then
        log "Email notification sent successfully"
    else
        error "Failed to send email notification"
    fi
    
else
    # Backup failed - send error notification
    error "Backup failed - sending error notification"
    
    curl -X POST "https://api.resend.com/emails" \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"from\": \"$EMAIL_FROM\",
            \"to\": [\"$EMAIL_TO\"],
            \"subject\": \"❌ Prostormat Database Backup FAILED - $TIMESTAMP\",
            \"html\": \"<h2>Database Backup Failed</h2>
                      <p><strong>Time:</strong> $TIMESTAMP</p>
                      <p><strong>Status:</strong> ❌ Failed</p>
                      <p>The database backup process encountered an error. Please check the server logs and try again.</p>\"
        }"
    
    exit 1
fi

log "Backup and email process completed"