import { site } from "@/content/site";
import type { Project, SiteContent } from "@/types/content";

/**
 * İçerik statik olarak kodla birlikte gelir; sayfalar build anında üretilir.
 * İçeriği güncellemek için content/site.ts düzenlenip push edilir.
 */
export function getSiteContent(): SiteContent {
  return site;
}

export function getProjects(): Project[] {
  return site.projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return site.projects.find((project) => project.slug === slug);
}
