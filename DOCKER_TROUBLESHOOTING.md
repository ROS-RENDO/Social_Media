# Docker Troubleshooting Quick Reference

## Common Issues & Solutions

---

### **Issue: Docker daemon is not running**

**Symptoms:**

- Error: `Cannot connect to Docker daemon`
- `Docker is not running`

**Solutions:**

```bash
# Windows: Start Docker Desktop from Start menu
# Or use PowerShell
Start-Process "Docker Desktop"

# Linux: Start Docker service
sudo systemctl start docker

# Verify
docker ps
```

---

### **Issue: Port Already in Use**

**Symptoms:**

- Error: `Bind for 0.0.0.0:3000 failed: port is already allocated`
- Services fail to start

**Solutions:**

```bash
# Find process on port (Linux/Mac)
lsof -i :3000
lsof -i :3001
lsof -i :3306

# Kill process
kill -9 <PID>

# Windows: Find process on port
netstat -ano | findstr :3000

# Kill Windows process
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
# ports:
#   - "3001:3000"  # Change to 3005:3000
```

**Alternative:** Use different ports in docker-compose.yml

```yaml
services:
  frontend:
    ports:
      - "3002:3000" # Changed from 3000:3000
  backend:
    ports:
      - "3002:3001" # Changed from 3001:3001
```

---

### **Issue: Database Connection Failed**

**Symptoms:**

- Error: `Error: connect ECONNREFUSED 127.0.0.1:3306`
- Backend can't connect to database

**Solutions:**

```bash
# Check MySQL is running
docker-compose ps mysql

# View MySQL logs
docker-compose logs mysql

# Test MySQL connection
docker-compose exec backend mysql -h mysql -u socialuser -p social_media
# Password: userpassword

# Verify network connectivity
docker-compose exec backend ping mysql

# Check MySQL port
docker-compose port mysql 3306

# Restart MySQL
docker-compose restart mysql

# Check database exists
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
# Password: rootpassword

# Check user permissions
docker-compose exec mysql mysql -u root -p -e "SELECT user, host FROM mysql.user;"
```

**Also check:**

- `MYSQL_HOST` environment variable = `mysql` (not localhost)
- `MYSQL_PORT` = `3306`
- `.env` file has correct credentials

---

### **Issue: Frontend Can't Connect to Backend API**

**Symptoms:**

- 404 errors on API calls
- `Cannot POST /api/...`
- CORS errors in browser console

**Solutions:**

```bash
# Check backend is running
docker-compose ps backend

# Test backend is responsive
curl http://localhost:3001/health

# Inside frontend container
docker-compose exec frontend sh
curl http://backend:3001/health

# Check environment variable
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Verify Docker network
docker network inspect social-media-network

# Ping backend from frontend
docker-compose exec frontend ping backend

# Check Nginx config (production)
docker-compose exec nginx nginx -t

# View Nginx logs
docker-compose logs nginx
```

**Common causes:**

- `NEXT_PUBLIC_API_URL` not set correctly
- Backend service name not `backend` in docker-compose.yml
- CORS headers not configured
- Nginx routing incorrect (production)

---

### **Issue: Services Keep Restarting**

**Symptoms:**

- Container restarts continuously
- Shows `Restarting (1) 2s`

**Solutions:**

```bash
# View full logs
docker-compose logs backend --tail=100

# Check exit code (0 = clean exit, 1+ = error)
docker-compose ps

# Increase verbosity
docker-compose logs backend -f

# Interactive debugging
docker-compose exec backend sh
# Then run manually to see errors

# Check for permission issues
docker-compose exec backend whoami

# View container memory/CPU
docker stats
```

**Common causes:**

- Application crashes (check logs)
- Port binding failures
- Database not ready
- Memory issues
- File permission problems

---

### **Issue: Out of Disk Space**

**Symptoms:**

- Error: `No space left on device`
- Build fails

**Solutions:**

