# Dağıtım

Portfolyo, Pierre ile aynı sunucuda (Google Cloud Compute Engine) çalışır.
80/443'ü sunucudaki **mevcut nginx** tutar; iki proje `edge` adlı ortak Docker
ağında buluşur.

```
VPS
┌──────────────────────────────────────────────────────┐
│ nginx  :80 / :443   ◀── tek edge                     │
│  ├─ pierre.burakgemici.com.tr → pierre-web           │
│  └─ www.burakgemici.com.tr                           │
│       ├─ /       → portfolio-web :3000               │
│       └─ /api/   → portfolio-api :4000               │
│                                                      │
│ portfolio-web · portfolio-api · portfolio-postgres   │
└──────────────────────────────────────────────────────┘
```

Tek origin olduğu için **CORS sorunu yoktur**: tarayıcı isteği `/api/...`
yoluna, sitenin kendi alan adına gider.

---

## 1. Ortak ağı oluştur ve nginx'i bağla

```bash
docker network create edge
```

Pierre'in `docker-compose.prod.yml` dosyasında **nginx** servisine ve dosyanın
sonuna ekle:

```yaml
services:
  nginx:
    # … mevcut ayarlar …
    networks:
      - default     # ⚠️ BUNU MUTLAKA YAZ
      - edge

networks:
  edge:
    external: true
    name: edge
```

> ⚠️ **`default`'u yazmayı unutma.** Bir servise `networks:` eklediğin anda
> Docker onu varsayılan ağa otomatik bağlamayı bırakır. Yalnızca `edge`
> yazarsan nginx `pierre-web` / `pierre-api`'ye ulaşamaz ve **Pierre düşer**.

Uygula ve Pierre'in hâlâ çalıştığını doğrula:

```bash
cd ~/pierre
docker compose -f docker-compose.prod.yml up -d nginx
curl -sI https://pierre.burakgemici.com.tr | head -1   # HTTP/2 200 bekleniyor
```

---

## 2. DNS'i VPS'e çevir

DNS sağlayıcında:

| Kayıt | Değer |
|-------|-------|
| `www` | **A → 34.107.6.189** |
| `@` (apex) | **A → 34.107.6.189** |

Varsa Vercel'e ait `CNAME` / `A` kayıtlarını sil.

```bash
watch -n5 'dig +short www.burakgemici.com.tr'
```

> Sertifikayı HTTP-01 ile alacağımız için DNS'in **önce** yayılması gerekir.
> (Kesintisiz geçiş varyantı için en alttaki nota bak.)

---

## 3. Portfolyo yığınını başlat

```bash
git clone https://github.com/gemiciburak/portfolio-site.git ~/portfolio
cd ~/portfolio

cp .env.example .env
cp backend/.env.example backend/.env
```

`.env`:

```bash
POSTGRES_USER=portfolio
POSTGRES_PASSWORD=<güçlü bir parola>
POSTGRES_DB=portfolio
PUBLIC_ORIGIN=https://www.burakgemici.com.tr
SWAGGER_ENABLED=0
```

`backend/.env` — JWT sırlarını üret (her biri ≥32 karakter ve **farklı**):

```bash
sed -i "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$(openssl rand -hex 32)|"  backend/.env
sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(openssl rand -hex 32)|" backend/.env
```

