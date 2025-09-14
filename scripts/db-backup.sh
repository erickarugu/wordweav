#!/bin/bash

# PostgreSQL Backup and Recovery Script for WordWeave
# 
# This script provides backup and recovery functionality for the PostgreSQL database

set -e

# Configuration
DB_NAME="${DB_NAME:-wordweaves}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/wordweave_backup_${DATE}.sql"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to show usage
show_usage() {
    echo "Usage: $0 [backup|restore|list|cleanup]"
    echo ""
    echo "Commands:"
    echo "  backup           Create a new database backup"
    echo "  restore <file>   Restore database from backup file"
    echo "  list             List available backups"
    echo "  cleanup          Remove backups older than $RETENTION_DAYS days"
    echo ""
    echo "Environment variables:"
    echo "  DB_NAME          Database name (default: wordweaves)"
    echo "  DB_USER          Database user (default: postgres)"
    echo "  DB_HOST          Database host (default: localhost)"
    echo "  DB_PORT          Database port (default: 5432)"
    echo "  BACKUP_DIR       Backup directory (default: ./backups)"
    echo "  RETENTION_DAYS   Backup retention in days (default: 7)"
}

# Function to create backup
create_backup() {
    echo "🔄 Creating backup of database '$DB_NAME'..."
    
    # Create SQL dump
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --no-password \
        --format=custom \
        --compress=9 \
        --file="$BACKUP_FILE.dump"
    
    # Also create a plain SQL version for easy viewing
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --no-password \
        --format=plain \
        --file="$BACKUP_FILE"
    
    # Compress the plain SQL file
    gzip "$BACKUP_FILE"
    
    echo "✅ Backup created successfully:"
    echo "   Custom format: $BACKUP_FILE.dump"
    echo "   SQL format: $BACKUP_FILE.gz"
    echo "   Size: $(du -h "$BACKUP_FILE.dump" | cut -f1)"
}

# Function to restore backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo "❌ Error: Please specify a backup file to restore"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Error: Backup file '$backup_file' not found"
        exit 1
    fi
    
    echo "⚠️  WARNING: This will replace the current database!"
    echo "Database: $DB_NAME"
    echo "Backup file: $backup_file"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Restore cancelled"
        exit 1
    fi
    
    echo "🔄 Restoring database from backup..."
    
    # Drop and recreate database
    echo "Dropping existing database..."
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
    
    echo "Creating new database..."
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    # Restore from backup
    echo "Restoring data..."
    if [[ "$backup_file" == *.dump ]]; then
        # Custom format
        pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            --verbose \
            --no-password \
            "$backup_file"
    elif [[ "$backup_file" == *.sql.gz ]]; then
        # Compressed SQL
        gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    elif [[ "$backup_file" == *.sql ]]; then
        # Plain SQL
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$backup_file"
    else
        echo "❌ Error: Unsupported backup file format"
        exit 1
    fi
    
    echo "✅ Database restored successfully"
}

# Function to list backups
list_backups() {
    echo "📋 Available backups in $BACKUP_DIR:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo "No backups found"
        return
    fi
    
    # List backup files with details
    find "$BACKUP_DIR" -name "wordweave_backup_*.sql.gz" -o -name "wordweave_backup_*.dump" | \
    sort -r | \
    while read -r file; do
        if [ -f "$file" ]; then
            size=$(du -h "$file" | cut -f1)
            date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d' ' -f1-2)
            echo "  $(basename "$file") - $size - $date"
        fi
    done
}

# Function to cleanup old backups
cleanup_backups() {
    echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "No backup directory found"
        return
    fi
    
    # Find and delete old backups
    find "$BACKUP_DIR" -name "wordweave_backup_*" -type f -mtime +$RETENTION_DAYS -print0 | \
    while IFS= read -r -d '' file; do
        echo "  Removing: $(basename "$file")"
        rm "$file"
    done
    
    echo "✅ Cleanup completed"
}

# Function to test database connection
test_connection() {
    echo "🔌 Testing database connection..."
    
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        echo "✅ Database connection successful"
        return 0
    else
        echo "❌ Database connection failed"
        return 1
    fi
}

# Main script logic
case "${1:-}" in
    backup)
        test_connection
        create_backup
        ;;
    restore)
        test_connection
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_backups
        ;;
    test)
        test_connection
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
