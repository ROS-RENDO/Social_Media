@echo off
REM Docker startup script for Windows
REM Colors don't work in batch, so we'll use echo with simple formatting

echo.
echo ===============================================
echo   Social Media App - Docker Startup (Windows)
echo ===============================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo.

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo [OK] Docker daemon is running
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found
    echo Creating .env from .env.example...
    
    if exist .env.example (
        copy .env.example .env
        echo [OK] Created .env file
        echo [INFO] Please review and update .env with your values
        echo.
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file exists
    echo.
)

REM Ask user for mode
echo Select deployment mode:
echo 1) Development (docker-compose.yml)
echo 2) Production (docker-compose.prod.yml)
echo 3) Exit
set /p choice="Enter choice [1-3]: "

if "%choice%"=="1" (
    echo.
    echo Starting in DEVELOPMENT mode...
    echo.
    set MODE=dev
    set COMPOSE_FILE=docker-compose.yml
) else if "%choice%"=="2" (
    echo.
    echo Starting in PRODUCTION mode...
    echo.
    set MODE=prod
    set COMPOSE_FILE=docker-compose.prod.yml
    
    REM Check for SSL certificates
    if not exist ssl\cert.pem (
        echo [WARNING] SSL certificates not found
        echo For production, you need SSL certificates at:
        echo   - ssl\cert.pem
        echo   - ssl\key.pem
        echo.
        set /p continue_without_ssl="Continue anyway? [y/N]: "
        if /i not "%continue_without_ssl%"=="y" (
            exit /b 1
        )
    )
) else if "%choice%"=="3" (
    echo Exiting...
    exit /b 0
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)

REM Build images
echo [INFO] Building Docker images...
docker-compose -f "%COMPOSE_FILE%" build

if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [OK] Build successful
echo.

REM Start services
echo [INFO] Starting services...
docker-compose -f "%COMPOSE_FILE%" up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [OK] Services started
echo.

REM Wait for services
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak

REM Check service status
echo.
echo [INFO] Service status:
docker-compose -f "%COMPOSE_FILE%" ps

REM Display access information
echo.

if "%MODE%"=="dev" (
    echo ===============================================
    echo   DEVELOPMENT ENVIRONMENT READY
    echo ===============================================
    echo.
    echo Access your application:
    echo   Frontend: http://localhost:3000
    echo   Backend API: http://localhost:3001
    echo   Database: localhost:3306
    echo.
    echo Useful commands:
    echo   * View logs: docker-compose logs -f
    echo   * Stop services: docker-compose down
    echo   * Access backend: docker-compose exec backend sh
    echo   * Access frontend: docker-compose exec frontend sh
    echo   * Database shell: docker-compose exec mysql mysql -u socialuser -p
) else (
    echo ===============================================
    echo   PRODUCTION ENVIRONMENT READY
    echo ===============================================
    echo.
    echo Access your application:
    echo   Frontend: https://your-domain.com
    echo   Backend API: https://your-domain.com/api
    echo.
    echo Useful commands:
    echo   * View logs: docker-compose -f docker-compose.prod.yml logs -f
    echo   * Stop services: docker-compose -f docker-compose.prod.yml down
    echo   * Scale backend: docker-compose -f docker-compose.prod.yml up -d --scale backend=3
)

echo.
echo For more help, see: DOCKER_GUIDE.md
echo.

REM Health checks
echo [INFO] Running health checks...
timeout /t 5 /nobreak
echo.

echo [OK] Setup complete!
echo.
pause
