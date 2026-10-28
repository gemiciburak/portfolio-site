import type { SiteContent } from "@/types/content";

/** Kanonik adres: canonical, sitemap, Open Graph ve JSON-LD buradan türer. */
export const SITE_URL = "https://burakgemici.com.tr";

/**
 * Link önizleme kartı (LinkedIn, X, WhatsApp). Statik dosya: Next'in
 * opengraph-image çıktısı uzantısız olduğundan GitHub Pages onu yanlış
 * Content-Type ile sunar.
 */
export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Burak Gemici — Full-Stack Developer",
};

/**
 * Sitenin içeriği.
 *
 * Buradaki her ifade doğrulanabilir bir kaynağa dayanır: CV, GitHub deposunun
 * kendisi ya da canlı dağıtım. Hiçbir deneyim, teknoloji veya proje özelliği
 * kaynağı olmadan eklenmemiştir.
 */
export const site: SiteContent = {
  profile: {
    fullName: "Burak Gemici",
    headline: "Full-Stack Developer",
    heroDescription:
      "I build full-stack applications with TypeScript — scalable REST APIs and authentication " +
      "on the backend, Next.js interfaces on the front, deployed with Docker and Nginx.",
    aboutParagraphs: [
      "I'm a full-stack developer working with TypeScript, NestJS, Next.js, and PostgreSQL. " +
        "Most of my time goes into backend work: designing REST APIs, modelling relational data, " +
        "and building authentication that holds up in production.",
      "Most recently I was a Software Engineering Intern at Neon Apps (June–August 2026), where I " +
        "built backend services with NestJS and PostgreSQL, implemented JWT authentication and " +
        "role-based authorization, and shipped containerized services to a Linux server behind an " +
        "Nginx reverse proxy with CI/CD automation via GitHub Actions.",
      "I'm in my final year of B.Sc. Software Engineering at İstanbul Nişantaşı University. " +
        "I care about clean architecture, predictable APIs, and code the next person can read.",
    ],
    aboutTags: ["TypeScript", "NestJS", "Next.js", "PostgreSQL", "Docker"],
    email: "burakgemici.dev@gmail.com",
    location: "İstanbul, Türkiye",
    githubUrl: "https://github.com/gemiciburak",
    linkedinUrl: "https://www.linkedin.com/in/burakgemici/",
    resumeUrl: null,
    avatarUrl: "/profile.webp",
    metaTitle: "Burak Gemici | Full-Stack Developer",
    metaDescription:
      "Full-stack developer building REST APIs and web applications with TypeScript, NestJS, " +
      "Next.js, and PostgreSQL.",
  },

  /**
   * Dört kategori — arayüzdeki dört sütunluk ızgara ve geometrik simgeler korunur.
   * Backend en başta: portfolyonun ağırlık merkezi orası.
   */
  skills: [
    {
      title: "Backend",
      icon: "◈",
      skills: ["NestJS", "Node.js", "Express.js", "REST API", "JWT Authentication", "Swagger"],
    },
    {
      title: "Frontend",
      icon: "⬡",
      skills: ["Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS"],
    },
    {
      title: "Database",
      icon: "◉",
      skills: ["PostgreSQL", "Drizzle ORM", "MongoDB", "Redis", "MySQL"],
    },
    {
      title: "DevOps & Tools",
      icon: "◇",
      skills: [
        "Docker",
        "Docker Compose",
        "Nginx",
        "CI/CD (GitHub Actions)",
        "Google Cloud Compute Engine",
        "Git & GitHub",
      ],
    },
  ],

  experiences: [
    {
      kind: "WORK",
      title: "Software Engineering Intern",
      organization: "Neon Apps",
      location: "İstanbul, Türkiye",
      startDate: "2026-06",
      endDate: "2026-08",
      description: null,
      highlights: [
        "Built scalable backend services and RESTful APIs with NestJS, TypeScript, and PostgreSQL, following modular architecture principles.",
        "Implemented JWT-based authentication and role-based authorization.",
        "Integrated Redis caching and rate limiting to improve application performance.",
        "Developed audit logging infrastructure using MongoDB.",
        "Delivered real-time and asynchronous features with WebSockets, BullMQ, and background job processing.",
        "Containerized services with Docker and Docker Compose, and deployed them to a Linux server with an Nginx reverse proxy, HTTPS, and CI/CD automation via GitHub Actions.",
        "Collaborated through Git, code reviews, and backend architecture discussions.",
      ],
    },
    {
      kind: "EDUCATION",
      title: "B.Sc. in Software Engineering",
      organization: "İstanbul Nişantaşı University",
      location: "İstanbul, Türkiye",
      // CV yalnızca yılı veriyor; olmayan bir ay uydurulmadı.
      startDate: "2023",
      endDate: null,
      description: "Fourth year.",
      highlights: [],
    },
  ],

  /**
   * Üç proje. Özellikler depoların kendisinden doğrulandı:
   *   • pierre               → github.com/gemiciburak/restaurant-platform (README + ARCHITECTURE.md)
   *   • portfolio-website    → bu depo
   *   • express-product-api  → github.com/gemiciburak/express-product-api
   *
   * `imageUrl` null olduğunda arayüz degrade yer tutucuyu gösterir.
   */
  projects: [
    {
      slug: "pierre",
      title: "Pierre",
      summary:
        "Full-stack restaurant ordering platform — menu browsing, cart, checkout, and live order " +
        "tracking, with an admin dashboard behind role-based access.",
      description:
        "Pierre is a food ordering platform built as a two-part application: a NestJS REST API and " +
        "a Next.js App Router frontend. The backend follows a pragmatic clean architecture — every " +
        "feature module runs Controller → Service → Repository, so business rules never build SQL " +
        "and database rows never leave a module. Every response travels in a single envelope, and " +
        "the Zod schemas that validate requests are the same objects that generate the Swagger docs.",
      techStack: [
        "NestJS",
        "TypeScript",
        "PostgreSQL",
        "Drizzle ORM",
        "Redis",
        "BullMQ",
        "Socket.IO",
        "Next.js",
        "Tailwind CSS",
        "JWT",
        "Swagger",
        "Docker",
        "Nginx",
      ],
      highlights: [
        "RESTful NestJS API with JWT authentication — access and rotating refresh tokens, reuse detection, and Argon2id password hashing.",
        "Role-based authorization with globally applied guards; public routes are the explicit exception, not the default.",
        "Relational data modelling with PostgreSQL and Drizzle ORM, with money stored as integer cents so floats never touch prices.",
        "Redis for read-through caching, rate limiting, refresh-token storage, and JWT blacklisting.",
        "Order lifecycle governed by a state machine, with domain events fanning out to BullMQ queues and Socket.IO clients.",
        "Next.js frontend covering menu browsing, cart, checkout, order tracking, and an admin dashboard.",
        "Containerized with Docker Compose and deployed behind Nginx with Let’s Encrypt HTTPS and GitHub Actions CI.",
      ],
      imageUrl: null,
      githubUrl: "https://github.com/gemiciburak/restaurant-platform",
      // Barındığı VM kapandı; yeniden yayına alınınca adres buraya eklenir.
      liveUrl: null,
    },
    {
      slug: "portfolio-website",
      title: "Portfolio Website",
      summary:
        "This site — a statically generated Next.js app with a dark glass interface and " +
        "scroll-triggered motion, deployed on GitHub Pages.",
      description:
        "A personal portfolio built with the Next.js App Router, TypeScript, and Tailwind CSS. All " +
        "content — profile, skills, projects, and experience — lives in a single typed data file, " +
        "and every page, including each project's detail page, is prerendered at build time. " +
        "Pushing to main deploys the site to GitHub Pages.",
      techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "GitHub Actions"],
      highlights: [
        "Modern, responsive dark interface with scroll-triggered motion, built with Next.js App Router and Tailwind CSS.",
        "Content kept in one typed TypeScript module, so updating the site never means touching components.",
        "Fully static output — project detail pages are generated at build time from the same data.",
        "Search-ready by default: canonical URLs, Open Graph, sitemap, JSON-LD structured data, and an llms.txt summary.",
        "Continuous deployment to GitHub Pages through GitHub Actions, gated on lint, type-check, and build.",
      ],
      imageUrl: null,
      githubUrl: "https://github.com/gemiciburak/portfolio-site",
      liveUrl: SITE_URL,
    },
    {
      slug: "express-product-api",
      title: "Express Product API",
      summary:
        "RESTful product management API built with Express and MongoDB, with full CRUD over " +
        "modular routes.",
      description:
        "A focused CRUD API for managing products, written with Express and Mongoose. Routing is " +
        "split into its own module and product data is modelled with a Mongoose schema, keeping " +
        "the persistence layer separate from the HTTP layer.",
      techStack: ["Node.js", "Express.js", "MongoDB", "Mongoose", "REST API"],
      highlights: [
        "Full CRUD operations built with Express and organized through modular routing.",
        "Product data modelled with Mongoose schemas and persisted in MongoDB.",
        "All endpoints (GET, POST, PUT, DELETE) tested with Postman and documented in the README.",
      ],
      imageUrl: null,
      githubUrl: "https://github.com/gemiciburak/express-product-api",
      liveUrl: null,
    },
  ],
};
