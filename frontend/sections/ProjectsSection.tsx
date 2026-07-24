"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/types/api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">
            What I&apos;ve built
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.article
              key={project.id}
              variants={card}
              whileHover={{ y: -8 }}
              className="group glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-accent/30 transition-all duration-300 flex flex-col"
            >
              <Link
                href={`/projects/${project.slug}`}
                className="block aspect-video bg-gradient-to-br from-accent/20 to-purple-500/20 relative overflow-hidden"
                aria-label={`${project.title} details`}
              >
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  // Görsel yoksa mevcut degrade yer tutucu korunur.
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/10 group-hover:text-white/20 transition-colors">
                      {project.title.slice(0, 2)}
                    </span>
                  </div>
                )}
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-accent-light transition-colors">
                  <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                </h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                  {project.summary}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-500">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>
                {/* mt-auto: kart yükseklikleri farklı olsa da butonlar hizalı kalır. */}
                <div className="flex gap-3 mt-auto">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex-1 py-2 rounded-lg bg-accent hover:bg-accent-light text-center text-sm font-medium transition-colors"
                  >
                    Details
                  </Link>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg glass text-center text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg glass text-center text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Live
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
