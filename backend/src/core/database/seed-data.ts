/**
 * Sitenin başlangıç içeriği.
 *
 * Buradaki her ifade doğrulanabilir bir kaynağa dayanır: CV, GitHub deposunun
 * kendisi ya da canlı dağıtım. Hiçbir deneyim, teknoloji veya proje özelliği
 * kaynağı olmadan eklenmemiştir.
 */

export const profileSeed = {
  fullName: 'Burak Gemici',
  headline: 'Full-Stack Developer',
  heroDescription:
    'I build full-stack applications with TypeScript — scalable REST APIs and authentication ' +
    'on the backend, Next.js interfaces on the front, deployed with Docker and Nginx.',
  aboutParagraphs: [
    "I'm a full-stack developer working with TypeScript, NestJS, Next.js, and PostgreSQL. " +
      'Most of my time goes into backend work: designing REST APIs, modelling relational data, ' +
      'and building authentication that holds up in production.',
    "I'm currently a Software Engineering Intern at Neon Apps, where I build backend services " +
      'with NestJS and PostgreSQL, implement JWT authentication and role-based authorization, ' +
      'and ship containerized services to a Linux server behind an Nginx reverse proxy with ' +
      'CI/CD automation via GitHub Actions.',
    "I'm in my final year of B.Sc. Software Engineering at İstanbul Nişantaşı University. " +
      'I care about clean architecture, predictable APIs, and code the next person can read.',
  ],
  aboutTags: ['TypeScript', 'NestJS', 'Next.js', 'PostgreSQL', 'Docker'],
  email: 'burakgemici.dev@gmail.com',
  location: 'İstanbul, Türkiye',
  githubUrl: 'https://github.com/gemiciburak',
  linkedinUrl: 'https://www.linkedin.com/in/burakgemici/',
  resumeUrl: null,
  avatarUrl: '/profile.png',
  metaTitle: 'Burak Gemici | Full-Stack Developer',
  metaDescription:
    'Full-stack developer building REST APIs and web applications with TypeScript, NestJS, ' +
    'Next.js, and PostgreSQL.',
} as const;

/**
 * Dört kategori — arayüzdeki dört sütunluk ızgara ve geometrik simgeler korunur.
 * Backend en başta: portfolyonun ağırlık merkezi orası.
 */
export const skillCategoriesSeed = [
  {
    title: 'Backend',
    icon: '◈',
    sortOrder: 0,
    skills: ['NestJS', 'Node.js', 'Express.js', 'REST API', 'JWT Authentication', 'Swagger'],
  },
  {
    title: 'Frontend',
    icon: '⬡',
    sortOrder: 1,
    skills: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS'],
  },
  {
    title: 'Database',
    icon: '◉',
    sortOrder: 2,
    skills: ['PostgreSQL', 'Drizzle ORM', 'MongoDB', 'Redis', 'MySQL'],
  },
  {
    title: 'DevOps & Tools',
    icon: '◇',
    sortOrder: 3,
    skills: [
      'Docker',
      'Docker Compose',
      'Nginx',
      'CI/CD (GitHub Actions)',
      'Google Cloud Compute Engine',
      'Git & GitHub',
    ],
  },
] as const;

export const experiencesSeed = [
  {
    kind: 'WORK' as const,
    title: 'Software Engineering Intern',
    organization: 'Neon Apps',
    location: 'İstanbul, Türkiye',
    startDate: '2026-06',
    endDate: null,
    description: null,
    highlights: [
      'Built scalable backend services and RESTful APIs with NestJS, TypeScript, and PostgreSQL, following modular architecture principles.',
      'Implemented JWT-based authentication and role-based authorization.',
      'Integrated Redis caching and rate limiting to improve application performance.',
      'Developed audit logging infrastructure using MongoDB.',
      'Delivered real-time and asynchronous features with WebSockets, BullMQ, and background job processing.',
      'Containerized services with Docker and Docker Compose, and deployed them to a Linux server with an Nginx reverse proxy, HTTPS, and CI/CD automation via GitHub Actions.',
      'Collaborated through Git, code reviews, and backend architecture discussions.',
    ],
    sortOrder: 0,
  },
  {
    kind: 'EDUCATION' as const,
    title: 'B.Sc. in Software Engineering',
    organization: 'İstanbul Nişantaşı University',
    location: 'İstanbul, Türkiye',
    // CV yalnızca yılı veriyor; olmayan bir ay uydurulmadı.
    startDate: '2023',
    endDate: null,
    description: 'Fourth year.',
    highlights: [],
    sortOrder: 1,
  },
] as const;

