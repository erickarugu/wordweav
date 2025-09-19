# Docker Setup for WordWeave

🐳 **WordWeave is now fully dockerized!** This setup supports both development and production environments with your simplified local/production database architecture.

## Quick Start

### 1. Build the Docker Image

```bash
./scripts/setup-docker.sh build
```

### 2. Start Development Environment

```bash
./scripts/setup-docker.sh dev
```

This starts:

- Next.js app on http://localhost:3000
- PostgreSQL database on localhost:5432
- Redis for rate limiting on localhost:6379

### 3. Start Production Environment

```bash
./scripts/setup-docker.sh prod
```

Uses Supabase for database (NODE_ENV=production)

## Docker Files Overview

### 📁 Core Docker Files

- **`Dockerfile`** - Multi-stage build optimized for production
- **`docker-compose.yml`** - Development environment with local PostgreSQL
- **`docker-compose.prod.yml`** - Production environment with Supabase
- **`.dockerignore`** - Excludes unnecessary files from build context

### 🛠️ Helper Scripts

- **`scripts/setup-docker.sh`** - Main Docker management script
- **`scripts/init-db.sql`** - Database initialization script

## Commands Reference

```bash
# Build the Docker image
./scripts/setup-docker.sh build

# Development environment (PostgreSQL + Redis)
./scripts/setup-docker.sh dev

# Production environment (Supabase)
./scripts/setup-docker.sh prod

# Stop all containers
./scripts/setup-docker.sh stop

# View application logs
./scripts/setup-docker.sh logs

# Run database migrations
./scripts/setup-docker.sh migrate

# Backup PostgreSQL database
./scripts/setup-docker.sh backup

# Clean up Docker resources
./scripts/setup-docker.sh cleanup
```

## Environment Setup

### Development Environment

- **Database**: Local PostgreSQL in Docker
- **Cache**: Local Redis in Docker
- **Environment Variables**: Loaded from `.env`

### Production Environment

- **Database**: Supabase (automatic via NODE_ENV=production)
- **Environment Variables**: Set in production deployment

## Docker Architecture

### Multi-Stage Build

1. **deps** - Install production dependencies
2. **builder** - Build the application with Prisma generation
3. **runner** - Optimized production runtime

### Key Features

- ✅ **Standalone build** for minimal runtime
- ✅ **Prisma integration** with automatic migrations
- ✅ **Health checks** for container monitoring
- ✅ **Non-root user** for security
- ✅ **Optimized layers** for faster builds

## Production Deployment

### Docker Compose (Recommended)

```bash
# Copy production environment file
cp .env .env.production

# Update environment variables for production
export NODE_ENV=production
export DATABASE_URL="your-supabase-connection-string"

# Deploy
./scripts/setup-docker.sh prod
```

### Manual Docker Run

```bash
docker run -d \
  --name wordweave-prod \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-supabase-connection-string" \
  -e NEXTAUTH_SECRET="your-secret" \
  # ... other environment variables
  wordweave:latest
```

## Database Migrations

### Automatic Migrations

- **Development**: Handled by docker-compose startup
- **Production**: Runs `prisma migrate deploy` on container start

### Manual Migrations

```bash
# Run migrations in running container
./scripts/setup-docker.sh migrate

# Or manually
docker-compose exec app npx prisma migrate deploy
```

## Monitoring & Health Checks

### Health Endpoints

- **Basic**: `GET /api/health` - Simple health check
- **Database**: `GET /api/health/database` - Database connectivity
- **Detailed**: `GET /api/health/detailed` - Comprehensive health info

### Container Health Checks

- **Development**: PostgreSQL and Redis health checks
- **Production**: Application health check with curl

## Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
docker-compose up --env PORT=3001
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL container
docker-compose logs postgres

# Verify database is running
docker-compose exec postgres pg_isready -U postgres
```

#### 3. Build Failures

```bash
# Clean build (no cache)
docker build --no-cache -t wordweave:latest .

# Check build logs
docker-compose build --no-cache
```

#### 4. Environment Variables

```bash
# Verify environment variables are loaded
docker-compose exec app env | grep DATABASE_URL
```

## Performance Optimization

### Image Size Optimization

- **Alpine Linux** base image (~5MB)
- **Multi-stage build** removes build dependencies
- **Standalone output** includes only necessary files
- **Layer caching** for faster subsequent builds

### Runtime Optimization

- **Non-root user** for security
- **Health checks** for monitoring
- **Graceful shutdowns** with proper signal handling
- **Memory limits** can be set via docker-compose

## Security Considerations

- ✅ **Non-root user** (nextjs:nodejs)
- ✅ **Minimal attack surface** (Alpine base)
- ✅ **No secrets in image** (runtime environment variables)
- ✅ **Health checks** for monitoring
- ✅ **Network isolation** via Docker networks

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy WordWeave
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t wordweave:latest .
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

## Your Current Setup Status

✅ **Dockerized**: Complete multi-stage build setup  
✅ **Database Ready**: Supports local PostgreSQL and Supabase  
✅ **Environment Switching**: Automatic local/production switching  
✅ **Health Monitoring**: Built-in health checks  
✅ **Production Ready**: Optimized for deployment

Your WordWeave app is now fully containerized and ready for both development and production! 🚀
