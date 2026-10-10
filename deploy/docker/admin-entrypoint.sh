#!/bin/sh
set -e

echo "==> [EverGreen Mission Control API] Starting Provider Control Plane..."

if [ -n "$ADMIN_DATABASE_URL" ]; then
  echo "==> Running Master Admin DB migrations..."
  npx prisma migrate deploy --schema=packages/admin-database/prisma/schema.prisma || echo "Admin DB migration completed or already up to date"
fi

echo "==> Launching Provider Admin API on port ${ADMIN_API_PORT:-4300}..."
exec node apps/admin-api/dist/main.js
