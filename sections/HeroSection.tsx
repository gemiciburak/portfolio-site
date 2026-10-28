import type { CSSProperties } from "react";
import type { Profile } from "@/types/content";

const techIcons = [
  { name: "TypeScript", icon: "TS", delay: 0 },
  { name: "NestJS", icon: "⬢", delay: 0.2 },
  { name: "Next", icon: "▲", delay: 0.4 },
  { name: "React", icon: "⚛", delay: 0.6 },
  { name: "PostgreSQL", icon: "◉", delay: 0.8 },
];

/** Dekoratif rozetler: konum ve süre önceki tasarımla aynı, hareket CSS'te. */
const badges = [
  ...techIcons.map((tech, i) => ({
    key: tech.name,
    icon: tech.icon,
    opacity: 0.15,
    style: {
      top: `${15 + i * 15}%`,
      left: `${10 + (i % 3) * 25}%`,
      "--drift-x": "5px",
      "--drift-y": "-15px",
      "--drift-duration": `${4 + i * 0.5}s`,
      animationDelay: `${tech.delay}s`,
    },
  })),
  ...techIcons.slice(0, 3).map((tech, i) => ({
    key: `right-${tech.name}`,
    icon: tech.icon,
    opacity: 0.12,
    style: {
      top: `${40 + i * 20}%`,
      right: `${15 + (i % 2) * 20}%`,
      "--drift-x": "-5px",
      "--drift-y": "10px",
      "--drift-duration": `${5 + i * 0.3}s`,
      animationDelay: `${tech.delay + 0.5}s`,
    },
  })),
];

/** Sıralı giriş: her öğe bir öncekinden 0.1 sn sonra. */
const stagger = (index: number): CSSProperties => ({
  animationDelay: `${0.2 + index * 0.1}s`,
});

/**
 * Sunucu bileşeni: tarayıcıya JS göndermez. Animasyonlar CSS'te (globals.css),
 * bölüm bağlantıları `scroll-behavior: smooth` ile yumuşak kayar.
 */
export default function HeroSection({ profile }: { profile: Profile }) {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {badges.map((badge) => (
          <div
            key={badge.key}
            className="badge-icon absolute glass rounded-lg px-3 py-2 text-sm font-mono text-white/80 animate-drift"
            style={{ ...badge.style, opacity: badge.opacity } as CSSProperties}
            data-icon={badge.icon}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-3xl flex flex-col items-center">
        <p
          className="text-accent-light font-mono text-sm mb-4 tracking-widest uppercase animate-fade-up"
          style={stagger(0)}
        >
          {profile.headline}
        </p>
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-rise"
          style={stagger(1)}
        >
          Hi, I&apos;m{" "}
          <span className="gradient-text">{profile.fullName}</span>
        </h1>
        <p
          className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed animate-rise"
          style={stagger(2)}
        >
          {profile.heroDescription}
        </p>
        <div className="flex flex-wrap gap-4 justify-center animate-fade-up" style={stagger(3)}>
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl bg-accent-dark hover:bg-accent text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25"
          >
            View Projects
          </a>
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl glass hover:bg-white/10 text-white font-medium transition-all border border-white/10"
            >
              GitHub
            </a>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-up"
        style={{ animationDelay: "1.5s" }}
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors animate-nudge"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