```bash
# Check Docker disk usage
docker system df

# Clean up dangling images
docker image prune

# Clean up dangling volumes
docker volume prune

# Remove unused containers and images
docker system prune

# Remove EVERYTHING (careful!)
docker system prune -a --volumes

# View largest images
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}" | sort -k2 -h | tail -20

# Clean up specific volume
docker volume rm <volume_name>
```

---

### **Issue: Permission Denied Errors**

**Symptoms:**

- Error: `permission denied while trying to connect to Docker daemon`
- `Cannot start service: 'overlay' does not support changing ownership`

**Solutions:**

```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker
sudo systemctl restart docker

# Or use sudo prefix
sudo docker-compose up

# Check file permissions
ls -la Dockerfile
chmod 644 Dockerfile

# Fix volume permission issues
docker-compose exec -u root backend chown -R node:node /app
```

---

### **Issue: Health Check Failures**

**Symptoms:**

- Status shows `Unhealthy`
- Containers marked as `(health: unhealthy)`

**Solutions:**

```bash
# Check health status
docker-compose ps

# View full container details
docker inspect social-media-backend | grep -A 10 "Health"

# Manual health check
docker-compose exec backend curl localhost:3001/health

# View health logs
docker-compose logs backend | grep -i health

# Increase health check timeout
# In docker-compose.yml:
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
#   interval: 30s
#   timeout: 10s  # Increase this
#   retries: 3
#   start_period: 40s

# Rebuild and restart
docker-compose up -d --build
```

---

### **Issue: Build Fails**

**Symptoms:**

- Error during `docker-compose build`
- `Failed to build image`

**Solutions:**

```bash
# Rebuild with verbose output
docker-compose build --no-cache backend

# Check Dockerfile syntax
docker build --progress=plain -f backend/Dockerfile .

# Check for missing files
ls -la backend/package.json
ls -la backend/tsconfig.json

# Clear build cache
docker builder prune

# Check Node version compatibility
cat backend/Dockerfile | grep FROM

# Try building manually
cd backend
docker build -t social-media-backend:dev .

# Check for large files
find . -size +100M
```

---

### **Issue: Container Exited with Code 1 or 137**

**Symptoms:**

- `exited with code 137` (out of memory)
- `exited with code 1` (general error)

**Solutions:**

```bash
# Exit Code 137 = Out of Memory (OOMKilled)
docker stats  # Check memory usage

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Reduce memory usage in app
# Check for memory leaks in backend logs

# Exit Code 1 = General Error
docker logs <container_id>

# Get more details
docker inspect <container_id> | grep -A 20 "State"

# Run interactively to see error
docker run -it backend:latest sh
npm start
```

---

### **Issue: Network Connectivity Issues**

**Symptoms:**

- Services can't find each other
- `getaddrinfo ENOTFOUND backend`

**Solutions:**

```bash
# Check Docker network
docker network ls
docker network inspect social-media-network

# Test connectivity between containers
docker-compose exec frontend ping backend
docker-compose exec backend ping mysql

# Check DNS resolution
docker-compose exec frontend nslookup backend

# Verify service names match docker-compose.yml
cat docker-compose.yml | grep "services:" -A 20

# Force network recreation
docker network rm social-media-network
docker-compose down
docker-compose up -d

# Check container IP addresses
docker inspect social-media-backend | grep IPAddress
docker inspect social-media-mysql | grep IPAddress
```

---

### **Issue: Database Not Initializing**

**Symptoms:**

- Tables not created
- Error: `Table 'social_media.user' doesn't exist`

**Solutions:**

```bash
# Check schema.sql exists
ls -la backend/src/db/schema.sql

# Verify MySQL logs
docker-compose logs mysql | grep -i "error\|schema"

# Manual schema import
docker-compose exec mysql mysql -u root -p social_media < backend/src/db/schema.sql
# Password: rootpassword

# Check if database exists
docker-compose exec mysql mysql -u root -p -e "USE social_media; SHOW TABLES;"

# Recreate database
docker-compose exec mysql mysql -u root -p -e "DROP DATABASE social_media; CREATE DATABASE social_media;"

# Force reimport
docker volume rm social-media-mysql
docker-compose up -d mysql
sleep 30  # Wait for initialization
docker-compose exec mysql mysql -u socialuser -p social_media < backend/src/db/schema.sql
```