/**
 * Üç proje. Özellikler depoların kendisinden doğrulandı:
 *   • pierre               → github.com/gemiciburak/restaurant-platform (README + ARCHITECTURE.md)
 *   • portfolio-website    → bu depo
 *   • express-product-api  → github.com/gemiciburak/express-product-api
 *
 * `imageUrl` başlangıçta null: elde gerçek ekran görüntüsü yok. Arayüz bu durumda
 * mevcut degrade yer tutucuyu gösterir; görseller admin panelinden eklenebilir.
 */
export const projectsSeed = [
  {
    slug: 'pierre',
    title: 'Pierre',
    summary:
      'Full-stack restaurant ordering platform — menu browsing, cart, checkout, and live order ' +
      'tracking, with an admin dashboard behind role-based access.',
    description:
      'Pierre is a food ordering platform built as a two-part application: a NestJS REST API and ' +
      'a Next.js App Router frontend. The backend follows a pragmatic clean architecture — every ' +
      'feature module runs Controller → Service → Repository, so business rules never build SQL ' +
      'and database rows never leave a module. Every response travels in a single envelope, and ' +
      'the Zod schemas that validate requests are the same objects that generate the Swagger docs.',
    techStack: [
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Drizzle ORM',
      'Redis',
      'BullMQ',
      'Socket.IO',
      'Next.js',
      'Tailwind CSS',
      'JWT',
      'Swagger',
      'Docker',
      'Nginx',
    ],
    highlights: [
      'RESTful NestJS API with JWT authentication — access and rotating refresh tokens, reuse detection, and Argon2id password hashing.',
      'Role-based authorization with globally applied guards; public routes are the explicit exception, not the default.',
      'Relational data modelling with PostgreSQL and Drizzle ORM, with money stored as integer cents so floats never touch prices.',
      'Redis for read-through caching, rate limiting, refresh-token storage, and JWT blacklisting.',
      'Order lifecycle governed by a state machine, with domain events fanning out to BullMQ queues and Socket.IO clients.',
      'Next.js frontend covering menu browsing, cart, checkout, order tracking, and an admin dashboard.',
      'Containerized with Docker Compose and deployed behind Nginx with Let’s Encrypt HTTPS and GitHub Actions CI.',
    ],
    imageUrl: null,
    githubUrl: 'https://github.com/gemiciburak/restaurant-platform',
    liveUrl: 'https://pierre.burakgemici.com.tr',
    featured: true,
    status: 'PUBLISHED' as const,
    sortOrder: 0,
  },
  {
    slug: 'portfolio-website',
    title: 'Portfolio Website',
    summary:
      'This site — a Next.js frontend backed by a NestJS API, with every section served from ' +
      'PostgreSQL instead of hard-coded content.',
    description:
      'The portfolio started as a static Next.js site and was rebuilt as a full-stack application. ' +
      'All content — profile, skills, projects, and experience — lives in PostgreSQL and is served ' +
      'through a NestJS REST API, so updating the site means updating data rather than redeploying ' +
      'components. The frontend keeps its original dark glass interface and scroll-triggered motion.',
    techStack: [
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Drizzle ORM',
      'Next.js',
      'React',
      'Tailwind CSS',
      'Framer Motion',
      'JWT',
      'Swagger',
      'Docker',
      'Nginx',
    ],
    highlights: [
      'Modern, responsive dark interface with scroll-triggered motion, built with Next.js App Router and Tailwind CSS.',
      'NestJS REST API serving profile, skills, projects, and experience content from PostgreSQL via Drizzle ORM.',
      'Admin panel behind JWT authentication for managing projects and site content without touching code.',
      'Contact form persisted to PostgreSQL with server-side validation, per-route rate limiting, and a honeypot field.',
      'Swagger documentation generated from the same Zod schemas that validate incoming requests.',
      'Containerized with Docker Compose and served behind an Nginx reverse proxy in production.',
    ],
    imageUrl: null,
    githubUrl: null,
    liveUrl: 'https://www.burakgemici.com.tr',
    featured: true,
    status: 'PUBLISHED' as const,
    sortOrder: 1,
  },
  {
    slug: 'express-product-api',
    title: 'Express Product API',
    summary:
      'RESTful product management API built with Express and MongoDB, with full CRUD over ' +
      'modular routes.',
    description:
      'A focused CRUD API for managing products, written with Express and Mongoose. Routing is ' +
      'split into its own module and product data is modelled with a Mongoose schema, keeping ' +
      'the persistence layer separate from the HTTP layer.',
    techStack: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST API'],
    highlights: [
      'Full CRUD operations built with Express and organized through modular routing.',
      'Product data modelled with Mongoose schemas and persisted in MongoDB.',
      'All endpoints (GET, POST, PUT, DELETE) tested with Postman and documented in the README.',
    ],
    imageUrl: null,
    githubUrl: 'https://github.com/gemiciburak/express-product-api',
    liveUrl: null,
    featured: true,
    status: 'PUBLISHED' as const,
    sortOrder: 2,
  },
] as const;
