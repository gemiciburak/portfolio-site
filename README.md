# Burak Gemici — Portfolio

Kişisel portfolyo sitesi — https://burakgemici.com.tr. Statik olarak üretilen
bir Next.js uygulaması; GitHub Pages üzerinde yayınlanır.

| Katman   | Teknolojiler |
|----------|--------------|
| Uygulama | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion |
| Yayın    | GitHub Pages · GitHub Actions (lint · typecheck · build · deploy) |

## Hızlı başlangıç

Gereksinim: Node 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

## İçeriği güncelleme

Profil, yetenekler, deneyim ve projelerin tamamı tek dosyada:
**[content/site.ts](./content/site.ts)**. Dosyayı düzenleyip `main`'e push
etmek yeterli — GitHub Actions siteyi yeniden üretip yayınlar. Tipler `types/content.ts`
içinde; yanlış alan adı ya da eksik alan build'i düşürür.

Proje detay sayfaları (`/projects/<slug>`) aynı listeden build anında üretilir.
Listede olmayan slug 404 döner.

İletişim formu [Web3Forms](https://web3forms.com) üzerinden gönderilir; mesajlar
burakgemici.dev@gmail.com adresine düşer. Erişim anahtarı
`sections/ContactSection.tsx` içinde ve herkese açık olacak şekilde tasarlanmış.
Gizli `botcheck` alanı basit botları eler.

## Script'ler

| Script | Amaç |
|--------|------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Statik çıktıyı `out/` klasörüne üretir |
| `npm run preview` | `out/` klasörünü yerelde servis eder (build sonrası) |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |

## SEO ve GEO

Hepsi `content/site.ts`'ten üretilir, ayrıca bakım gerektirmez:

- Sayfa başına title, description, canonical, Open Graph ve Twitter kartı
  (`app/layout.tsx`, `app/projects/[slug]/page.tsx`). Paylaşım görseli
  `public/og-image.jpg`.
- `/sitemap.xml`, `/robots.txt` (AI tarayıcıları dahil herkese açık).
- JSON-LD: ana sayfada `Person` + `WebSite` + `ProfilePage`, proje
  sayfalarında `SoftwareSourceCode` + `BreadcrumbList` (`lib/structured-data.ts`).
- `/llms.txt`: LLM tabanlı arama için sitenin düz metin özeti.

## Yayın (GitHub Pages)

`main`'e her push'ta `.github/workflows/ci.yml` lint, typecheck ve build
çalıştırır; geçerse `out/` klasörünü GitHub Pages'e yayınlar. PR'larda yalnızca
kontroller çalışır.

İlk kurulum (bir kez):

1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. Aynı sayfada **Custom domain**: `burakgemici.com.tr`.
3. Alan adı sağlayıcısında DNS:

   | Ad | Tür | Değer |
   |----|-----|-------|
   | `@` | A | `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153` |
   | `@` | AAAA | `2606:50c0:8000::153` · `2606:50c0:8001::153` · `2606:50c0:8002::153` · `2606:50c0:8003::153` |
   | `www` | CNAME | `gemiciburak.github.io` |

4. Sertifika hazır olunca **Enforce HTTPS**'i işaretleyin. `www` adresi kök
   alan adına otomatik yönlenir.
