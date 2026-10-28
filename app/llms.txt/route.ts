import { SITE_URL } from "@/content/site";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-static";

/**
 * /llms.txt (llmstxt.org): LLM tabanlı arama ve asistanlar için sitenin düz
 * metin özeti. İçerik dosyasından üretilir, site ile hep aynı kalır.
 */
export function GET() {
  const { profile, skills, experiences, projects } = getSiteContent();

  const lines = [
    `# ${profile.fullName}`,
    "",
    `> ${profile.headline}${profile.location ? ` based in ${profile.location}` : ""}. ${profile.heroDescription}`,
    "",
    ...profile.aboutParagraphs.flatMap((paragraph) => [paragraph, ""]),
    "## Contact",
    "",
    `- Email: ${profile.email}`,
    ...(profile.githubUrl ? [`- GitHub: ${profile.githubUrl}`] : []),
    ...(profile.linkedinUrl ? [`- LinkedIn: ${profile.linkedinUrl}`] : []),
    `- Website: ${SITE_URL}`,
    "",
    "## Experience",
    "",
    ...experiences.flatMap((experience) => [
      `### ${experience.title} at ${experience.organization}`,
      "",
      `${experience.startDate} to ${experience.endDate ?? "present"}${experience.location ? ` · ${experience.location}` : ""}`,
      ...(experience.description ? ["", experience.description] : []),
      ...(experience.highlights.length > 0
        ? ["", ...experience.highlights.map((highlight) => `- ${highlight}`)]
        : []),
      "",
    ]),
    "## Skills",
    "",
    ...skills.map((category) => `- ${category.title}: ${category.skills.join(", ")}`),
    "",
    "## Projects",
    "",
    ...projects.map(
      (project) => `- [${project.title}](${SITE_URL}/projects/${project.slug}): ${project.summary}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
