# Burak Gemici — Portfolio

Full-stack kişisel portfolyo. Site içeriğinin tamamı (profil, yetenekler, projeler,
deneyim) PostgreSQL'de tutulur ve NestJS REST API üzerinden sunulur — içerik
güncellemek için kod değiştirmek gerekmez.

| Katman   | Teknolojiler |
|----------|--------------|
| Backend  | NestJS 11 · TypeScript · PostgreSQL 17 · Drizzle ORM · JWT (Argon2id) · Zod (nestjs-zod) · Swagger |
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion |
| Altyapı  | Docker · Docker Compose · Nginx · Let's Encrypt · GitHub Actions |

Mimari kararlar ve gerekçeleri için [ARCHITECTURE.md](./ARCHITECTURE.md).

## Hızlı başlangıç

Gereksinimler: Node 20+ ve PostgreSQL 17 (ya da yalnızca Docker).

### Docker ile (önerilen)

```bash
cp .env.example .env
cp backend/.env.example backend/.env

# JWT sırlarını üretin (her biri en az 32 karakter olmalı)
sed -i '' "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$(openssl rand -hex 32)|" backend/.env
sed -i '' "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(openssl rand -hex 32)|" backend/.env

docker compose up -d --build
docker compose exec api node -e "require('child_process')" # (opsiyonel) sağlık kontrolü
```

Migration'lar `migrate` servisi tarafından otomatik uygulanır. Başlangıç
içeriğini yüklemek için seed'i bir kez çalıştırın:

```bash
docker compose run --rm -w /app migrate npx tsx src/core/database/seed.ts
```

- Site → http://localhost:3000
- API → http://localhost:4000/api
- Swagger → http://localhost:4000/docs

### Docker olmadan

```bash
# 1. Veritabanı
psql -d postgres -c "CREATE ROLE portfolio LOGIN PASSWORD 'portfolio'"
psql -d postgres -c "CREATE DATABASE portfolio OWNER portfolio"

# 2. Backend
cd backend
cp .env.example .env          # JWT sırlarını doldurun
npm install
npm run db:migrate
npm run db:seed
npm run start:dev             # http://localhost:4000/api · Swagger: /docs

# 3. Frontend (yeni terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

### Admin paneli

`/admin` adresinde, JWT ile korumalı. İlk hesap seed sırasında
`backend/.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD` değerlerinden oluşur.

> **Production'da mutlaka değiştirin.** Seed mevcut bir hesabın parolasını asla
> ezmez; parolayı `POST /api/auth/change-password` ile veya yeni bir parolayla
> hesabı silip yeniden seed ederek güncelleyin.

## Script'ler

### Backend (`/backend`)

| Script | Amaç |
|--------|------|
| `npm run start:dev` | Watch modunda geliştirme sunucusu |
| `npm run build` / `npm start` | Production build / çalıştırma |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:generate` | Şema değişikliğinden SQL migration üret |
| `npm run db:migrate` | Migration'ları uygula |
| `npm run db:seed` | Idempotent seed (admin + site içeriği) |
| `npm run db:studio` | Drizzle Studio |

### Frontend (`/frontend`)

| Script | Amaç |
|--------|------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Production build / servis |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |

## API'ye genel bakış

Tüm uçlar Swagger'da belgelenmiştir (`/docs`) ve her yanıt aynı zarfı kullanır:

```json
{ "success": true, "message": "OK", "data": {}, "meta": { "page": 1, "limit": 20, "totalItems": 42, "totalPages": 3 } }
```

Hatalar da aynı yapıyı `success: false` ile döner; doğrulama hatalarında alan
bazlı `errors` eklenir.

| Alan | Uçlar |
|------|-------|
| Site (herkese açık) | `GET /api/site` — ana sayfanın tüm içeriği tek çağrıda |
| Profil | `GET /api/profile` · `PATCH /api/profile` 🔒 |
| Yetenekler | `GET /api/skills` · `POST/PATCH/DELETE /api/skills/:id` 🔒 |
| Projeler | `GET /api/projects` · `GET /api/projects/:slug` · `GET /api/projects/all` 🔒 · `POST/PATCH/DELETE` 🔒 |
| Deneyim | `GET /api/experiences?kind=WORK\|EDUCATION` · `POST/PATCH/DELETE` 🔒 |
| İletişim | `POST /api/messages` · `GET /api/messages` 🔒 · `PATCH /api/messages/:id/read` 🔒 · `DELETE` 🔒 |
| Auth | `POST /api/auth/login` · `refresh` · `logout` 🔒 · `change-password` 🔒 · `GET /api/auth/me` 🔒 |
| Sağlık | `GET /api/health` |

🔒 = `ADMIN` rolü ve geçerli access token gerektirir.

## Production dağıtımı

Tek sunucu (Google Cloud Compute Engine), Docker Compose ile. 80/443'ü
sunucudaki mevcut Nginx tutar; projeler `edge` adlı ortak ağda buluşur.

```
VPS
nginx :443 ─┬─ pierre.burakgemici.com.tr → (ayrı proje)
            └─ www.burakgemici.com.tr
                 ├─ /      → portfolio-web  :3000
                 └─ /api/  → portfolio-api  :4000
                                 └─ portfolio-postgres
```

```bash
docker network create edge            # bir kez

cp .env.example .env                  # POSTGRES_PASSWORD, PUBLIC_ORIGIN
cp backend/.env.example backend/.env  # JWT sırları, ADMIN_*
docker compose -f docker-compose.prod.yml up -d --build

# Sonraki güncellemeler
git pull && docker compose -f docker-compose.prod.yml up -d --build
```

Tek origin olduğu için tarayıcı istekleri `/api/...` yoluna gider — CORS
karmaşası yoktur. PostgreSQL hiçbir portu host'a açmaz; `api` ve `web` yalnızca
Nginx'in bulunduğu ağdan erişilebilir. Secret'lar repoda değil, sunucudaki
`.env` dosyalarında durur.

Adım adım kurulum — ortak ağ, kesintisiz DNS geçişi, sertifika ve Nginx
yapılandırması: **[DEPLOY.md](./DEPLOY.md)**

## Doğrulama durumu

- Backend: `tsc` temiz; canlı PostgreSQL üzerinde ayağa kaldırıldı. Doğrulanan
  akışlar: giriş, refresh token rotasyonu ve yeniden kullanım tespiti, RBAC
  (401/403), alan bazlı doğrulama hataları, honeypot'un sessizce eleme davranışı,
  sayfalı mesaj listesi.
- Frontend: production build temiz; proje detay sayfaları canlı API'den statik
  üretiliyor.
