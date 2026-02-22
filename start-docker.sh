#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Social Media App - Docker Startup${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✓ Docker daemon is running${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}! .env file not found${NC}"
    echo "Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo -e "${YELLOW}! Please review and update .env with your values${NC}\n"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}\n"
fi

# Ask user for mode
echo -e "${BLUE}Select deployment mode:${NC}"
echo "1) Development (docker-compose.yml)"
echo "2) Production (docker-compose.prod.yml)"
echo "3) Exit"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo -e "\n${BLUE}Starting in DEVELOPMENT mode...${NC}\n"
        MODE="dev"
        COMPOSE_FILE="docker-compose.yml"
        ;;
    2)
        echo -e "\n${BLUE}Starting in PRODUCTION mode...${NC}\n"
        MODE="prod"
        COMPOSE_FILE="docker-compose.prod.yml"
        
        # Check for SSL certificates in production
        if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
            echo -e "${YELLOW}! SSL certificates not found${NC}"
            echo "For production, you need SSL certificates at:"
            echo "  - ssl/cert.pem"
            echo "  - ssl/key.pem"
            echo ""
            echo "Generate self-signed certificate (testing only):"
            echo "  mkdir -p ssl"
            echo "  openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365"
            echo ""
            read -p "Continue anyway? [y/N]: " continue_without_ssl
            if [ "$continue_without_ssl" != "y" ]; then
                exit 1
            fi
        fi
        ;;
    3)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Build images
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}\n"

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start services${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Services started${NC}\n"

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo -e "${BLUE}Service status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo ""

# Display access information
if [ "$MODE" = "dev" ]; then
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}  DEVELOPMENT ENVIRONMENT READY${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${BLUE}Access your application:${NC}"
    echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
    echo -e "  Backend API: ${YELLOW}http://localhost:3001${NC}"
    echo -e "  Database: ${YELLOW}localhost:3306${NC}"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Access backend: docker-compose exec backend sh"
    echo "  • Access frontend: docker-compose exec frontend sh"
    echo "  • Database shell: docker-compose exec mysql mysql -u socialuser -p"
else
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}  PRODUCTION ENVIRONMENT READY${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${BLUE}Access your application:${NC}"
    echo -e "  Frontend: ${YELLOW}https://your-domain.com${NC}"
    echo -e "  Backend API: ${YELLOW}https://your-domain.com/api${NC}"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "  • View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  • Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "  • Scale backend: docker-compose -f docker-compose.prod.yml up -d --scale backend=3"
fi

echo ""
echo -e "${BLUE}For more help, see: DOCKER_GUIDE.md${NC}\n"

# Wait for services to stabilize and run health checks
echo -e "${BLUE}Running health checks...${NC}"
sleep 5

# Check if all services are healthy
UNHEALTHY=$(docker-compose -f "$COMPOSE_FILE" ps | grep -i "unhealthy" | wc -l)

if [ $UNHEALTHY -eq 0 ]; then
    echo -e "${GREEN}✓ All services are healthy${NC}"
else
    echo -e "${YELLOW}! Some services may still be starting ${NC}"
    echo "Check logs: docker-compose -f $COMPOSE_FILE logs -f"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}\n"
