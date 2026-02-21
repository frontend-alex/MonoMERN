# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# Skip husky prepare hook (not needed in Docker)
ENV HUSKY=0

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy package.json files for dependency resolution
COPY packages/shared/package.json packages/shared/
COPY app/client/package.json app/client/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY app/client/ app/client/

# Clean stale build artifacts from host
RUN rm -rf packages/shared/build packages/shared/tsconfig.tsbuildinfo \
           app/client/dist

# Set API URL for production (nginx proxies /api/ to the server container)
ENV VITE_API_URL=/api/v1/

# Build shared package first, then client with Vite
RUN pnpm --filter shared run build
RUN pnpm --filter client run build

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from build stage
COPY --from=build /app/app/client/dist /usr/share/nginx/html

# Create directories for SSL certificates
RUN mkdir -p /etc/letsencrypt /var/www/certbot

# Expose HTTP and HTTPS ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
