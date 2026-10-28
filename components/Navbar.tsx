"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    // Sayfa ortasından (yenileme, #hash) açılırsa ilk durum da doğru olsun.
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileOpen(false);

    const target = document.querySelector(href);

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Proje detayı gibi alt sayfalardayız: bölüm bu sayfada yok, ana sayfaya git.
    router.push(`/${href}`);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong glass-blur py-3" : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Marka kilidi: monogram + ad + rol. */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="group relative flex items-center gap-3"
        >
          {/* Hover'da beliren yumuşak ışıma. DOM sırası gereği rozetin arkasında kalır. */}
          <span
            aria-hidden
            className="absolute left-0 h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-70"
          />

          {/* 1.5px'lik gradient çerçeve + koyu iç yüzey. */}
          <span className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-accent via-purple-500 to-pink-500 p-[1.5px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-[var(--background)]">
              <span className="gradient-text font-mono text-sm font-bold leading-none tracking-tight">
                BG
              </span>
            </span>
          </span>

          {/* Dar ekranlarda menüyle yarışmaması için yalnızca lg'de görünür. */}
          <span className="hidden lg:flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-white">
              Burak Gemici
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 transition-colors group-hover:text-accent">
              Full-Stack Dev
            </span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong glass-blur border-t border-white/10"
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block text-zinc-300 hover:text-white transition-colors py-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
