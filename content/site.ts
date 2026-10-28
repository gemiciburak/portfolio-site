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
  alt: "Burak Gemici, Full-Stack Developer",
};

/**
 * Sitenin içeriği.
 *
 * Buradaki her ifade doğrulanabilir bir kaynağa dayanır: CV, GitHub deposunun
 * kendisi ya da canlı dağıtım. Hiçbir deneyim, teknoloji veya proje özelliği
 * kaynağı olmadan eklenmemiştir.
 *
 * Yazım: kısa, düz cümleler. Uzun tire (—) kullanılmaz.
 */
export const site: SiteContent = {
  profile: {
    fullName: "Burak Gemici",
    headline: "Full-Stack Developer",
    heroDescription:
      "I'm a full-stack developer from Istanbul. I mostly work on the backend with NestJS and " +
      "PostgreSQL, and build the frontend with Next.js.",
    aboutParagraphs: [
      "I work mainly with TypeScript. Most of my time goes into the backend: REST APIs with " +
        "NestJS, PostgreSQL databases and authentication. On the frontend I use Next.js and " +
        "Tailwind CSS.",
      "From June to August 2026 I was a software engineering intern at Neon Apps. I worked on " +
        "backend services with NestJS and PostgreSQL, added JWT login and role-based permissions, " +
        "and deployed services with Docker on a Linux server behind Nginx.",
      "I'm a fourth-year Software Engineering student at İstanbul Nişantaşı University. Outside " +
        "of school I build my own projects, from web apps to a mobile game.",
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
      "Burak Gemici is a full-stack developer in Istanbul working with TypeScript, NestJS, " +
      "Next.js and PostgreSQL.",
  },

  /** Dört kategori: arayüzdeki dört sütunluk ızgara ve geometrik simgeler korunur. */
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
        "Built REST APIs with NestJS, TypeScript and PostgreSQL.",
        "Added JWT authentication and role-based authorization.",
        "Used Redis for caching and rate limiting.",
        "Set up audit logging with MongoDB.",
        "Worked on real-time and background features with WebSockets and BullMQ.",
        "Packaged services with Docker Compose and deployed them to a Linux server with Nginx, HTTPS and GitHub Actions.",
        "Took part in code reviews and backend design discussions.",
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
   *   • pierre             → github.com/gemiciburak/restaurant-platform (README + ARCHITECTURE.md)
   *   • catch-me           → github.com/gemiciburak/pandas (gizli repo; README + docs/ARCHITECTURE.md)
   *   • portfolio-website  → bu depo
   *
   * `imageUrl` null olduğunda arayüz degrade yer tutucuyu gösterir.
   */
  projects: [
    {
      slug: "pierre",
      title: "Pierre",
      summary:
        "A restaurant ordering app. Customers browse the menu, place orders and follow them live, " +
        "and staff manage everything from an admin panel.",
      description:
        "Pierre has a NestJS API and a Next.js frontend. Each backend module is split into " +
        "controller, service and repository layers, which keeps database code out of the business " +
        "logic. Requests are validated with Zod, and the same schemas generate the Swagger docs.",
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
        "JWT login with access and refresh tokens. Refresh tokens rotate, reused tokens are detected, and passwords are hashed with Argon2id.",
        "Role-based access control. Every route is protected unless it's marked as public.",
        "PostgreSQL with Drizzle ORM. Prices are stored as whole cents to avoid rounding errors.",
        "Redis for caching, rate limiting and token storage.",
        "Orders move through a state machine. Status changes go to BullMQ queues and to clients over Socket.IO.",
        "Next.js frontend with menu, cart, checkout, order tracking and an admin dashboard.",
        "Runs on Docker Compose behind Nginx with Let's Encrypt, with CI on GitHub Actions.",
      ],
      imageUrl: null,
      githubUrl: "https://github.com/gemiciburak/restaurant-platform",
      // Barındığı VM kapandı; yeniden yayına alınınca adres buraya eklenir.
      liveUrl: null,
    },
    {
      slug: "catch-me",
      title: "Catch Me!",
      summary:
        "A panda reflex game for iOS, Android and the web, made with Unity and C#. Tap the real " +
        "pandas before they hide and leave the decoys alone.",
      description:
        "Catch Me! is a mobile reflex game I built in Unity. Pandas pop up around a bamboo forest " +
        "and you have to tap the real ones before they disappear, while ignoring the winking " +
        "decoys. There are 50 levels in five difficulty tiers, a quick play mode and an endless " +
        "mode. The game is in Turkish, works offline and has no ads or in-app purchases.",
      techStack: ["Unity", "C#", "UI Toolkit", "NUnit", "WebGL", "Cloudflare Workers"],
      highlights: [
        "50 levels in five tiers, with a boss level every ten levels.",
        "All game rules live in a C# library with no Unity dependency, so they can be tested on their own. It has 165 NUnit tests.",
        "Gameplay doesn't depend on frame rate. The tests run it at everything from 15 to 240 fps.",
        "Level difficulty was tuned against simulated players with different skill levels.",
        "All 130 sprites are drawn as SVG in code, and the sound effects and music are generated in code too.",
        "Save files are versioned and checksummed, with a backup copy in case one gets corrupted.",
        "The web version runs as a PWA on Cloudflare Workers.",
      ],
      imageUrl: null,
      // Repo gizli; GitHub linki verilmez.
      githubUrl: null,
      liveUrl: "https://pandas.mgbsoftware.com.tr",
    },
    {
      slug: "portfolio-website",
      title: "Portfolio Website",
      summary: "This website. A static Next.js site hosted on GitHub Pages.",
      description:
        "My personal site, built with Next.js, TypeScript and Tailwind CSS. All the text lives in " +
        "one data file and every page is generated at build time, so there's no server to run. " +
        "Each push to main rebuilds the site and deploys it to GitHub Pages.",
      techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "GitHub Actions"],
      highlights: [
        "Responsive dark design with scroll animations made with Framer Motion.",
        "Project pages are generated from the same data file as the home page.",
        "SEO setup with canonical URLs, Open Graph tags, a sitemap and JSON-LD structured data.",
        "GitHub Actions runs linting, type checks and the build before every deploy.",
      ],
      imageUrl: null,
      githubUrl: "https://github.com/gemiciburak/portfolio-site",
      liveUrl: SITE_URL,
    },
  ],
};
