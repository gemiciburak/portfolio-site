/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages yalnızca statik dosya servis eder: build çıktısı out/ klasörüdür.
  output: "export",
  images: {
    // Statik export'ta Next'in görsel optimizasyon sunucusu yok.
    unoptimized: true,
  },
};

module.exports = nextConfig;
