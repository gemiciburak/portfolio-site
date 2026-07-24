"use client";

import { motion } from "framer-motion";
import type { SkillCategory } from "@/types/api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function SkillsSection({
  categories,
}: {
  categories: SkillCategory[];
}) {
  return (
    <section id="skills" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Skills & <span className="gradient-text">Tech</span>
          </h2>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">
            What I work with
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={card}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-accent/30 transition-colors group"
            >
              <div className="text-3xl mb-4 text-accent group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-6 text-white">
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {skill.name}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
