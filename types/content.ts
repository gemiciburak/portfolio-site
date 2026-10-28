/** Site içeriğinin şekli. Veriler content/site.ts dosyasında tutulur. */

export interface Profile {
  fullName: string;
  headline: string;
  heroDescription: string;
  aboutParagraphs: string[];
  aboutTags: string[];
  email: string;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  avatarUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  techStack: string[];
  highlights: string[];
  imageUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
}

export type ExperienceKind = "WORK" | "EDUCATION";

export interface Experience {
  kind: ExperienceKind;
  title: string;
  organization: string;
  location: string | null;
  /** "YYYY" ya da "YYYY-MM". */
  startDate: string;
  endDate: string | null;
  description: string | null;
  highlights: string[];
}

export interface SiteContent {
  profile: Profile;
  skills: SkillCategory[];
  projects: Project[];
  experiences: Experience[];
}
