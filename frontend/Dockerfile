# ── deps ────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* build anında paketlenir; tarayıcıya gidecek adres burada gömülür.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Sunucu tarafı (SSG/ISR) çağrıları konteyner ağı üzerinden gider.
ARG API_URL
ENV API_URL=$API_URL

ENV NEXT_TELEMETRY_DISABLED=1
# next.config.js standalone çıktısını bu bayrağa göre açar.
ENV DOCKER_BUILD=1
RUN npm run build

# ── runner ──────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# root olarak çalıştırma: konteyner kaçışının etkisini sınırlar.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# standalone çıktı: yalnızca çalışması için gereken node_modules'ü içerir.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
