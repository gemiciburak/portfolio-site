/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone yalnızca Docker imajı için gerekli (küçük çıktı, kendi server.js'i).
  // Vercel kendi build çıktısını ürettiği için orada devre dışı bırakılır.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
  poweredByHeader: false,
  images: {
    // Proje görselleri admin panelinden girilir; harici bir CDN'de olabilir.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
