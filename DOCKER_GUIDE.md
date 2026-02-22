# 🐳 Docker Setup Guide

## Overview

This project includes complete Docker configuration for development and production:

- **docker-compose.yml** - Development environment
- **docker-compose.prod.yml** - Production with Nginx reverse proxy
- **Dockerfile** (backend & frontend) - Multi-stage builds for optimization
- **.dockerignore** - Exclude unnecessary files
- **nginx.conf** - Reverse proxy configuration
- **.env.example** - Environment variable template

---

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker CLI available in terminal
- WSL2 enabled (Windows)

---

## Development Setup

### Step 1: Prepare Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values (optional for development)
# Default values work for local development
```

### Step 2: Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Step 3: Verify Services

```bash
# Check running containers
docker-compose ps

# Expected output:
# NAME                    STATUS
# social-media-backend    Up (healthy)
# social-media-frontend   Up (healthy)
# social-media-mysql      Up (healthy)
```

### Step 4: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MySQL: localhost:3306

### Step 5: Initialize Database

Database automatically initializes from `backend/src/db/schema.sql`

First time setup:

```bash
# Backend runs migrations automatically
# Check backend logs
docker-compose logs backend

# Should see "Server running on http://localhost:3001"
```

---

## Development Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service (last 50 lines)
docker-compose logs --tail=50 backend

# Follow logs in real-time
docker-compose logs -f frontend
```

### Stop Services

```bash
# Stop all containers (keeps volumes)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything (DELETE DATA!)
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and start
docker-compose up -d --build
```

### Access Container Shell

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# MySQL shell
docker-compose exec mysql bash
```

### Database Commands

```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u socialuser -p social_media
# Password: userpassword

# Backup database
docker-compose exec mysql mysqldump -u socialuser -p social_media > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u socialuser -p social_media < backup.sql
```

---

## Production Setup

### Step 1: Configure Environment

```bash
cp .env.example .env.prod

# Edit .env.prod with production values:
NODE_ENV=production
MYSQL_ROOT_PASSWORD=very-secure-password
MYSQL_PASSWORD=very-secure-password
JWT_SECRET=very-long-random-string
BETTER_AUTH_SECRET=very-long-random-string
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### Step 2: Setup SSL Certificates

```bash
# Option 1: Using Let's Encrypt with Certbot
docker run -it --rm -v ./ssl:/etc/letsencrypt certbot/certbot \
  certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be at:
# - ./ssl/live/yourdomain.com/fullchain.pem
# - ./ssl/live/yourdomain.com/privkey.pem

# Copy to expected location
mkdir -p ssl
cp ./ssl/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp ./ssl/live/yourdomain.com/privkey.pem ./ssl/key.pem

# Option 2: Self-signed certificate (testing only)
openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365
```

### Step 3: Update Nginx Configuration

Edit `nginx.conf`:

```nginx
# Change server_name
server_name yourdomain.com www.yourdomain.com;

# SSL paths should match your certificate location
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

### Step 4: Deploy

```bash
# Load environment from file
export $(cat .env.prod | xargs)

# Start services with production compose
docker-compose -f docker-compose.prod.yml up -d

# Verify health
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Docker Architecture

### Development (docker-compose.yml)

```
┌──────────────────────────────────────┐
│         Local Development            │
├──────────────────────────────────────┤
│                                      │
│  Port 3000           Port 3001      │
│  Frontend ◄──────────► Backend      │
│                         │           │
│                         ▼           │
│                   MySQL (3306)      │
│                                      │
└──────────────────────────────────────┘
```

### Production (docker-compose.prod.yml)

```
┌─────────────────────────────────────────────┐
│         Production Deployment               │
├─────────────────────────────────────────────┤
│                                             │
│  Port 80/443                               │
│  ┌───────────────────────────────────────┐ │
│  │     Nginx Reverse Proxy               │ │
│  │  (Load balancing, SSL, Compression)   │ │
│  └───────────┬──────────────┬────────────┘ │
│              │              │              │
│              ▼              ▼              │
│         Frontend       Backend            │
│         (3000)         (3001)             │
│              │              │              │
│              └──────┬───────┘              │
│                     ▼                      │
│                MySQL (3306)               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Dockerfile Optimization

### Multi-Stage Build Benefits

**Backend Dockerfile:**

1. **Builder stage** - Builds TypeScript to JavaScript
2. **Production stage** - Only includes necessary files

**Result:**

- Builder image: ~800MB
- Final image: ~350MB (60% reduction)

### Production Optimizations

✅ Alpine Linux (small base image)  
✅ Non-root user (security)  
✅ Health checks (monitoring)  
✅ Proper signal handling (dumb-init)  
✅ Multi-stage builds (size optimization)  
✅ Layer caching (fast rebuilds)

---

## Monitoring & Debugging

### View Container Logs

```bash
# Real-time logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Filter by service
docker-compose logs -f backend | grep "ERROR"
```

### Check Container Health

```bash
# Detailed info
docker-compose ps

