#!/bin/bash
# ============================================
# MonoMERN Deploy Script
# ============================================
# Quick deploy: ./scripts/deployment/deploy.sh
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Navigate to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║       MonoMERN Deployment            ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ----- Step 1: Check prerequisites -----
echo -e "${YELLOW}[1/4]${NC} Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker Desktop.${NC}"
    echo "  → https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}  ✓ Docker found${NC}"

if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not available.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Docker Compose found${NC}"

# ----- Step 2: Environment file -----
echo -e "${YELLOW}[2/4]${NC} Setting up environment..."

ENV_FILE="docker/.env.docker"
ENV_EXAMPLE="docker/.env.docker.example"

if [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo -e "${GREEN}  ✓ Created $ENV_FILE from template${NC}"
    echo -e "${YELLOW}  ⚠ Please edit $ENV_FILE with your configuration.${NC}"
    echo ""
    echo -e "  Required changes:"
    echo -e "    • ${CYAN}DOMAIN${NC}              → Your domain (e.g., myapp.com)"
    echo -e "    • ${CYAN}SESSION_SECRET${NC}      → Random secret string"
    echo -e "    • ${CYAN}JWT_SECRET${NC}          → Random secret string"
    echo -e "    • ${CYAN}JWT_REFRESH_SECRET${NC}  → Random secret string"
    echo -e "    • ${CYAN}OTP_EMAIL${NC}           → Email for OTP verification"
    echo -e "    • ${CYAN}OTP_EMAIL_PASSWORD${NC}  → App password for email"
    echo -e "    • ${CYAN}CORS_ORIGINS${NC}        → https://yourdomain.com"
    echo ""
    read -p "  Press Enter when you've finished editing $ENV_FILE..."
else
    echo -e "${GREEN}  ✓ $ENV_FILE already exists${NC}"
fi

# ----- Step 3: Generate secrets if still default -----
echo -e "${YELLOW}[3/4]${NC} Checking secrets..."

generate_secret() {
    openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

if grep -q "CHANGE_ME_RANDOM_SECRET" "$ENV_FILE" 2>/dev/null; then
    SECRET=$(generate_secret)
    sed -i "s|CHANGE_ME_RANDOM_SECRET|$SECRET|g" "$ENV_FILE"
    echo -e "${GREEN}  ✓ Generated SESSION_SECRET${NC}"
fi

if grep -q "CHANGE_ME_JWT_SECRET" "$ENV_FILE" 2>/dev/null; then
    SECRET=$(generate_secret)
    sed -i "s|CHANGE_ME_JWT_SECRET|$SECRET|g" "$ENV_FILE"
    echo -e "${GREEN}  ✓ Generated JWT_SECRET${NC}"
fi

if grep -q "CHANGE_ME_JWT_REFRESH_SECRET" "$ENV_FILE" 2>/dev/null; then
    SECRET=$(generate_secret)
    sed -i "s|CHANGE_ME_JWT_REFRESH_SECRET|$SECRET|g" "$ENV_FILE"
    echo -e "${GREEN}  ✓ Generated JWT_REFRESH_SECRET${NC}"
fi

# ----- Step 4: Deploy -----
echo -e "${YELLOW}[4/4]${NC} Building and deploying..."
echo ""

docker compose -f docker/docker-compose.yml up --build -d

echo ""
echo -e "${GREEN}  ╔══════════════════════════════════════╗"
echo -e "  ║       ✓ Deployment Complete!         ║"
echo -e "  ╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}App:${NC}    http://localhost"
echo -e "  ${CYAN}API:${NC}    http://localhost/api/v1"
echo -e "  ${CYAN}Health:${NC} http://localhost/health"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo -e "    docker compose -f docker/docker-compose.yml logs -f       ${CYAN}# View logs${NC}"
echo -e "    docker compose -f docker/docker-compose.yml restart       ${CYAN}# Restart${NC}"
echo -e "    docker compose -f docker/docker-compose.yml down          ${CYAN}# Stop all${NC}"
echo ""
echo -e "  ${YELLOW}To enable HTTPS:${NC}"
echo -e "    ./scripts/deployment/init-ssl.sh"
echo ""
