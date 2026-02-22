# Docker Setup - Visual Reference Guide

## 🏗️ Architecture Overview

### Development Environment

```
┌────────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT (NO PROXY)                │
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │              │      │              │      │              │  │
│  │  Frontend    │      │   Backend    │      │   Database   │  │
│  │  (Next.js)   │◄───►│ (Express.js) │◄───►│   (MySQL)    │  │
│  │              │      │              │      │              │  │
│  │  Port: 3000  │      │  Port: 3001  │      │  Port: 3306  │  │
│  │              │      │              │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│        ▲                                                         │
│        │                                                         │
│        │  Browser                                               │
│        │  http://localhost:3000                                │
│        │                                                         │
│  (Your Computer)                                               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUD DEPLOYMENT (WITH PROXY)                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    INTERNET (80/443)                         │    │
│  │                         ▼                                     │    │
│  │  ┌────────────────────────────────────────────────────────┐ │    │
│  │  │           NGINX REVERSE PROXY                          │ │    │
│  │  │  (SSL/TLS, Compression, Load Balancing, Caching)      │ │    │
│  │  │                                                         │ │    │
│  │  │  ┌──────────────────┬──────────────────────────────┐  │ │    │
│  │  │  │                  │                              │  │ │    │
│  │  │  ▼ (requests to /)  ▼ (requests to /api/*)         │  │ │    │
│  │  │                                                     │  │ │    │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐ │  │ │    │
│  │  │  │                      │  │                      │ │  │ │    │
│  │  │  │  Frontend Replica 1  │  │  Backend Replica 1   │ │  │ │    │
│  │  │  │  (Next.js)           │  │  (Express.js)        │ │  │ │    │
│  │  │  │  Port: 3000          │  │  Port: 3001          │ │  │ │    │
│  │  │  └──────────────────────┘  └──────────────────────┘ │  │ │    │
│  │  │                                                     │  │ │    │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐ │  │ │    │
│  │  │  │                      │  │                      │ │  │ │    │
│  │  │  │  Frontend Replica 2  │  │  Backend Replica 2   │ │  │ │    │
│  │  │  │  (Next.js)           │  │  (Express.js)        │ │  │ │    │
│  │  │  │  Port: 3000          │  │  Port: 3001          │ │  │ │    │
│  │  │  └──────────────────────┘  └──────────────────────┘ │  │ │    │
│  │  │                                                     │  │ │    │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐ │  │ │    │
│  │  │  │                      │  │                      │ │  │ │    │
│  │  │  │  Frontend Replica N  │  │  Backend Replica N   │ │  │ │    │
│  │  │  │  (Next.js)           │  │  (Express.js)        │ │  │ │    │
│  │  │  │  Port: 3000          │  │  Port: 3001          │ │  │ │    │
│  │  │  └──────────────────────┘  └──────────────────────┘ │  │ │    │
│  │  │              │                     │                │  │ │    │
│  │  └──────────────┼─────────────────────┼────────────────┘  │ │    │
│  │                 │                     │                    │ │    │
│  │                 ▼                     ▼                    │ │    │
│  │  ┌────────────────────────────────────────────────────┐   │ │    │
│  │  │         DATABASE (MySQL)                           │   │ │    │
│  │  │         Port: 3306                                 │   │ │    │
│  │  │         Persistent Volume                          │   │ │    │
│  │  └────────────────────────────────────────────────────┘   │ │    │
│  │                                                            │ │    │
│  └────────────────────────────────────────────────────────────┘ │    │
│                                                                   │    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Container Build Hierarchy

```
DEVELOPMENT BUILD PROCESS
═════════════════════════════════════════════════════════════════

┌─ Backend/Dockerfile
│  ├─ FROM node:18-alpine (BUILD STAGE)
│  │  ├─ Install build dependencies
│  │  ├─ Copy package.json, package-lock.json
│  │  ├─ npm ci (clean install)
│  │  ├─ Copy source code
│  │  └─ npm run build (TypeScript → JavaScript)
│  │
│  ├─ Intermediate Image (~800MB)
│  │
│  └─ FROM node:18-alpine (PRODUCTION STAGE)
│     ├─ Create nodejs user (uid:1001)
│     ├─ Copy only .js files (not .ts)
│     ├─ Copy package.json files
│     ├─ npm ci --production (production deps only)
│     ├─ Setup dumb-init (PID 1)
│     ├─ Add health check
│     └─ Expose port 3001
│
└─ Final Image (~350MB) - 60% smaller!