# Health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Access Container

```bash
# Interactive shell
docker-compose exec backend sh

# Run command
docker-compose exec backend npm run dev

# View environment
docker-compose exec backend env
```

### Database Debugging

```bash
# MySQL shell
docker-compose exec mysql mysql -u socialuser -p

# List databases
SHOW DATABASES;

# List tables
USE social_media;
SHOW TABLES;

# Sample query
SELECT COUNT(*) as user_count FROM user;
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use Docker to find container
docker ps | grep 3000
docker stop container_id
```

### Database Connection Failed

```bash
# Check MySQL is running
docker-compose logs mysql

# Test connection
docker-compose exec backend mysql -h mysql -u socialuser -p social_media

# Verify network
docker network inspect social-media-network
```

### Frontend Can't Connect to Backend

```bash
# Check NEXT_PUBLIC_API_URL
docker-compose exec frontend env | grep NEXT_PUBLIC

# Check backend is running
curl http://localhost:3001/health

# Check Docker network
docker-compose exec frontend curl http://backend:3001/health
```

### Permission Denied Errors

```bash
# Give Docker socket permissions
sudo usermod -aG docker $USER

# Or run with sudo
sudo docker-compose up
```

### Out of Disk Space

```bash
# Clean up unused Docker resources
docker system prune

# Remove all unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## Performance Tips

### Development

```bash
# Use bind mounts for code
volumes:
  - ./backend/src:/app/src  # Hot reload

# Reduce logging
environment:
  - LOG_LEVEL=warn
```

### Production

```bash
# Use COPY not VOLUME
COPY . .

# Multi-stage builds
FROM node:18-alpine AS builder
# Build here
FROM node:18-alpine
# Only copy necessary files
```

### Database

```bash
# Add indexes
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_post_user ON post(userId);
CREATE INDEX idx_follow_follower ON follow(followerId);
```

### Caching

```bash
# Docker layer caching
COPY package*.json ./
RUN npm ci
COPY . .  # Invalidates cache only when code changes
```

---

## Scaling & Load Balancing

### Scale Backend Services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Nginx will load balance between them
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml social-media

# List services
docker service ls

# Scale service
docker service scale social-media_backend=3
```

### Kubernetes (Advanced)

Generate Kubernetes manifests from docker-compose:

```bash
docker-compose -f docker-compose.prod.yml convert
```

---

## Security Best Practices

✅ Use non-root user in containers  
✅ Set resource limits (CPU, memory)  
✅ Use secrets management for sensitive data  
✅ Scan images for vulnerabilities  
✅ Keep images updated  
✅ Use HTTPS in production  
✅ Implement health checks  
✅ Use read-only root filesystem (when possible)

```bash
# Scan image for vulnerabilities
docker scan backend:latest

# View image history
docker history backend:latest

# Inspect image
docker inspect backend:latest
```

---

## Useful Docker Commands

```bash
# List running containers
docker-compose ps

# View environment variables
docker-compose exec backend env

# Run one-off command
docker-compose run backend npm run migrate

# Update and restart service
docker-compose up -d --no-deps --build backend

# Backup volume
docker run --rm -v social-media-mysql:/data -v $(pwd):/backup ubuntu tar czf /backup/mysql.tar.gz -C /data .

# Restore volume
docker run --rm -v social-media-mysql:/data -v $(pwd):/backup ubuntu tar xzf /backup/mysql.tar.gz -C /data .
```

---

## File Structure

```
Social_Media/
├── backend/
│   ├── Dockerfile                 # Backend container image
│   ├── .dockerignore              # Exclude files from build
│   └── src/
│       └── db/
│           └── schema.sql         # DB initialization
├── frontend/
│   ├── Dockerfile                 # Frontend container image
│   └── .dockerignore              # Exclude files from build
├── docker-compose.yml             # Development setup
├── docker-compose.prod.yml        # Production setup
├── nginx.conf                     # Reverse proxy config
├── .env.example                   # Environment template
└── ...
```

---

## Quick Reference

| Command                                           | Purpose               |
| ------------------------------------------------- | --------------------- |
| `docker-compose up -d`                            | Start all services    |
| `docker-compose down`                             | Stop all services     |
| `docker-compose ps`                               | List running services |
| `docker-compose logs -f`                          | View logs             |
| `docker-compose build`                            | Rebuild images        |
| `docker-compose exec backend sh`                  | Access container      |
| `docker system prune`                             | Cleanup resources     |
| `docker-compose -f docker-compose.prod.yml up -d` | Production deploy     |

---

## Next Steps

1. **Development**: Run `docker-compose up -d` and start coding
2. **Testing**: Use `docker-compose` for local testing
3. **Production**: Configure `.env.prod` and deploy with `docker-compose.prod.yml`
4. **Monitoring**: Setup container monitoring with Portainer or similar
5. **CI/CD**: Integrate with GitHub Actions for auto-deployment

---

Happy containerizing! 🚀
