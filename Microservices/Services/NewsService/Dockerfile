# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app
# libc for native deps + CA certs for TLS (Supabase etc.)
RUN apk add --no-cache libc6-compat ca-certificates && update-ca-certificates

# ---------- deps (full deps for build) ----------
FROM base AS deps
COPY Services/NewsService/package*.json ./
RUN npm ci

# ---------- build (compile Nest + generate prisma client) ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY Services/NewsService/ ./
# Generate Prisma client for build-time TypeScript compilation
RUN npx prisma generate
# Build NestJS -> dist/
RUN npm run build

# ---------- runtime (prod) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEWS_SERVICE_PORT=3000

# Ensure TLS works to hosted DBs
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Copy built app and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY Services/NewsService/package*.json ./

# Install production deps only (this also runs @prisma/client postinstall)
RUN npm ci --omit=dev && npm cache clean --force

# Install Prisma CLI only for running migrations at startup
RUN npm i -g prisma

# Run as non-root (optional but recommended)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3000

# Runtime: apply migrations, then start the app
# Requires DATABASE_URL env at runtime (with sslmode=require and % encoded)
CMD ["sh", "-c", "prisma migrate deploy && node dist/src/main.js"]