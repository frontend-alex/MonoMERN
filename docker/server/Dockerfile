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
COPY app/server/package.json app/server/

# Install ALL dependencies (including devDeps for building)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY app/server/ app/server/

# Clean any stale build artifacts copied from host
RUN rm -rf packages/shared/build packages/shared/tsconfig.tsbuildinfo \
           app/server/build app/server/tsconfig.tsbuildinfo

# Build shared + server via project references
RUN cd app/server && pnpm exec tsc -b

# Copy email templates to build output
RUN if [ -d "app/server/src/infrastructure/email/templates" ]; then \
      cp -r app/server/src/infrastructure/email/templates app/server/build/infrastructure/email/templates; \
    fi

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:20-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# Skip husky
ENV HUSKY=0

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Copy package.json files
COPY packages/shared/package.json packages/shared/
COPY app/server/package.json app/server/

# Install production dependencies only (--ignore-scripts skips husky prepare)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts from build stage
COPY --from=build /app/packages/shared/build packages/shared/build
COPY --from=build /app/app/server/build app/server/build

# Create logs directory
RUN mkdir -p app/server/logs

# Set working directory to server
WORKDIR /app/app/server

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the server
CMD ["node", "build/index.js"]
