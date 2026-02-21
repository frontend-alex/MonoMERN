#!/bin/bash
# ============================================
# MonoMERN - Initialize SSL with Let's Encrypt
# ============================================
# Usage: ./scripts/deployment/init-ssl.sh
#
# Prerequisites:
#   1. Domain pointing to this server's IP
#   2. Port 80 and 443 open
#   3. App already running (deploy.sh first)
#   4. DOMAIN set in docker/.env.docker
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"
ENV_FILE="docker/.env.docker"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║      SSL Certificate Setup           ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ----- Read domain -----
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ $ENV_FILE not found. Run deploy.sh first.${NC}"
    exit 1
fi

DOMAIN=$(grep '^DOMAIN=' "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "example.com" ]; then
    echo -e "${RED}✗ Please set your DOMAIN in $ENV_FILE first.${NC}"
    echo -e "  Current value: ${YELLOW}${DOMAIN:-empty}${NC}"
    exit 1
fi

echo -e "${GREEN}  Domain: ${CYAN}$DOMAIN${NC}"
echo ""

# ----- Ask for email -----
read -p "  Enter email for Let's Encrypt notifications: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}✗ Email is required for Let's Encrypt.${NC}"
    exit 1
fi

# ----- Step 1: Ensure running -----
echo ""
echo -e "${YELLOW}[1/4]${NC} Ensuring app is running with HTTP config..."

docker compose -f "$COMPOSE_FILE" up -d client
sleep 3

# ----- Step 2: Obtain certificate -----
echo -e "${YELLOW}[2/4]${NC} Requesting SSL certificate from Let's Encrypt..."
echo ""

docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# ----- Step 3: Switch to SSL nginx config -----
echo ""
echo -e "${YELLOW}[3/4]${NC} Activating HTTPS configuration..."

# Replace domain placeholder in SSL config and overwrite the active nginx.conf
sed "s|DOMAIN_PLACEHOLDER|$DOMAIN|g" docker/client/nginx-ssl.conf > docker/client/nginx.conf

# Rebuild and restart client with SSL config
docker compose -f "$COMPOSE_FILE" up -d --build client

# ----- Step 4: Update CORS -----
echo -e "${YELLOW}[4/4]${NC} Updating CORS origins..."

sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=https://$DOMAIN|g" "$ENV_FILE"
docker compose -f "$COMPOSE_FILE" restart server

echo ""
echo -e "${GREEN}  ╔══════════════════════════════════════╗"
echo -e "  ║      ✓ SSL Setup Complete!           ║"
echo -e "  ╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}Your app:${NC} https://$DOMAIN"
echo ""
echo -e "  ${YELLOW}Certificate auto-renewal is active.${NC}"
echo -e "  Certbot checks every 12 hours and renews when needed."
echo ""
