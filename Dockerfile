# ========================================
# Stage 1: Builder - Install dependencies and build
# ========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema first (needed for generate)
COPY prisma ./prisma/

# Generate Prisma client using the installed (pinned) version
RUN pnpm exec prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# ========================================
# Stage 2: Production - Run the app
# ========================================
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm and openssl
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies (ignore scripts to prevent postinstall)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Install Prisma CLI explicitly for migrations and generation (matching version)
RUN pnpm add -D prisma@5.22.0

# Copy Prisma schema from builder
COPY --from=builder /app/prisma ./prisma/

# Copy built application
COPY --from=builder /app/dist ./dist

# Generate Prisma client in production image (now that Prisma CLI is available)
RUN pnpm exec prisma generate

# Expose the port
EXPOSE 4201

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4201/health || exit 1

# Start the application (run migrations first)
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/src/main.js"]
