# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS dependencies
WORKDIR /app
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# All workspace manifests must be present when resolving the root lockfile.
COPY package.json package-lock.json ./
COPY apps/admin-api/package.json ./apps/admin-api/
COPY apps/admin-web/package.json ./apps/admin-web/
COPY apps/api/package.json ./apps/api/
COPY apps/desktop/package.json ./apps/desktop/
COPY apps/marketing-web/package.json ./apps/marketing-web/
COPY apps/web/package.json ./apps/web/
COPY apps/weighbridge-agent/package.json ./apps/weighbridge-agent/
COPY packages/admin-database/package.json ./packages/admin-database/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/email/package.json ./packages/email/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/pdf/package.json ./packages/pdf/
COPY packages/types/package.json ./packages/types/
RUN npm ci --ignore-scripts --no-audit --no-fund

FROM dependencies AS source
# .dockerignore excludes credentials, databases, generated copies and local dependencies.
COPY . .

FROM source AS tenant-build
RUN npm run build -w apps/api
RUN npm prune --omit=dev --ignore-scripts --no-audit --no-fund && npm run generate -w @evergreen/database

FROM source AS provider-build
RUN npm run build -w apps/admin-api
RUN npm prune --omit=dev --ignore-scripts --no-audit --no-fund && npm run generate -w @evergreen/database && npm run generate -w @evergreen/admin-database

FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS api-runtime
WORKDIR /app
ENV NODE_ENV=production EVERGREEN_API_HOST=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates gosu && rm -rf /var/lib/apt/lists/*
COPY package.json ./
COPY scripts/release/database.cjs ./scripts/release/database.cjs
COPY --chmod=755 deploy/docker/api-entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

FROM api-runtime AS tenant-api
COPY --from=tenant-build /app/node_modules ./node_modules
COPY --from=tenant-build /app/packages ./packages
COPY --from=tenant-build /app/apps/api/dist ./apps/api/dist
ENV EVERGREEN_PLANE=tenant EVERGREEN_API_PORT=4301
EXPOSE 4301
HEALTHCHECK --interval=5s --timeout=3s --start-period=90s --retries=12 CMD node -e "fetch('http://127.0.0.1:4301/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/api/dist/main.js"]

FROM api-runtime AS admin-api
COPY --from=provider-build /app/node_modules ./node_modules
COPY --from=provider-build /app/packages ./packages
COPY --from=provider-build /app/apps/admin-api/dist ./apps/admin-api/dist
ENV EVERGREEN_PLANE=provider ADMIN_API_PORT=4300
EXPOSE 4300
HEALTHCHECK --interval=5s --timeout=3s --start-period=90s --retries=12 CMD node -e "fetch('http://127.0.0.1:4300/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/admin-api/dist/main.js"]

FROM source AS tenant-web-build
RUN npm run build -w @evergreen/types && npm run build -w apps/web
FROM source AS admin-web-build
RUN npm run build -w apps/admin-web
FROM source AS marketing-build
RUN npm run build -w apps/marketing-web

FROM nginx:stable-alpine@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5 AS tenant-web
COPY deploy/docker/nginx-tenant.conf /etc/nginx/conf.d/default.conf
COPY --from=tenant-web-build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -q -O /dev/null http://127.0.0.1:4000/health || exit 1

FROM nginx:stable-alpine@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5 AS admin-web
COPY deploy/docker/nginx-admin.conf /etc/nginx/conf.d/default.conf
COPY --from=admin-web-build /app/apps/admin-web/dist /usr/share/nginx/html
EXPOSE 5174
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -q -O /dev/null http://127.0.0.1:5174/admin-api/health || exit 1

FROM nginx:stable-alpine@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5 AS marketing-web
COPY deploy/docker/nginx-marketing.conf /etc/nginx/conf.d/default.conf
COPY --from=marketing-build /app/apps/marketing-web/dist /usr/share/nginx/html
EXPOSE 3300
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -q -O /dev/null http://127.0.0.1:3300/ || exit 1
