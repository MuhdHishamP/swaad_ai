# ============================================================
# Multi-stage Dockerfile for Swaad AI
# ============================================================
# Stage 1: Install dependencies
# Stage 2: Build production bundle (uses standalone output)
# Stage 3: Minimal runtime (~150MB vs ~800MB)
#
# Usage:
#   docker build -t swaad-ai .
#   docker run -p 3000:3000 --env-file .env.local swaad-ai
# ============================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production + build deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args → env vars for build-time access
ARG GOOGLE_API_KEY
ENV GOOGLE_API_KEY=$GOOGLE_API_KEY

# Next.js standalone output (configured in next.config.ts)
RUN npm run build

# ---- Stage 3: Production Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets (food images, etc.)
COPY --from=builder /app/public ./public

# Copy data files
COPY --from=builder /app/src/data ./src/data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