---

### **Issue: Nginx Not Working (Production)**

**Symptoms:**

- Error: `Failed to establish connection`
- Nginx container not starting

**Solutions:**

```bash
# Check Nginx syntax
docker-compose exec nginx nginx -t

# View Nginx logs
docker-compose logs nginx

# Test Nginx is running
docker-compose exec nginx ps aux | grep nginx

# Check Nginx configuration
docker-compose exec nginx cat /etc/nginx/nginx.conf

# Check SSL certificates exist
docker-compose exec nginx ls -la /etc/nginx/ssl/

# Test frontend response
docker-compose exec nginx curl http://frontend:3000

# Test backend response
docker-compose exec nginx curl http://backend:3001

# Verify upstream configuration
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf | grep upstream
```

---

### **Issue: SSL Certificate Errors**

**Symptoms:**

- Error: `no such file or directory: /etc/nginx/ssl/cert.pem`
- SSL connection failures

**Solutions:**

```bash
# Create self-signed certificate
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -nodes \
  -out ssl/cert.pem \
  -keyout ssl/key.pem \
  -days 365

# Mount correctly in docker-compose.prod.yml
volumes:
  - ./ssl:/etc/nginx/ssl

# Verify certificate is readable
docker-compose exec nginx ls -la /etc/nginx/ssl/

# Check certificate expiration
docker-compose exec nginx openssl x509 -in /etc/nginx/ssl/cert.pem -noout -dates

# Use Let's Encrypt (production)
docker run -it --rm -v ./ssl:/etc/letsencrypt certbot/certbot \
  certonly --standalone -d yourdomain.com
```

---

### **Issue: Memory Leaks / High CPU Usage**

**Symptoms:**

- Container uses 90%+ CPU/Memory
- Services slow down over time

**Solutions:**

```bash
# Monitor resource usage
docker stats --no-stream

# Top processes in container
docker-compose exec backend top

# Check for Node memory leaks
docker-compose logs backend | grep "heap"

# Profile Node application
docker-compose exec backend node --inspect=0.0.0.0 src/index.ts

# Limit memory in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

# Restart service to clear memory
docker-compose restart backend

# Check for zombie processes
docker-compose exec backend ps aux

# Use memory profiling tools
npm install clinic
docker-compose exec backend clinic doctor -- npm start
```

---

### **Issue: Image Too Large**

**Symptoms:**

- Build takes very long
- Image size >1GB

**Solutions:**

```bash
# Check image size
docker images

# Use multi-stage build
# First stage (builder)
FROM node:18-alpine AS builder
# Second stage (production)
FROM node:18-alpine

# Remove unnecessary files
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore
echo "tests" >> .dockerignore
echo "docs" >> .dockerignore

# Use alpine instead of full Node
FROM node:18-alpine  # Much smaller than node:18

# Rebuild without cache
docker-compose build --no-cache

# Check layer sizes
docker history social-media-backend:latest

# Optimize build
npm ci  # instead of npm install
npm prune --production
```

---

## Quick Debug Commands

```bash
# All status
docker-compose ps

# Follow all logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Service details
docker-compose exec backend env

# Network test
docker-compose exec backend ping mysql

# Database test
docker-compose exec mysql mysql -u socialuser -p social_media

# Backend health
curl http://localhost:3001/health

# Frontend access
curl http://localhost:3000

# View resources
docker stats

# Clean everything
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

---

## When All Else Fails

```bash
# Complete reset
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d

# Check Docker installation
docker version
docker info

# WSL2 issues (Windows)
# Restart WSL2
wsl --shutdown
# Then restart Docker Desktop

# Reinstall Docker
# Uninstall > Restart > Reinstall from Docker Desktop
```

---

**Still not working?** Check logs with maximum detail:

```bash
docker-compose logs --tail=200 --timestamps
```

Then review [DOCKER_GUIDE.md](DOCKER_GUIDE.md) or create an issue with logs attached.
