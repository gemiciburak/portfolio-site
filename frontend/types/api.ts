/** Backend DTO'larının aynadaki karşılıkları. Zarf yapısı API ile birebir. */

export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

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
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  sortOrder: number;
  skills: Skill[];
}

export type ProjectStatus = "DRAFT" | "PUBLISHED";

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  techStack: string[];
  highlights: string[];
  imageUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  status: ProjectStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ExperienceKind = "WORK" | "EDUCATION";

export interface Experience {
  id: string;
  kind: ExperienceKind;
  title: string;
  organization: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  highlights: string[];
  sortOrder: number;
}

export interface SiteContent {
  profile: Profile;
  skills: SkillCategory[];
  projects: Project[];
  experiences: Experience[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: AuthUser;
  tokens: TokenPair;
}
