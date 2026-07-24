"use client";

import { motion } from "framer-motion";
import type { Profile } from "@/types/api";

const techIcons = [
  { name: "TypeScript", icon: "TS", delay: 0 },
  { name: "NestJS", icon: "⬢", delay: 0.2 },
  { name: "Next", icon: "▲", delay: 0.4 },
  { name: "React", icon: "⚛", delay: 0.6 },
  { name: "PostgreSQL", icon: "◉", delay: 0.8 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HeroSection({ profile }: { profile: Profile }) {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {techIcons.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 0.15,
              scale: 1,
              y: [0, -15, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: tech.delay,
            }}
            className="absolute glass rounded-lg px-3 py-2 text-sm font-mono text-white/80"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + (i % 3) * 25}%`,
            }}
          >
            {tech.icon}
          </motion.div>
        ))}
        {techIcons.slice(0, 3).map((tech, i) => (
          <motion.div
            key={`right-${tech.name}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 0.12,
              scale: 1,
              y: [0, 10, 0],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 5 + i * 0.3,
              repeat: Infinity,
              delay: tech.delay + 0.5,
            }}
            className="absolute glass rounded-lg px-3 py-2 text-sm font-mono text-white/80"
            style={{
              top: `${40 + i * 20}%`,
              right: `${15 + (i % 2) * 20}%`,
            }}
          >
            {tech.icon}
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-3xl flex flex-col items-center"
      >
        <motion.p
          variants={item}
          className="text-accent font-mono text-sm mb-4 tracking-widest uppercase"
        >
          {profile.headline}
        </motion.p>
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Hi, I&apos;m{" "}
          <span className="gradient-text">{profile.fullName}</span>
        </motion.h1>
        <motion.p
          variants={item}
          className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed"
        >
          {profile.heroDescription}
        </motion.p>
        <motion.div
          variants={item}
          className="flex flex-wrap gap-4 justify-center"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#projects")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25"
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
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#about")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
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
        </motion.a>
      </motion.div>
    </section>
  );
}
