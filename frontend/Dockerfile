# frontend/Dockerfile
FROM node:18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile --prod=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy pnpm store from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy source code
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set the correct permission for prerender cache
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Server.js is created by next build from the standalone output
CMD ["node", "server.js"]