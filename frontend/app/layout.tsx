import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSiteContent } from "@/lib/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

/** SEO metinleri de veritabanından gelir; içerik değişince kod değişmez. */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { profile } = await getSiteContent();

    return {
      title: profile.metaTitle ?? `${profile.fullName} | ${profile.headline}`,
      description: profile.metaDescription ?? profile.heroDescription,
    };
  } catch {
    // API'ye ulaşılamazsa build/render metadata yüzünden düşmemeli.
    return { title: "Burak Gemici | Full-Stack Developer" };
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-[var(--background)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
