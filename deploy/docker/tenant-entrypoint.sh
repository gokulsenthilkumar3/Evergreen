#!/bin/sh
set -e

echo "==> [EverGreen Tenant API] Bootstrapping tenant customer node..."

# Run database migrations if SQLite file or Postgres connection is defined
if [ -n "$DATABASE_URL" ]; then
  echo "==> Running Prisma schema migrations..."
  npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma || echo "Migration warning: proceeding with existing schema"
fi

echo "==> Starting Tenant API server on port ${EVERGREEN_API_PORT:-4301}..."
exec node apps/api/dist/main.js
