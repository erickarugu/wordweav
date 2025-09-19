#!/bin/bash

# Docker Setup Script for WordWeave
# This script helps you build and run the dockerized WordWeave application

set -e

echo "🐳 WordWeave Docker Setup"
echo "========================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to build the Docker image
build_image() {
    echo "🏗️  Building WordWeave Docker image..."
    docker build -t wordweave:latest .
    echo "✅ Docker image built successfully"
}

# Function to run development environment
run_dev() {
    echo "🚀 Starting development environment with PostgreSQL..."
    docker-compose up -d
    echo "✅ Development environment started!"
    echo "📱 Application: http://localhost:3000"
    echo "🗄️  PostgreSQL: localhost:5432"
    echo "🔴 Redis: localhost:6379"
}

# Function to run production environment
run_prod() {
    echo "🚀 Starting production environment..."
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Production environment started!"
    echo "📱 Application: http://localhost:3000"
}

# Function to stop all containers
stop_all() {
    echo "🛑 Stopping all WordWeave containers..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    echo "✅ All containers stopped"
}

# Function to view logs
view_logs() {
    echo "📋 Viewing application logs..."
    docker-compose logs -f app
}

# Function to run database migrations
run_migrations() {
    echo "🗄️  Running database migrations..."
    docker-compose exec app npx prisma migrate deploy
    echo "✅ Migrations completed"
}

# Function to backup database
backup_db() {
    echo "💾 Creating database backup..."
    docker-compose exec postgres pg_dump -U postgres wordweaves > "backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "✅ Database backup created"
}

# Function to clean up Docker resources
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
    echo "✅ Cleanup completed"
}

# Main menu
case "${1:-}" in
    "build")
        check_docker
        build_image
        ;;
    "dev")
        check_docker
        run_dev
        ;;
    "prod")
        check_docker
        run_prod
        ;;
    "stop")
        stop_all
        ;;
    "logs")
        view_logs
        ;;
    "migrate")
        run_migrations
        ;;
    "backup")
        backup_db
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|dev|prod|stop|logs|migrate|backup|cleanup}"
        echo ""
        echo "Commands:"
        echo "  build   - Build the Docker image"
        echo "  dev     - Start development environment (with PostgreSQL)"
        echo "  prod    - Start production environment (uses Supabase)"
        echo "  stop    - Stop all containers"
        echo "  logs    - View application logs"
        echo "  migrate - Run database migrations"
        echo "  backup  - Backup PostgreSQL database"
        echo "  cleanup - Clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 build    # Build the image"
        echo "  $0 dev      # Start development"
        echo "  $0 prod     # Start production"
        echo "  $0 logs     # View logs"
        exit 1
        ;;
esac
