# ==========================================
# CertiWatch Enterprise Production Dockerfile
# Multi-Stage, Hardened, Non-Root Container
# ==========================================

# Stage 1: Dependencies Cache
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* bun.lock* ./
RUN npm ci || npm install

# Stage 2: Production Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Security: run as unprivileged non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 certiwatch

# Copy built distribution, server, and dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts

USER certiwatch

EXPOSE 3000

# Healthcheck probe for Cloud Run & Kubernetes Kubelet
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/neon/health || exit 1

CMD ["node", "--loader", "tsx", "server.ts"]
