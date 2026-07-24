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

> **Sıralama önemli.** Aşağıdaki akış, alan adı hâlâ Vercel'i gösterirken her
> şeyi kurup doğrular; DNS en son çevrilir. Doğru uygulanırsa **kesinti olmaz**.

---

## 0. Hazırlık — TTL'i düşür

Geçişten en az birkaç saat önce, DNS sağlayıcında `burakgemici.com.tr` ve
`www` kayıtlarının **TTL**'ini `300` saniyeye indir. Geri dönmen gerekirse
hızlı olur.

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

## 2. Portfolyo yığınını başlat

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

Başlangıç içeriğini bir kez yükle:

```bash
docker compose -f docker-compose.prod.yml run --rm -w /app migrate \
  npx tsx src/core/database/seed.ts
```

Konteyner ağı üzerinden doğrula:

```bash
docker compose -f docker-compose.prod.yml exec api \
  node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>r.json()).then(d=>console.log(d.data))"
```

---

## 3. Sertifikayı DNS-01 ile al (alan adı hâlâ Vercel'deyken)

HTTP-01 challenge alan adının sunucuyu göstermesini şart koşar — bu yüzden
**DNS-01** kullanıyoruz. Böylece sertifika, trafik hâlâ Vercel'e giderken hazır olur.

```bash
cd ~/pierre

docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  certonly --manual --preferred-challenges dns \
  -d www.burakgemici.com.tr -d burakgemici.com.tr \
  --email <e-postan> --agree-tos --no-eff-email
```

Certbot duracak ve DNS'e **TXT kaydı** eklemeni isteyecek:

```
_acme-challenge.www.burakgemici.com.tr   TXT   "…"
_acme-challenge.burakgemici.com.tr       TXT   "…"
```

Kaydı ekle, yayıldığını **başka bir terminalde** doğrula, sonra Enter'a bas:

```bash
dig +short TXT _acme-challenge.www.burakgemici.com.tr
```

> İki alan adı için ayrı ayrı TXT istenir; certbot ilkini sorup Enter'ı
> bekledikten sonra ikincisini ister. Acele edip erken Enter'lama.

---

## 4. Nginx server bloğunu ekle

```bash
scp ~/portfolio/nginx/portfolio.conf sunucu:~/pierre/nginx/conf.d/portfolio.conf
```

Önce **söz dizimini denetle**, ancak sonra yeniden yükle:

```bash
cd ~/pierre
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

> `nginx -t` başarısızsa **reload etme**. Çalışan nginx eski konfigürasyonla
> ayakta kalır ve Pierre etkilenmez. Hatayı düzeltip tekrar dene.

Test geçtiyse:

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 5. DNS'i çevirmeden ÖNCE doğrula

`--resolve` ile isteği zorla VPS'e yönlendir — gerçek alan adı, gerçek
sertifika, gerçek yığın; ama DNS hâlâ Vercel'i gösteriyor:

```bash
IP=34.107.6.189

# Sertifika doğru mu (zincir + alan adı)
curl -sI --resolve www.burakgemici.com.tr:443:$IP \
  https://www.burakgemici.com.tr | head -1

# API ayakta mı
curl -s --resolve www.burakgemici.com.tr:443:$IP \
  https://www.burakgemici.com.tr/api/health

# Sayfa içerik ile geliyor mu (SSR API'ye ulaşıyor mu)
curl -s --resolve www.burakgemici.com.tr:443:$IP \
  https://www.burakgemici.com.tr | grep -o "<title>[^<]*</title>"

# Pierre bozulmamış mı
curl -sI https://pierre.burakgemici.com.tr | head -1
```

Dördü de beklendiği gibiyse geçişe hazırsın. Değilse **DNS'e dokunma** —
kullanıcılar hâlâ Vercel'deki çalışan siteyi görüyor.

---

## 6. DNS'i çevir

DNS sağlayıcında:

| Kayıt | Eski | Yeni |
|-------|------|------|
| `www` | Vercel (CNAME/A) | **A → 34.107.6.189** |
| `@` (apex) | Vercel (76.76.21.21) | **A → 34.107.6.189** |

Varsa Vercel'in `CNAME` kaydını sil. Yayılmayı izle:

```bash
watch -n5 'dig +short www.burakgemici.com.tr'
```

---

## 7. Sertifika yenilemesini otomatiğe çevir ⚠️

**Bu adımı atlama.** 3. adımdaki `--manual` DNS-01 ile alınan sertifika
**kendiliğinden yenilenemez** — 90 gün sonra site sertifika hatası verir.

DNS yayıldıktan sonra, aynı sertifikayı webroot ile yeniden al; certbot
yenileme yöntemini kalıcı olarak webroot'a çevirir:

```bash
cd ~/pierre
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot --force-renewal \
  -d www.burakgemici.com.tr -d burakgemici.com.tr

docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Otomatik yenilemenin çalışacağını kuru çalıştırmayla doğrula:

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  renew --dry-run
```

---

## 8. Vercel projesini kapat

Alan adı artık VPS'i gösteriyor. Vercel'de:

1. Project → Settings → Domains → `burakgemici.com.tr` ve `www`'yi kaldır
2. Projeyi sil ya da Git bağlantısını kes (her push'ta boşuna build almasın)

---

## 9. Kontrol listesi

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
- [ ] Vercel projesi kapatıldı

---

## Geri dönüş (rollback)

Bir şeyler ters giderse: DNS'i Vercel'e geri al (TTL 300 olduğu için birkaç
dakika). Vercel projesini 8. adımda silmediysen site anında geri döner —
**bu yüzden 8. adımı diğerlerinden birkaç gün sonra yap.**

---

## Notlar

### Güncelleme

```bash
cd ~/portfolio && git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Şema değiştiyse `migrate` servisi açılışta otomatik uygular.

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
