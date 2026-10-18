# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# .dockerignore excludes credentials, databases, generated copies and local dependencies.
# All workspace manifests must be present when resolving the root lockfile.
COPY . .
RUN npm ci --ignore-scripts

FROM dependencies AS tenant-build
RUN npm run build -w apps/api
RUN npm prune --omit=dev --ignore-scripts && npm run generate -w @evergreen/database

FROM dependencies AS provider-build
RUN npm run build -w apps/admin-api
RUN npm prune --omit=dev --ignore-scripts && npm run generate -w @evergreen/database && npm run generate -w @evergreen/admin-database

FROM node:22-bookworm-slim AS api-runtime
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

FROM dependencies AS tenant-web-build
RUN npm run build -w @evergreen/types && npm run build -w apps/web
FROM dependencies AS admin-web-build
RUN npm run build -w apps/admin-web
FROM dependencies AS marketing-build
RUN npm run build -w apps/marketing-web

FROM nginx:stable-alpine AS tenant-web
COPY deploy/docker/nginx-tenant.conf /etc/nginx/conf.d/default.conf
COPY --from=tenant-web-build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -q -O /dev/null http://127.0.0.1:4000/health || exit 1

FROM nginx:stable-alpine AS admin-web
COPY deploy/docker/nginx-admin.conf /etc/nginx/conf.d/default.conf
COPY --from=admin-web-build /app/apps/admin-web/dist /usr/share/nginx/html
EXPOSE 5174
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -q -O /dev/null http://127.0.0.1:5174/admin-api/health || exit 1

FROM nginx:stable-alpine AS marketing-web
COPY deploy/docker/nginx-marketing.conf /etc/nginx/conf.d/default.conf
COPY --from=marketing-build /app/apps/marketing-web/dist /usr/share/nginx/html
EXPOSE 3300
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD wget -q -O /dev/null http://127.0.0.1:3300/ || exit 1
