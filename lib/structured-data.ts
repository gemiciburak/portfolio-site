import { SITE_URL } from "@/content/site";
import type { Project, SiteContent } from "@/types/content";

/**
 * schema.org yapılandırılmış verisi (JSON-LD). Arama motorları ve LLM tabanlı
 * arama, sayfayı "kim, ne yapıyor, nerede çalışıyor" olarak bununla okur.
 */

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function homeJsonLd({ profile, skills, experiences }: SiteContent) {
  const work = experiences.find((experience) => experience.kind === "WORK" && !experience.endDate);
  const education = experiences.filter((experience) => experience.kind === "EDUCATION");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: profile.fullName,
        description: profile.metaDescription ?? profile.heroDescription,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: profile.fullName,
        url: SITE_URL,
        jobTitle: profile.headline,
        description: profile.heroDescription,
        email: `mailto:${profile.email}`,
        ...(profile.avatarUrl && { image: new URL(profile.avatarUrl, SITE_URL).href }),
        ...(profile.location && {
          address: { "@type": "PostalAddress", addressLocality: profile.location },
        }),
        sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
        knowsAbout: skills.flatMap((category) => category.skills),
        ...(work && { worksFor: { "@type": "Organization", name: work.organization } }),
        alumniOf: education.map((item) => ({
          "@type": "CollegeOrUniversity",
          name: item.organization,
        })),
      },
    ],
  };
}

export function projectJsonLd(project: Project) {
  const url = `${SITE_URL}/projects/${project.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#project`,
        name: project.title,
        description: project.description ?? project.summary,
        url,
        author: { "@id": PERSON_ID },
        keywords: project.techStack.join(", "),
        ...(project.githubUrl && { codeRepository: project.githubUrl }),
        ...(project.liveUrl && { sameAs: project.liveUrl }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/#projects` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}
