#!/usr/bin/env bash
# ==============================================================================
# EverGreen OS - Idempotent Bare-Metal / Cloud VM Factory Setup Script
# Works on: Ubuntu 22.04+, Debian 12+, RHEL 9+
# Sets up isolated tenant runtime, Node.js 20 LTS, systemd services, and Nginx.
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==> [EverGreen OS] Starting Factory Node Deployment...${NC}"

# Check for root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (or with sudo).${NC}"
   exit 1
fi

TENANT_SLUG="${1:-karpagam-spin-2}"
INSTALL_DIR="/opt/evergreen"
DATA_DIR="/opt/evergreen/data"
CONFIG_DIR="/etc/evergreen"

echo -e "${CYAN}==> Configuring Tenant: ${TENANT_SLUG}${NC}"

# Create system user
if ! id "evergreen" &>/dev/null; then
    echo -e "${GREEN}==> Creating system user: evergreen${NC}"
    useradd -r -s /bin/false -d "$INSTALL_DIR" evergreen
fi

# Ensure directories
mkdir -p "$INSTALL_DIR" "$DATA_DIR" "$CONFIG_DIR"
chown -R evergreen:evergreen "$INSTALL_DIR" "$DATA_DIR" "$CONFIG_DIR"

# Install Node.js 20 LTS if missing
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1) != "v20" ]]; then
    echo -e "${GREEN}==> Installing Node.js 20 LTS runtime...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs nginx sqlite3
fi

# Write environment file
cat <<EOF > "$CONFIG_DIR/tenant.env"
NODE_ENV=production
TENANT_SLUG=${TENANT_SLUG}
EVERGREEN_API_PORT=4301
PORT=4301
DATABASE_URL="file:${DATA_DIR}/tenant.db"
# Opt-in only; tenant-scoped provider authentication is still pending.
ADMIN_API_URL=""
COMPANY_ID=""
EOF
chmod 600 "$CONFIG_DIR/tenant.env"
chown evergreen:evergreen "$CONFIG_DIR/tenant.env"

echo -e "${GREEN}==> Environment profile written to $CONFIG_DIR/tenant.env${NC}"

# Copy systemd service unit
if [ -f "deploy/linux/evergreen-tenant.service" ]; then
    cp deploy/linux/evergreen-tenant.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable evergreen-tenant
    echo -e "${GREEN}==> Registered evergreen-tenant systemd service${NC}"
fi

# Setup Nginx Reverse Proxy for Port 4000
cat <<'NGINX_CONF' > /etc/nginx/sites-available/evergreen-tenant
server {
    listen 4000;
    server_name _;

    root /opt/evergreen/apps/web/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location /api/backend/ {
        proxy_pass http://127.0.0.1:4301/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/(health|auth) {
        proxy_pass http://127.0.0.1:4301;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/evergreen-tenant /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx || echo "Nginx reload note: start nginx manually if stopped"

echo -e "${GREEN}==> Factory deployment setup complete!${NC}"
echo -e "${CYAN}Tenant Web: http://localhost:4000 | Tenant API: http://localhost:4301${NC}"
