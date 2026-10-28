"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Profile } from "@/types/content";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function AboutSection({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
            Get to know me
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={item} className="flex justify-center">
            <div className="relative">
              {/*
                Çerçeve oranı fotoğrafın kendi oranına (4:5, 720×900) sabit:
                ne kırpma ne boşluk. Görsel ekranın altında kaldığı için
                priority yok; hero'nun yüklenmesiyle yarışmasın.
              */}
              <div className="relative w-60 sm:w-72 aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/40 bg-zinc-800">
                {profile.avatarUrl && (
                  <Image
                    src={profile.avatarUrl}
                    alt={`Portrait of ${profile.fullName}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 15rem, 18rem"
                  />
                )}
              </div>

              {/* Hero'daki accent parıltısıyla aynı görsel dil. */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/30 to-purple-500/30 blur-xl -z-10 opacity-50" />
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-6">
            {profile.aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-zinc-400 leading-relaxed text-lg"
              >
                {paragraph}
              </p>
            ))}
            <motion.div
              variants={item}
              className="flex flex-wrap gap-3 pt-4"
            >
              {profile.aboutTags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-lg glass text-sm text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
