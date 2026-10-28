"use client";

import { motion } from "framer-motion";
import type { Experience } from "@/types/content";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

/** "2026-06" → "Jun 2026", "2023" → "2023", null → "Present". */
function formatDate(value: string | null): string {
  if (!value) return "Present";

  const [year, month] = value.split("-");
  if (!month) return year;

  const label = new Date(Number(year), Number(month) - 1).toLocaleString("en", {
    month: "short",
  });

  return `${label} ${year}`;
}

export default function ExperienceSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Experience & <span className="gradient-text">Education</span>
          </h2>
          <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
            Where I&apos;ve been
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          {experiences.map((experience) => (
            <motion.article
              key={`${experience.organization}-${experience.title}`}
              variants={card}
              className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-accent/30 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-accent-light mb-2">
                    {experience.kind === "WORK" ? "Work" : "Education"}
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    {experience.title}
                  </h3>
                  <p className="text-zinc-400 mt-1">
                    {experience.organization}
                    {experience.location && (
                      <span className="text-zinc-400">
                        {" · "}
                        {experience.location}
                      </span>
                    )}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg glass text-xs font-mono text-zinc-300 whitespace-nowrap">
                  {formatDate(experience.startDate)} —{" "}
                  {formatDate(experience.endDate)}
                </span>
              </div>

              {experience.description && (
                <p className="text-zinc-400 leading-relaxed">
                  {experience.description}
                </p>
              )}

              {experience.highlights.length > 0 && (
                <ul className="space-y-2.5 mt-4">
                  {experience.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-zinc-400 leading-relaxed"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
