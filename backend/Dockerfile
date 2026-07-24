# ── deps ────────────────────────────────────────────────────────────────────
# Bağımlılıklar ayrı katmanda: kaynak kod değiştiğinde npm ci yeniden çalışmaz.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# ── migrate ─────────────────────────────────────────────────────────────────
# Tek seferlik iş: şemayı uygular ve çıkar. tsx ve drizzle klasörü gerekir,
# bu yüzden dev bağımlılıklarıyla ayrı bir hedef.
FROM node:24-alpine AS migrate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY drizzle ./drizzle
COPY src ./src
COPY tsconfig.json ./
CMD ["npx", "tsx", "src/core/database/migrate.ts"]

# ── runner ──────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# root olarak çalıştırma: konteyner kaçışının etkisini sınırlar.
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --chown=nestjs:nodejs package.json ./

USER nestjs
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
