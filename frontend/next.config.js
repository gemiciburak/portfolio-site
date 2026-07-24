/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker imajı için: yalnızca gereken node_modules'ü içeren küçük çıktı.
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Proje görselleri admin panelinden girilir; harici bir CDN'de olabilir.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
