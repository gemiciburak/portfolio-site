import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MotionProvider from "@/components/MotionProvider";
import { OG_IMAGE, SITE_URL } from "@/content/site";
import { getSiteContent } from "@/lib/content";

const inter = Inter({
  // "İstanbul Nişantaşı": İ, ş, ı latin-ext alt kümesinde.
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
});

const site = getSiteContent();
const { profile } = site;

const title = profile.metaTitle ?? `${profile.fullName} | ${profile.headline}`;
const description = profile.metaDescription ?? profile.heroDescription;

/**
 * SEO metinleri içerik dosyasından gelir. Alt sayfalar yalnızca title,
 * description ve canonical'ı ezer.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${profile.fullName}` },
  description,
  applicationName: profile.fullName,
  authors: [{ name: profile.fullName, url: SITE_URL }],
  creator: profile.fullName,
  keywords: [
    profile.fullName,
    profile.headline,
    ...site.skills.flatMap((category) => category.skills),
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.fullName,
    title,
    description,
    locale: "en_US",
    firstName: profile.fullName.split(" ")[0],
    lastName: profile.fullName.split(" ").slice(1).join(" "),
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  robots: { index: true, follow: true },
};

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
        <MotionProvider>
          <Navbar />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
