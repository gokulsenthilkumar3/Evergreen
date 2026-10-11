#!/bin/sh
set -e

echo "==> [EverGreen Mission Control API] Starting Provider Control Plane..."

: "${ADMIN_DATABASE_URL:?ADMIN_DATABASE_URL is required}"
: "${ADMIN_API_KEY:?ADMIN_API_KEY is required}"
if [ -n "$ADMIN_DATABASE_URL" ]; then
  echo "==> Running Master Admin DB migrations..."
  node node_modules/prisma/build/index.js migrate deploy --schema=packages/admin-database/prisma/schema.prisma
fi

echo "==> Launching Provider Admin API on port ${ADMIN_API_PORT:-4300}..."
exec node apps/admin-api/dist/main.js