┌─ Frontend/Dockerfile
│  ├─ FROM node:18-alpine (BUILD STAGE)
│  │  ├─ Copy package.json, package-lock.json
│  │  ├─ npm ci
│  │  ├─ Copy source code (app/, src/)
│  │  ├─ Copy public/
│  │  └─ npm run build (Next.js optimized)
│  │
│  ├─ Intermediate Image (~1.2GB)
│  │
│  └─ FROM node:18-alpine (PRODUCTION STAGE)
│     ├─ Create nodejs user
│     ├─ Copy .next/ (compiled)
│     ├─ Copy public/
│     ├─ Copy package.json
│     ├─ npm ci --production
│     ├─ Setup dumb-init
│     ├─ Add health check
│     └─ Expose port 3000
│
└─ Final Image (~400MB) - Optimized build output only
```

---

## 🔄 Service Startup Sequence

```
docker-compose up -d
│
├─ 1. MySQL Service Starts
│  │  └─ Waits for port 3306 binding
│  │  └─ Initializes schema.sql
│  │  └─ Health check: Can connect? YES ✓
│  │
│  ├─ 2. Backend Service Starts
│  │  └─ Waits for MySQL (depends_on: condition: service_healthy)
│  │  └─ Connects to database
│  │  └─ Loads environment variables from .env
│  │  └─ Server listens on port 3001
│  │  └─ Health check: GET /health → 200 ✓
│  │
│  └─ 3. Frontend Service Starts
│     └─ Waits for Backend (depends_on)
│     └─ Loads NEXT_PUBLIC_API_URL
│     └─ Next.js server starts on port 3000
│     └─ Health check: GET / → 200 ✓
│
└─ 4. Production-only: Nginx Service Starts
   └─ Waits for Frontend & Backend (healthy)
   └─ Loads nginx.conf
   └─ Listens on port 80 (redirect to 443)
   └─ Listens on port 443 (SSL/TLS)
   └─ Proxies requests to backend & frontend
```

**Typical startup time: 15-30 seconds**

---

## 💾 Volume Management

```
DEVELOPMENT (docker-compose.yml)
═════════════════════════════════════════════════════════════════

Named Volumes (Persistent):
  social-media-mysql:
    └─ /var/lib/mysql  (Database files)
    └─ Persists after restart
    └─ Shared with host machine

Bind Mounts (Live Code):
  Backend:
    └─ ./backend/src → /app/src  (Hot reload)
  Frontend:
    └─ ./frontend/app → /app     (Hot reload)
    └─ ./frontend/src → /app/src  (Hot reload)

Result: Edit code → Automatically reloads in container


PRODUCTION (docker-compose.prod.yml)
═════════════════════════════════════════════════════════════════

Named Volumes (Persistent):
  social-media-mysql:
    └─ /var/lib/mysql  (Database files)
    └─ Persists after restart
    └─ Separate from code

Code:
  └─ BAKED INTO IMAGE (not volumes)
  └─ Immutable deployment
  └─ Rollback by changing image version

Result: Reliable, reproducible deployments
```

---

## 🌐 Network Traffic Flow

```
DEVELOPMENT
────────────────────────────────────────────────────────────

Browser (Your Computer)
    │ http://localhost:3000
    ▼
[Frontend Container] (:3000)
    │ fetch('http://backend:3001/api/posts')
    ▼
[Backend Container] (:3001)  ← docker-compose network resolves "backend"
    │ SELECT * FROM posts WHERE userId = ?
    ▼
[MySQL Container] (:3306)
    │ Returns data
    ▼
[Backend] Formats JSON
    │ Returns to Frontend
    ▼
[Frontend] Renders to Browser


PRODUCTION
────────────────────────────────────────────────────────────

Browser (Your Domain)
    │ https://mydomain.com
    ▼
