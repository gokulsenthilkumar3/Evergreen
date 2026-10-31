#!/bin/sh
set -eu
# Only the volume needs ownership repair; the application remains image-owned.
if [ "$(id -u)" = 0 ]; then
  mkdir -p /data
  chown -R node:node /data
  exec gosu node "$0" "$@"
fi
# A compose run command is used for snapshots and checks, never implicit migrations.
if [ "$#" -eq 2 ] && [ "$1" = node ] && { [ "$2" = apps/api/dist/main.js ] || [ "$2" = apps/admin-api/dist/main.js ]; }; then
  node -e "require('@evergreen/types/licensing').requireInstallationLicence(process.env.EVERGREEN_PLANE)"
  if [ "$EVERGREEN_PLANE" = tenant ]; then
    : "${JWT_SECRET:?JWT_SECRET is required}"
    : "${ENCRYPTION_SECRET:?ENCRYPTION_SECRET is required}"
    database="${DATABASE_URL#file:}"
  else
    : "${ADMIN_API_KEY:?ADMIN_API_KEY is required}"
    database="${ADMIN_DATABASE_URL#file:}"
  fi
  case "$database" in /data/*.db) ;; *) echo 'Database must be inside /data' >&2; exit 1 ;; esac
  node scripts/release/database.cjs migrate "$EVERGREEN_PLANE" "$database"
fi
exec "$@"