Aynı dosyada admin hesabını ayarla (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — seed
hesabı yalnızca **yoksa** oluşturur, mevcut parolayı asla ezmez.

Başlat:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Seed'i çalıştır — bu adım zorunlu.** Profil satırı olmadan ana sayfa
render edilemez ve `/` ucu 500 döner:

```bash
docker compose -f docker-compose.prod.yml run --rm -w /app migrate \
  npx tsx src/core/database/seed.ts
```

Konteyner ağı üzerinden doğrula:

```bash
docker run --rm --network edge curlimages/curl -s http://portfolio-api:4000/api/health
docker run --rm --network edge curlimages/curl -s -o /dev/null -w "%{http_code}\n" http://portfolio-web:3000/
```

İkisi de sırasıyla `"status":"ok"` ve `200` vermeli.

---

## 4. Sertifikayı al

Nginx, sertifika dosyası yokken SSL bloğu içeren konfigürasyonu kabul etmez;
sertifika almak içinse nginx'in ACME doğrulamasını servis etmesi gerekir. Bu
yüzden önce **geçici** HTTP-only blok kurulur.

```bash
scp ~/portfolio/nginx/portfolio-bootstrap.conf \
    sunucu:~/pierre/nginx/conf.d/portfolio.conf

cd ~/pierre
docker compose -f docker-compose.prod.yml exec nginx nginx -t
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

> `nginx -t` başarısızsa **reload etme.** Çalışan nginx eski konfigürasyonla
> ayakta kalır ve Pierre etkilenmez.

Sertifikayı webroot (HTTP-01) ile al — bu yöntem **kendiliğinden yenilenir**:

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
  -d www.burakgemici.com.tr -d burakgemici.com.tr \
  --email <e-postan> --agree-tos --no-eff-email
```

---

## 5. Asıl konfigürasyonu koy

```bash
scp ~/portfolio/nginx/portfolio.conf sunucu:~/pierre/nginx/conf.d/portfolio.conf

cd ~/pierre
docker compose -f docker-compose.prod.yml exec nginx nginx -t
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 6. Doğrula

```bash
curl -sI https://www.burakgemici.com.tr | head -1
curl -s  https://www.burakgemici.com.tr/api/health
curl -s  https://www.burakgemici.com.tr | grep -o "<title>[^<]*</title>"
curl -sI https://burakgemici.com.tr | grep -i location      # www'ye yönlenmeli
curl -sI https://pierre.burakgemici.com.tr | head -1        # Pierre bozulmamış mı
```

Otomatik yenilemenin çalışacağını kuru çalıştırmayla doğrula:

```bash
cd ~/pierre
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  renew --dry-run
```

---

## 7. Kontrol listesi

- [ ] `https://www.burakgemici.com.tr` açılıyor, içerik görünüyor
- [ ] `https://burakgemici.com.tr` → `www`'ye yönleniyor
- [ ] `https://www.burakgemici.com.tr/api/health` → `"status":"ok"`
- [ ] İletişim formu gönderiliyor
- [ ] `/admin` girişi çalışıyor
- [ ] `/api/projects/all` token'sız → 401
- [ ] `/docs` → 404 (Swagger kapalı)
- [ ] `https://pierre.burakgemici.com.tr` hâlâ çalışıyor
- [ ] `certbot renew --dry-run` başarılı
- [ ] Seed'deki varsayılan admin parolası değiştirildi

---

## Notlar

### Kesintisiz geçiş (çalışan bir site taşınıyorsa)

Yukarıdaki akış DNS'i önce çevirir; sertifika alınana dek kısa bir kesinti olur.
Yayında **çalışan** bir siteyi taşıyorsan sırayı değiştir: sertifikayı DNS-01
challenge ile, alan adı hâlâ eski yerini gösterirken al —

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  certonly --manual --preferred-challenges dns \
  -d www.burakgemici.com.tr -d burakgemici.com.tr \
  --email <e-postan> --agree-tos --no-eff-email
```

Certbot `_acme-challenge.…` TXT kaydı isteyecek. Sertifika hazır olunca 5. adımı
uygula, `curl --resolve www.burakgemici.com.tr:443:34.107.6.189 https://…` ile
her şeyi DNS'e dokunmadan doğrula, sonra A kaydını çevir.

> ⚠️ `--manual` DNS-01 ile alınan sertifika **otomatik yenilenemez.** Geçişten
> sonra 4. adımdaki webroot komutunu `--force-renewal` ile bir kez çalıştırıp
> yenileme yöntemini webroot'a çevir.

### Güncelleme

```bash
cd ~/portfolio && git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Şema değiştiyse `migrate` servisi açılışta otomatik uygular. Seed'i tekrar
çalıştırmak gerekmez (idempotent, ama içeriği seed-data.ts'e geri döndürür —
admin panelinden yaptığın değişiklikler ezilir).

### İçerik güncelleme

Kod dağıtımı gerekmez — `/admin` panelinden projeler, profil metinleri ve
iletişim mesajları yönetilir. Değişiklik en geç 60 saniyede yayına yansır
(frontend'in veri cache süresi).

### Yedekleme

```bash
cd ~/portfolio
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U portfolio portfolio | gzip > ~/portfolio-$(date +%F).sql.gz
```

Geri yükleme:

```bash
gunzip -c ~/portfolio-2026-07-24.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U portfolio -d portfolio
```