[Nginx Container] - Reverse Proxy (:80 → :443 SSL)
    │ SSL Termination
    │ Request to GET /          ────► Route to Frontend (:3000)
    │ Request to GET /api/*     ────► Route to Backend (:3001, LB)
    ▼
[Frontend] or [Backend Replica 1/2/N]
    │
    ├───► GET /api/posts → [Backend] → [MySQL]
    │
    ├───► GET / → [Frontend] → Browser
    │
    └───► HTTPS/TLS Encrypted + Compressed (gzip)
```

---

## 📊 Data Flow: POST Creation

```
FRONTEND (Next.js)
─────────────────────
[User creates post]
         ▼
[CreatePost.tsx validates input]
         ▼
[Calls: apiClient.posts.createPost(content, imageUrl)]
         ▼
[HTTP POST /api/posts]
    {
      "content": "Hello world!",
      "imageUrl": "..."
    }
         ▼
         │ (Network)
         ▼
BACKEND (Express.js)
─────────────────────
[POST /posts route handler]
         ▼
[Authentication check - JWT from header]
         ▼
[Validation - content length, spam check]
         ▼
[Database transaction]
    ├─ INSERT INTO post (userId, content, imageUrl, createdAt)
    ├─ SELECT * FROM hashtag WHERE tag IN (...)
    ├─ INSERT INTO postHashtag (postId, hashtagId)
    └─ UPDATE hashtag SET postCount = postCount + 1
         ▼
[Returns created post + 201 Created]
    {
      "id": "uuid...",
      "userId": "uuid...",
      "content": "Hello world!",
      "createdAt": "2024-..."
    }
         ▼
         │ (Network)
         ▼
FRONTEND (React state)
─────────────────────
[Update posts state]
         ▼
[Re-render feed]
         ▼
[New post appears at top]
```

---

## 🔐 Security Layers

```
REQUEST FLOW WITH SECURITY
═════════════════════════════════════════════════════════════

┌─ HTTPS/TLS Encryption
│  └─ All data encrypted in transit
│
├─ NGINX Reverse Proxy
│  ├─ Rate limiting (optional)
│  ├─ CORS headers validation
│  ├─ Security headers
│  │  ├─ HSTS (Strict-Transport-Security)
│  │  ├─ X-Content-Type-Options: nosniff
│  │  ├─ X-Frame-Options: DENY
│  │  └─ X-XSS-Protection
│  └─ Gzip compression
│
├─ Backend Authentication
│  ├─ JWT token validation (from header)
│  ├─ Token expiration check
│  ├─ User ID extraction from token
│  └─ Better Auth session verification
│
├─ Authorization Checks
│  ├─ Ownership verification (user can only delete own posts)
│  ├─ Admin checks (for admin endpoints)
│  └─ Privacy level checks
│
├─ Input Validation
│  ├─ Content length limits
│  ├─ Type checking (string, number, array)
│  ├─ Sanitization (remove XSS, SQL injection)
│  └─ Required fields validation
│
└─ Database Security
   ├─ Prepared statements (prevent SQL injection)
   ├─ User-based permissions (MySQL user: socialuser)
   ├─ Encrypted passwords (bcrypt)
   └─ SSL/TLS to database (optional)
```

---

## 📈 Scaling Topology

```
SINGLE INSTANCE (Development)
═════════════════════════════════════════════════════════════

[Nginx]
   ├─ Frontend (:3000)
   └─ Backend (:3001)
         │
         └─ MySQL


MULTI-INSTANCE (Production - Scaled)
═════════════════════════════════════════════════════════════

                    [Nginx] - Load Balancer
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    [Frontend]   [Frontend]   [Frontend]
    (:3000)      (:3000)      (:3000)
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    [Backend]    [Backend]    [Backend]
    (:3001)      (:3001)      (:3001)
        │             │             │
        └─────────────┼─────────────┘
                      │
                   [MySQL]
              (Single writer,
               replicas optional)


COMMAND TO SCALE:
docker-compose -f docker-compose.prod.yml scale backend=3
```

---

## 🚀 Deployment Steps

```
STEP 1: Preparation
├─ Copy docker-compose.prod.yml to server
├─ Setup .env file with production values
├─ Create ssl/ directory with certificates
├─ Update nginx.conf with domain name
└─ Verify all .env secrets are strong

STEP 2: Infrastructure
├─ Ensure Docker Engine is installed
├─ Ensure Docker Compose is installed
├─ Create project directory: /opt/social-media
└─ Place all docker files there

STEP 3: Database
├─ Volume will auto-create: social-media-mysql
├─ Schema auto-initializes from schema.sql
└─ Data persists across restarts

STEP 4: Build
├─ docker-compose -f docker-compose.prod.yml build
├─ This creates backend:latest, frontend:latest
├─ Images tagged for easy rollback
└─ Typical time: 3-5 minutes

STEP 5: Run
├─ docker-compose -f docker-compose.prod.yml up -d
├─ Services start in dependency order
├─ Health checks verify all services ready
└─ Nginx proxies traffic to frontend/backend

STEP 6: Verify
├─ docker-compose ps (all healthy?)
├─ curl https://yourdomain.com (frontend?)
├─ curl https://yourdomain.com/api/health (backend?)
└─ Check logs: docker-compose logs -f

STEP 7: Monitor
├─ docker stats (resource usage)
├─ docker-compose logs (errors/warnings)
├─ Setup alerts (optional)
└─ Regular backups of MySQL volume
```

---

## 🔄 Rolling Update Process

```
ZERO-DOWNTIME DEPLOYMENT (N=2 backends)
═════════════════════════════════════════════════════════════

Step 1: Update Code
    Code changes pushed to repo

Step 2: Build New Images
    docker-compose build backend
    backend:v2 image created

Step 3: Service Replacement #1
    docker-compose up -d --no-deps backend
    ├─ Starts backend:v2 replica
    ├─ Existing backend:v1 still handles traffic
    ├─ Nginx detects replica ready (health check)
    ├─ Nginx starts routing to v2
    └─ v1 connections drain (max 30s)

Step 4: Service Replacement #2
    Remaining backend:v1 instances update to v2
    ├─ One by one (if scaled > 1)
    └─ Ensures always N-1 running

Step 5: Verification
    All traffic now on backend:v2
    ├─ Check application functionality
    ├─ Monitor error logs
    └─ Ready for next update

Result: Zero downtime, users unaffected!

Rollback (if needed):
    docker-compose up -d --build  # Uses previous version
    Nginx routes back to v1
```

---

## 📊 Resource Allocation

```
RECOMMENDED FOR PRODUCTION
═════════════════════════════════════════════════════════════

System Requirements:
├─ CPU: 4 cores minimum (2x for high traffic)
├─ RAM: 8GB minimum (backend + frontend + MySQL)
├─ Storage: 50GB (database growth room)
└─ Network: 10Mbps+ connection

Docker Resource Limits:
├─ Backend (per instance)
│  ├─ CPU limit: 1 core
│  ├─ Memory limit: 512MB
│  └─ Memory reservation: 256MB
│
├─ Frontend (per instance)
│  ├─ CPU limit: 1 core
│  ├─ Memory limit: 512MB
│  └─ Memory reservation: 256MB
│
└─ MySQL
   ├─ CPU limit: 2 cores
   ├─ Memory limit: 2GB
   └─ Memory reservation: 1GB

Define in docker-compose.prod.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## ✅ Deployment Checklist

```
PRE-DEPLOYMENT
  [ ] All code tested locally
  [ ] .env file configured with production values
  [ ] SSL certificates obtained and placed in ssl/
  [ ] Database schema verified
  [ ] nginx.conf domain name updated
  [ ] Docker images built successfully
  [ ] No security credentials in code

DEPLOYMENT
  [ ] Server environment ready (Docker, Compose)
  [ ] Files copied to server
  [ ] .env loaded with correct values
  [ ] docker-compose build completes
  [ ] docker-compose up -d starts all services
  [ ] All services show healthy status
  [ ] Health checks pass

POST-DEPLOYMENT
  [ ] Frontend accessible via domain
  [ ] API responding to health check
  [ ] SSL certificate valid
  [ ] Database connected and initialized
  [ ] Error logs checked (should be empty)
  [ ] Performance baseline established
  [ ] Backups scheduled
  [ ] Monitoring configured
  [ ] Alerts set up for failures
```

---

**Visual reference complete! Use this alongside the documentation files for comprehensive Docker understanding.** 📚
