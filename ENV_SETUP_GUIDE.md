# Environment Variables Setup Guide

## ✅ What Changed

Your docker-compose files now use environment variables from `.env` file **without exposing them** as hardcoded values or defaults in the compose files.

### Before (Insecure ❌)

```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword} # Default exposed!
  MYSQL_PASSWORD: userpassword # Hardcoded exposed!
```

### After (Secure ✅)

```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD} # Only from .env
  MYSQL_PASSWORD: ${MYSQL_PASSWORD} # Only from .env
```

---

## 📁 Files Updated

✅ `docker-compose.yml` - Development environment  
✅ `docker-compose.prod.yml` - Production environment  
✅ `.env` - Updated with all variables  
✅ `.env.example` - Template for new users

---

## 🔑 All Environment Variables

### Docker & Database (Required for docker-compose)

```
MYSQL_ROOT_PASSWORD    Root database password
MYSQL_DATABASE         Database name
MYSQL_USER             Database user
MYSQL_PASSWORD         Database user password
```

### Backend Configuration

```
NODE_ENV               Environment (development/production)
PORT                   Backend server port
FRONTEND_URL           Frontend application URL
JWT_SECRET             JWT signing secret (32+ chars)
BETTER_AUTH_SECRET     Auth session secret (32+ chars)
```

### Frontend Configuration

```
NEXT_PUBLIC_API_URL           Backend API URL (visible to browser)
NEXT_PUBLIC_BETTER_AUTH_URL   Auth server URL (visible to browser)
```

---

## 🚀 How to Use

### 1️⃣ Setup for Development

No hardcoded values - all from `.env`:

```bash
# Copy template
cp .env.example .env

# .env file now has:
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=social_media
MYSQL_USER=socialuser
MYSQL_PASSWORD=userpassword
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-...
BETTER_AUTH_SECRET=your-better-auth-secret-...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001

# Start services (loads from .env automatically)
docker-compose up -d
```

### 2️⃣ Setup for Production

Update `.env` with production values:

```bash
# Edit .env with production values:
MYSQL_ROOT_PASSWORD=YourStrongPassword123!
MYSQL_PASSWORD=AnotherStrongPassword456!
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg...  # Long random string
BETTER_AUTH_SECRET=XYZabcdefghijklmnopqrstuvwxyz123... # Long random string
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com

# Deploy production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Benefits

✅ **No hardcoded secrets** - All secrets in `.env` file (not in git)  
✅ **No default values** - Forces you to set proper values  
✅ **Easy management** - Single `.env` file for all environments  
✅ **Git-safe** - Add `.env` to `.gitignore` (already done)  
✅ **Environment-specific** - Different `.env` for dev/prod

---

## 📋 Checklist

### Development Setup

- [ ] `.env` file exists in project root
- [ ] `docker-compose.yml` uses `${VARIABLE_NAME}` (no defaults)
- [ ] Run `docker-compose up -d`
- [ ] All services start successfully

### Production Setup

- [ ] Create `.env` file with production values
- [ ] All `MYSQL_*` variables are strong passwords
- [ ] `JWT_SECRET` and `BETTER_AUTH_SECRET` are 32+ chars
- [ ] URLs updated to your domain
- [ ] Run `docker-compose -f docker-compose.prod.yml up -d`

---

## 🔍 How Docker Compose Loads Variables

Docker Compose automatically loads variables from `.env` file in this order:

1. Looks for `.env` file in current directory
2. Replaces `${VARIABLE_NAME}` with value from `.env`
3. Fails if variable not found (no defaults)

**Example:**

```bash
# .env file
MYSQL_ROOT_PASSWORD=mypassword

# docker-compose.yml
MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}

# Result: MYSQL_ROOT_PASSWORD=mypassword
```

---

## ⚡ Quick Commands

```bash
# Start development (auto-loads .env)
docker-compose up -d

# Start production (auto-loads .env)
docker-compose -f docker-compose.prod.yml up -d

# View all loaded environment variables
docker-compose config

# Check if .env is loaded
docker-compose exec backend env | grep MYSQL
```

---

## ⚠️ Common Issues

### "Variable not found" error

```
ERROR: Missing mandatory value for 'MYSQL_ROOT_PASSWORD'
```

**Solution:** Make sure `.env` file exists and has all variables

### Variables not updating

```
Changes to .env not reflecting in containers
```

**Solution:** Rebuild containers:

```bash
docker-compose down
docker-compose up -d --build
```

### Different values in dev/prod

````
Keep separate .env files:
```bash
# Development
.env

# Production
.env.prod
# Then use: docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
````

---

## 📚 File Reference

| File                      | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `.env`                    | **Active** - Contains your actual values     |
| `.env.example`            | **Template** - Shows all available variables |
| `docker-compose.yml`      | Dev compose, uses `${VAR}` syntax            |
| `docker-compose.prod.yml` | Prod compose, uses `${VAR}` syntax           |

---

## 🎯 Best Practices

✅ Never commit `.env` to git (use `.env.example` instead)  
✅ Use strong passwords in production (20+ characters)  
✅ Use unique secrets for each environment  
✅ Rotate secrets regularly in production  
✅ Document all variables in `.env.example`  
✅ Use environment-specific files for prod

---

## 📖 Learn More

**Docker Environment Variables:**
https://docs.docker.com/compose/env-file/

**Security Best Practices:**
https://12factor.net/config

---

**Your setup is now more secure with all sensitive data in `.env` file!** 🔒
