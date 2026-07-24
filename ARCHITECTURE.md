# Mimari

Bu doküman **ne** inşa edildiğini ve **neden** bu şekilde tasarlandığını
açıklar.

---

## 1. Genel görünüm

```
┌──────────────────────┐      HTTPS (REST, envelope)      ┌────────────────────────┐
│  Next.js frontend    │ ───────────────────────────────▶ │  NestJS API            │
│  App Router · SSG/ISR│ ◀─────────────────────────────── │  modules/ common/ core/│
└──────────────────────┘                                  └───────────┬────────────┘
                                                                      │
                                                                      ▼
                                                              PostgreSQL 17
                                                              (Drizzle ORM)
```

Nginx tek giriş noktasıdır: `/` Next.js'e, `/api/` NestJS'e gider. Tek alan adı
kullanıldığı için tarayıcı tarafında CORS ön kontrolü (preflight) oluşmaz.

### Backend katmanlaması

Her özellik modülü aynı bağımlılık yönünü izler:

```
Controller  →  Service  →  Repository  →  Drizzle (DRIZZLE token)
   DTO'lar       iş           sadece SQL
 (zod/swagger)  mantığı
```

- **Controller'lar** yalnızca HTTP'yi bilir: routing, DTO'lar, Swagger metadata'sı.
- **Service'ler** iş kurallarının sahibidir. Asla SQL kurmazlar.
- **Repository'ler** kalıcılığın sahibidir. Asla HTTP exception fırlatmazlar.
- **Kesişen kaygılar** `common/` (envelope interceptor, exception filter,
  guard'lar) ve `core/` (database) altındadır.

**Neden:** service'ler veritabanı olmadan test edilebilir; Drizzle dili tek
katmana hapsedilmiştir. `DRIZZLE` bir token olduğu için testte değiştirilebilir.

---

## 2. Kesişen kararlar

### Yanıt zarfı
`TransformInterceptor` her başarılı yanıtı `{ success, message, data, meta? }`
içine sarar; `AllExceptionsFilter` aynı yapıyı `success: false` ile üretir.
`PaginatedResult`, interceptor'ın `data` + `meta` olarak açtığı bir işaretleyici
sınıftır. **Neden:** tek sözleşme, tek yerde zorlanır — hiçbir uç sapamaz.

### Validasyon (Zod + nestjs-zod)
Her DTO bir `createZodDto(schema)`'dır. Global `ZodValidationPipe` tüm
body/query/param'ları doğrular; `cleanupOpenApiDoc` aynı şemaları Swagger'a
besler. **Neden:** doğrulama kuralı ile API dokümantasyonu aynı nesnedir —
birbirinden ayrışamazlar.

### DTO girer / DTO çıkar
DB satırları modül dışına çıkmaz; her service'in açık `toDto()` mapper'ı vardır.
**Neden:** `passwordHash` veya `ipHash` gibi bir alanın sızması yapısal olarak
imkânsız hâle gelir — yeni bir kolon eklemek onu otomatik olarak API'ye taşımaz.

### Konfigürasyon
Tüm ortam değişkenleri tek bir Zod şemasında (`config/env.ts`) tanımlıdır;
geçersiz konfigürasyonda uygulama **açılmayı reddeder**. `AppConfigService`
tipli getter'lar sunar. **Neden:** adı değişen bir değişken production kazası
değil, başlangıç hatası olur.

---

## 3. Güvenlik modeli

### Varsayılan olarak kapalı
`JwtAuthGuard` **globaldir**; herkese açık uçlar `@Public()` ile açıkça istisna
edilir. `RolesGuard` de globaldir; admin uçları `@Roles('ADMIN')` ile korunur.
Guard sırası: **throttle → kimlik doğrulama → yetkilendirme**.

**Neden:** yeni bir uç eklerken *korumayı unutmak* mümkün değildir; unutulursa
uç kapalı kalır, açık değil.

### Parola ve token'lar
- **Argon2id** hash'leme (OWASP'ın güncel ilk tercihi, GPU'ya dirençli).
- **İki token türü, iki ayrı secret.** Access (15 dk) / refresh (7 gün); her
  birinin `type` claim'i vardır — bir refresh token asla access token yerine
  geçemez.
- **Rotasyonlu refresh token + yeniden kullanım tespiti.** Veritabanında yalnızca
  SHA-256 hash saklanır. Refresh'te eski token tüketilir; imzası geçerli ama
  kaydı olmayan bir token daha önce döndürülmüş demektir — hırsızlık sinyali —
  ve **kullanıcının tüm oturumları iptal edilir**.
- **Logout blacklist'i.** Access token'ın `jti`'si doğal süresi dolana kadar
  saklanır; JWT stateless olsa da logout anında etkilidir.
- **Parola değişimi tüm oturumları düşürür.**
- Bilinmeyen e-postada da gerçek bir Argon2 doğrulaması yapılır: cevap süresi
  "bu e-posta kayıtlı mı?" sorusuna ipucu vermez.

### Rate limiting
Global sınır `@nestjs/throttler` ile (varsayılan 60 sn / 120 istek).
Uç bazlı sıkı limitler: giriş 5/dk, refresh 20/dk, iletişim formu 5/saat.
Nginx tarafında iletişim formu için ikinci bir kapı vardır (10r/m).

`TRUST_PROXY=1` olmadan ters proxy arkasındaki tüm trafik tek IP görünür ve
limit anlamsızlaşır — bu yüzden production compose dosyasında açıktır.

### İletişim formu
- Sunucu tarafı doğrulama (isim ≥ 2, geçerli e-posta, mesaj ≥ 10 karakter).
- **Honeypot** alanı: şema kasıtlı olarak gevşektir. Doluluğu 400 ile
  reddetseydik bot alanı boş bırakmayı öğrenirdi; bunun yerine istek başarılı
  görünür ama kayıt açılmaz.
- IP **düz saklanmaz**: HMAC-SHA256 ile hash'lenir. Kötüye kullanım incelemesi
  için yeterli, kişisel veriyi düz tutmamak için gerekli.

### Diğer
`helmet` başlıkları, env'den beslenen katı CORS allow-list'i, genel hata
mesajları (stack sızmaz), Nginx'te HSTS + `nosniff`, konteynerlerde root
olmayan kullanıcı, production'da Swagger'ın kapatılabilmesi.

---

## 4. Veri modeli

| Tablo | Not |
|-------|-----|
| `users` | Admin hesapları (Argon2id hash) |
| `refresh_tokens` | Rotasyon kayıtları; yalnızca SHA-256 hash |
| `revoked_access_tokens` | Logout blacklist'i, TTL'li |
| `profile` | **Tek satır** (id = 1) — "hangi profil?" sorusu şema düzeyinde yok |
| `skill_categories` → `skills` | 1-N; arayüzdeki 4 sütunluk ızgarayı besler |
| `projects` | `slug` tekil (detay sayfası URL'i); `techStack`/`highlights` jsonb |
| `experiences` | İş ve eğitim tek tabloda, `kind` enum'ıyla ayrışır |
| `messages` | İletişim formu; `ipHash` ve `userAgent` DTO'ya çıkmaz |

**Tarihler `YYYY` veya `YYYY-MM`.** CV'de gün hassasiyeti yok, bazı kayıtlarda ay
da yok. Şema ikisine de izin verir — olmayan bir tarihi uydurmak yerine.

**Yetenek listeleri tümüyle değiştirilir, birleştirilmez.** Kısmi güncelleme
sıralamayı belirsizleştirirdi; kategori ve yetenekleri tek transaction'da yazılır.

---

## 5. Frontend veri akışı

Ana sayfa bir **sunucu bileşenidir**: `GET /api/site` ile tüm içeriği tek çağrıda
alır ve bölümlere prop olarak geçirir. Bölümler istemci bileşeni olarak kalır —
Framer Motion animasyonları ve mevcut tasarım olduğu gibi çalışır.

- **ISR (60 sn):** sayfalar statik üretilir, süre dolunca arka planda tazelenir.
  Ziyaretçi hiçbir zaman API'yi beklemez. İçerik güncellendiğinde en geç bir
  dakika içinde yayına yansır.
- **Proje detayları** build sırasında `generateStaticParams` ile üretilir; API
  build anında erişilemezse sayfalar istek anında üretilir (build düşmez).
- **İletişim formu ve admin paneli** tarayıcıdan doğrudan API'ye konuşur.

### Admin paneli
Token'lar `sessionStorage`'da tutulur; sekme kapanınca oturum biter. 401 alan
istek bir kez refresh dener ve tekrarlanır.

**İyileştirme:** XSS'e karşı en sağlam seçenek httpOnly cookie'dir. Panel tek
kullanıcılı ve access token'ın ömrü 15 dakika olduğu için burada Bearer token
tercih edildi; cookie'ye geçiş auth modülünde izole bir değişikliktir.

---

## 6. İleride yapılabilecekler

- **Görsel yükleme:** `imageUrl` şu an bir metin alanı. Object storage'a yükleme
  ucu eklenebilir.
- **httpOnly cookie** ile token taşıma (yukarıda).
- **Redis cache:** herkese açık uçlar için read-through cache ve dağıtık rate
  limit. Tek instance'ta gerekli değil; yatay ölçeklemede olur.
- **E-posta bildirimi:** yeni mesaj geldiğinde. Şu an mesajlar yalnızca panelde
  görülür.
- **Testler:** service katmanı repository mock'larıyla birim testine hazır;
  henüz test yazılmadı.
