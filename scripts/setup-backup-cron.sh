#!/bin/bash

# Setup Automated Database Backup Scheduling
# This script configures cron jobs for automated backups

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Get current directory (project root)
PROJECT_DIR=$(pwd)

log "Setting up automated backup scheduling for Prostormat"
info "Project directory: $PROJECT_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "scripts" ]; then
    error "❌ Please run this script from the Prostormat project root directory"
    exit 1
fi

# Make sure all backup scripts are executable
chmod +x scripts/backup-*.sh
chmod +x scripts/monitor-*.sh

log "✅ Backup scripts are executable"

# Create cron job entries
CRON_TEMP_FILE="/tmp/prostormat_cron_backup"

cat > "$CRON_TEMP_FILE" << EOF
# Prostormat Database Backup Jobs
# Generated on $(date)

# Daily backup at 2:00 AM (choose one option below)
# Option 1: Email backup (for small databases)
0 2 * * * cd $PROJECT_DIR && bash scripts/backup-with-email.sh >> logs/backup.log 2>&1

# Option 2: S3 backup (recommended for production)
# 0 2 * * * cd $PROJECT_DIR && bash scripts/backup-to-s3.sh >> logs/backup.log 2>&1

# Option 3: Google Drive backup
# 0 2 * * * cd $PROJECT_DIR && bash scripts/backup-to-gdrive.sh >> logs/backup.log 2>&1

# Weekly database status report (Sundays at 9:00 AM)
0 9 * * 0 cd $PROJECT_DIR && bash scripts/monitor-supabase-backups.sh >> logs/backup-status.log 2>&1

# Monthly cleanup of local logs (1st day of month at 3:00 AM)
0 3 1 * * find $PROJECT_DIR/logs -name "*.log" -mtime +30 -delete

EOF

log "📋 Generated cron job configuration:"
echo
cat "$CRON_TEMP_FILE"
echo

# Create logs directory
mkdir -p logs
log "✅ Created logs directory"

# Ask user which backup method to use
echo
info "📚 Backup Options:"
echo "1. Email backup (recommended for small databases < 20MB)"
echo "2. AWS S3 backup (recommended for production, requires AWS setup)"
echo "3. Google Drive backup (requires rclone setup)"
echo "4. Supabase monitoring only (relies on Supabase built-in backups)"
echo
read -p "Which backup method would you like to use? (1-4): " backup_choice

case $backup_choice in
    1)
        BACKUP_METHOD="backup-with-email.sh"
        log "Selected: Email backup"
        ;;
    2)
        BACKUP_METHOD="backup-to-s3.sh"
        log "Selected: AWS S3 backup"
        warn "Make sure to set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment"
        ;;
    3)
        BACKUP_METHOD="backup-to-gdrive.sh"
        log "Selected: Google Drive backup"
        warn "Make sure to install and configure rclone first: brew install rclone && rclone config"
        ;;
    4)
        BACKUP_METHOD="monitor-supabase-backups.sh"
        log "Selected: Supabase monitoring only"
        ;;
    *)
        log "Invalid choice. Defaulting to email backup."
        BACKUP_METHOD="backup-with-email.sh"
        ;;
esac

# Create final cron configuration
FINAL_CRON_FILE="/tmp/prostormat_final_cron"

cat > "$FINAL_CRON_FILE" << EOF
# Prostormat Database Backup Jobs
# Generated on $(date)
# Backup method: $BACKUP_METHOD

# Daily backup at 2:00 AM
0 2 * * * cd $PROJECT_DIR && bash scripts/$BACKUP_METHOD >> logs/backup.log 2>&1

# Weekly database status report (Sundays at 9:00 AM)
0 9 * * 0 cd $PROJECT_DIR && bash scripts/monitor-supabase-backups.sh >> logs/backup-status.log 2>&1

# Monthly cleanup of local logs (1st day of month at 3:00 AM)
0 3 1 * * find $PROJECT_DIR/logs -name "*.log" -mtime +30 -delete

EOF

echo
log "📋 Final cron configuration:"
cat "$FINAL_CRON_FILE"

echo
read -p "Do you want to install these cron jobs? (y/N): " install_cron

if [[ "$install_cron" =~ ^[Yy]$ ]]; then
    # Install cron jobs
    crontab -l > /tmp/current_cron 2>/dev/null || echo "" > /tmp/current_cron
    
    # Remove any existing Prostormat backup jobs
    grep -v "# Prostormat Database Backup" /tmp/current_cron > /tmp/clean_cron || echo "" > /tmp/clean_cron
    grep -v "prostormat" /tmp/clean_cron > /tmp/cleaned_cron || cp /tmp/clean_cron /tmp/cleaned_cron
    
    # Add new jobs
    cat /tmp/cleaned_cron "$FINAL_CRON_FILE" > /tmp/new_cron
    
    # Install the new crontab
    crontab /tmp/new_cron
    
    log "✅ Cron jobs installed successfully!"
    log "📅 Daily backups will run at 2:00 AM"
    log "📊 Weekly status reports will run on Sundays at 9:00 AM"
    
    # Clean up temp files
    rm -f /tmp/*cron* /tmp/prostormat_*
    
    echo
    info "📋 To view installed cron jobs: crontab -l"
    info "📋 To edit cron jobs: crontab -e"
    info "📋 To remove cron jobs: crontab -r"
    
else
    log "❌ Cron jobs not installed. You can install them later by running:"
    echo "   crontab -e"
    echo "   # Then add the contents of this file:"
    cat "$FINAL_CRON_FILE"
    
    # Clean up temp files
    rm -f /tmp/*cron* /tmp/prostormat_*
fi

echo
log "🎉 Backup scheduling setup completed!"
info "💡 Don't forget to update the email address in your backup scripts"
info "💡 Check logs/backup.log and logs/backup-status.log for backup results"