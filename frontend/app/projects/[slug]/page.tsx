import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getProjectBySlug, getProjects } from "@/lib/api";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * API build anında erişilebiliyorsa (lokal geliştirme) sayfalar önceden üretilir.
 * Konteyner build'inde API erişilemez — boş liste döner ve sayfalar ilk istekte
 * üretilip cache'lenir. Her iki durumda da build düşmez.
 */
export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const project = await getProjectBySlug(slug);
    return { title: `${project.title} | Burak Gemici`, description: project.summary };
  } catch {
    return { title: "Project not found | Burak Gemici" };
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let project;

  try {
    project = await getProjectBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main id="main-content" className="pt-32 pb-32 px-6 relative">
      {/* Hero'daki ışıma efektiyle aynı görsel dil. */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <article className="max-w-4xl mx-auto relative z-10">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to projects
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="gradient-text">{project.title}</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
            {project.summary}
          </p>
        </header>

        <div className="flex flex-wrap gap-3 mb-10">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25"
            >
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl glass hover:bg-white/10 text-white font-medium transition-all border border-white/10"
            >
              View on GitHub
            </a>
          )}
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-accent/20 to-purple-500/20 mb-12">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-white/10">
                {project.title.slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        {project.description && (
          <section className="mb-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Overview
            </h2>
            <p className="text-zinc-400 leading-relaxed text-lg">
              {project.description}
            </p>
          </section>
        )}

        {project.highlights.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              What it does
            </h2>
            <ul className="space-y-4">
              {project.highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex gap-4 glass rounded-xl p-5 border border-white/5"
                >
                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.techStack.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Built with
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-lg glass text-sm text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
