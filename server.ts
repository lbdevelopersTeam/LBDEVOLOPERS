import crypto from "crypto";
import compression from "compression";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { z } from "zod";
import { sql } from "kysely";
import { createDatabase, databaseConfigFromEnv } from "./server/db/client";
import { createUnavailableV2Router, createV2Router } from "./server/api/v2/router";
import { authenticate } from "./server/api/v2/security";
import { createMysqlDatabase, mysqlConfigFromEnv } from "./server/mysql/client";
import { createUnavailableV3Router, createV3Router } from "./server/api/v3/router";
import { MysqlV3Store } from "./server/api/v3/mysql-store";
import { localUploadRoot } from "./server/api/v2/storage";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

type ProjectStatus = "draft" | "published" | "archived";
type BlogStatus = "draft" | "published" | "scheduled";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  memberId?: string;
  memberSlug?: string;
  memberName?: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  gallery: string[];
  category: "Web" | "Mobile" | "E-commerce" | "Custom" | string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  status: ProjectStatus;
  completionDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder: number;
  memberId?: string;
  memberRole?: string;
  contributors?: { memberId: string; role: string }[];
  client?: string;
  industry?: string;
  problem?: string;
  challenge?: string;
  solution?: string;
  process?: string[];
  results?: string[];
  achievements?: string[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  fullBio?: string;
  specialization?: string;
  tagline?: string;
  avatar: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
  yearsExperience?: string;
  languages?: string[];
  cvUrl?: string;
  accentColor?: string;
  skills: string[];
  skillGroups?: { category: string; skills: string[] }[];
  experience?: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    responsibilities?: string[];
    achievements?: string[];
    technologies?: string[];
  }[];
  education?: {
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    achievements?: string[];
  }[];
  certifications?: {
    id: string;
    title: string;
    organization?: string;
    type?: string;
    issueDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    image?: string;
  }[];
  testimonials?: {
    id: string;
    quote: string;
    author: string;
    role: string;
    company?: string;
    project?: string;
    avatar?: string;
  }[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    behance?: string;
    dribbble?: string;
    instagram?: string;
    website?: string;
  };
  active: boolean;
  displayOrder: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  publishedAt?: string;
  readingTime: string;
  metaTitle?: string;
  metaDescription?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ActivityItem {
  id: string;
  label: string;
  createdAt: string;
}

interface DB {
  messages: Message[];
  projects: Project[];
  team: TeamMember[];
  blogs: BlogPost[];
  activity: ActivityItem[];
  views: {
    total: number;
  };
}

const nowIso = () => new Date().toISOString();
const id = () => `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
const fallbackImage = (seed: string, size = "1200/800") => `https://picsum.photos/seed/${seed}/${size}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";

const calculateReadingTime = (htmlOrText: string) => {
  const words = htmlOrText.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
};

const excerptFromContent = (content: string, maxLength = 200) => {
  const plain = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength - 1).trim()}…` : plain;
};

const dated = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    : "";

const seedProjects: Project[] = [
  {
    id: "project-albawabaa", title: "albawabaa.shop", slug: "albawabaa-shop",
    shortDescription: "Arabic-first WPC door storefront combining premium product presentation with localized commerce journeys.",
    fullDescription: "<p>An Arabic-first commerce experience for premium WPC doors, designed around product discovery, material benefits, and confident purchasing.</p>",
    thumbnail: "/images/albawabaa.shop.png", gallery: [], category: "E-commerce",
    technologies: ["Shopify", "RTL Commerce", "Localization", "Product Catalog"], liveUrl: "https://albawabaa.shop/", githubUrl: "",
    featured: true, status: "published", completionDate: "", metaTitle: "albawabaa.shop case study",
    metaDescription: "Arabic WPC door commerce experience by LB CodeBase.", sortOrder: 1, deletedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z", updatedAt: "2026-09-03T00:00:00.000Z",
  },
  {
    id: "project-vogue-decor", title: "Vogue Decor", slug: "vogue-decor",
    shortDescription: "Commercial furniture storefront built for polished discovery across seating, tables, outdoor collections, and trade buyers.",
    fullDescription: "<p>A refined furniture commerce platform serving hospitality and commercial buyers across Canada.</p>",
    thumbnail: "/images/voguedecor.com.png", gallery: [], category: "E-commerce",
    technologies: ["Shopify", "E-commerce UX", "Product Catalog", "Responsive Design"], liveUrl: "https://www.voguedecor.com/", githubUrl: "",
    featured: true, status: "published", completionDate: "", metaTitle: "Vogue Decor case study",
    metaDescription: "Commercial furniture e-commerce experience by LB CodeBase.", sortOrder: 2, deletedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z", updatedAt: "2026-09-03T00:00:00.000Z",
  },
  {
    id: "project-american-dream-auto-protect", title: "American Dream Auto Protect", slug: "american-dream-auto-protect",
    shortDescription: "Conversion-focused vehicle protection platform with clear plan education and a streamlined quote journey.",
    fullDescription: "<p>A lead-generation platform for vehicle protection plans, structured around trust, coverage clarity, and fast quote requests.</p>",
    thumbnail: "/images/americandreamautoprotect.com.png", gallery: [], category: "Web",
    technologies: ["Lead Generation", "Quote Funnel", "Responsive Design", "Conversion Optimization"], liveUrl: "https://americandreamautoprotect.com/", githubUrl: "",
    featured: true, status: "published", completionDate: "", metaTitle: "American Dream Auto Protect case study",
    metaDescription: "Vehicle protection and quote-generation platform by LB CodeBase.", sortOrder: 3, deletedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z", updatedAt: "2026-09-03T00:00:00.000Z",
  },
  {
    id: "project-pedro-clavero", title: "Pedro Clavero Design", slug: "pedro-clavero-design",
    shortDescription: "Luxury weddings and events portfolio shaped around visual storytelling, service discovery, and elegant inquiries.",
    fullDescription: "<p>A cinematic portfolio experience for a luxury wedding, fashion, and event-design studio.</p>",
    thumbnail: "/images/pedroclavero.com.png", gallery: [], category: "Web",
    technologies: ["Luxury Branding", "Editorial UI", "Event Portfolio", "Responsive Design"], liveUrl: "https://pedroclavero.com/", githubUrl: "",
    featured: true, status: "published", completionDate: "", metaTitle: "Pedro Clavero Design case study",
    metaDescription: "Luxury wedding and event design portfolio by LB CodeBase.", sortOrder: 4, deletedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z", updatedAt: "2026-09-03T00:00:00.000Z",
  },
  {
    id: "project-zeroma",
    title: "zeroma.pk",
    slug: "zeroma-pk",
    shortDescription: "A high-performance marketplace redefining the shopping experience.",
    fullDescription:
      "<p>Zeroma required a high-performance marketplace that would redefine the shopping experience while keeping vendor operations simple and fast.</p><p>We engineered a headless commerce frontend with careful caching, conversion-focused interaction design, and a scalable content model.</p>",
    thumbnail: fallbackImage("zeroma", "1200/800"),
    gallery: [fallbackImage("zeroma-gallery-1", "1200/800"), fallbackImage("zeroma-gallery-2", "1200/800")],
    category: "E-commerce",
    technologies: ["React", "Shopify", "Tailwind CSS", "Node.js"],
    liveUrl: "https://zeroma.pk",
    githubUrl: "",
    featured: true,
    status: "published",
    completionDate: "2024-10-15",
    metaTitle: "zeroma.pk case study",
    metaDescription: "Headless commerce and marketplace engineering case study.",
    sortOrder: 5,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "project-mobixa",
    title: "mobixa.pk",
    slug: "mobixa-pk",
    shortDescription: "Premium electronics storefront with seamless mobile shopping.",
    fullDescription:
      "<p>Mobixa needed a sharp, conversion-oriented commerce experience for customers shopping across devices.</p><p>The final build emphasized fast product discovery, responsive checkout journeys, and polished visual hierarchy.</p>",
    thumbnail: fallbackImage("mobixa", "1200/800"),
    gallery: [fallbackImage("mobixa-gallery-1", "1200/800")],
    category: "E-commerce",
    technologies: ["React", "Express", "Tailwind CSS", "Analytics"],
    liveUrl: "https://mobixa.pk",
    githubUrl: "",
    featured: true,
    status: "published",
    completionDate: "2024-08-18",
    metaTitle: "mobixa.pk case study",
    metaDescription: "Electronics e-commerce experience by LB CodeBase.",
    sortOrder: 6,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "project-jugo",
    title: "jugo.pk",
    slug: "jugo-pk",
    shortDescription: "Clean, modern digital identity for a health-focused beverage brand.",
    fullDescription:
      "<p>Jugo's digital presence needed a brand system that felt energetic, refined, and trustworthy.</p><p>We paired a compact marketing site with polished product storytelling and mobile-first visual rhythm.</p>",
    thumbnail: fallbackImage("jugo", "1200/800"),
    gallery: [fallbackImage("jugo-gallery-1", "1200/800")],
    category: "Custom",
    technologies: ["Brand Systems", "React", "Motion"],
    liveUrl: "https://jugo.pk",
    githubUrl: "",
    featured: true,
    status: "published",
    completionDate: "2024-06-21",
    metaTitle: "jugo.pk case study",
    metaDescription: "Brand and website case study for Jugo.",
    sortOrder: 7,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "project-sparkalads",
    title: "sparkalads.com",
    slug: "sparkalads-com",
    shortDescription: "Dynamic portfolio and lead-generation engine for a marketing agency.",
    fullDescription:
      "<p>Sparkalads needed a visual system that could communicate momentum, authority, and measurable marketing outcomes.</p><p>We delivered a fast, animated agency platform designed around proof, clarity, and conversion.</p>",
    thumbnail: fallbackImage("spark", "1200/800"),
    gallery: [fallbackImage("spark-gallery-1", "1200/800")],
    category: "Web",
    technologies: ["React", "GSAP", "Three.js", "SEO"],
    liveUrl: "https://sparkalads.com",
    githubUrl: "",
    featured: true,
    status: "published",
    completionDate: "2024-04-05",
    metaTitle: "sparkalads.com case study",
    metaDescription: "Marketing agency website by LB CodeBase.",
    sortOrder: 8,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
];

const seedTeam: TeamMember[] = [
  {
    id: "team-wajid",
    slug: "wajid-hussain",
    name: "Wajid Hussain",
    role: "Automation Expert and Consultant",
    bio: "Automation expert and consultant shaping efficient digital systems, commerce strategy, and technical delivery.",
    avatar: "/lbt/Wajid Hussain.png",
    email: "wajidhussain.dev@gmail.com",
    phone: "03489077329",
    accentColor: "#3D5AFE",
    skills: ["Automation Strategy", "Technical Consulting", "Commerce Systems", "Architecture"],
    socialLinks: { github: "#", linkedin: "#", twitter: "#" },
    active: true,
    displayOrder: 1,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "team-mohsin",
    slug: "mohsin-bilal",
    name: "Mohsin Bilal",
    role: "Graphics Designer",
    bio: "Graphics designer shaping brand systems, product visuals, and digital art direction.",
    avatar: "/lbt/Mohsin.png",
    email: "mohsinbilal.dev@gmail.com",
    phone: "03425124134",
    accentColor: "#FF5C7A",
    skills: ["Graphic Design", "Brand Systems", "Visual Direction", "Product Visuals"],
    socialLinks: { linkedin: "#", twitter: "#" },
    active: true,
    displayOrder: 2,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "team-laiba",
    slug: "laiba-sahibzada",
    name: "Laiba Sahibzada",
    role: "Developer",
    bio: "Developer building responsive frontend experiences and high-performance digital products.",
    avatar: "/lbt/Laiba.png",
    email: "Laibakhan4455k@gmail.com",
    phone: "03429656779",
    accentColor: "#12B8A6",
    skills: ["Frontend Development", "React", "Responsive UI", "Performance"],
    socialLinks: { linkedin: "#" },
    active: true,
    displayOrder: 3,
    deletedAt: null,
    createdAt: "2026-04-22T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "team-ibad",
    slug: "ibad-ullah",
    name: "Ibad Ullah",
    role: "Lead UI/UX & Product Designer",
    tagline: "Designing high-converting digital products through user-centered UX, scalable design systems, intuitive interfaces, and conversion-focused experiences.",
    bio: "Lead UI/UX and product designer creating intuitive digital products, scalable design systems, and conversion-focused e-commerce experiences.",
    fullBio: "Ibad is LB CodeBase’ Lead UI/UX & Product Designer, with 4+ years of experience shaping digital products and conversion-optimized storefronts.",
    specialization: "Digital Product Design, E-Commerce UX & Conversion-Focused Design Systems",
    avatar: "/lbt/Ibdullah.png",
    email: "ibadullah2005h@icloud.com",
    phone: "03487047866",
    accentColor: "#F4B740",
    skills: ["UI/UX Design", "Product Design", "Product Strategy", "User Experience Strategy", "User Interface Design", "E-Commerce UX", "Conversion Rate Optimization (CRO)", "Design Systems", "User Journey Mapping", "Wireframing & Prototyping", "Responsive Web & Mobile Design", "Interaction Design", "Information Architecture", "UX Research", "Usability Optimization"],
    skillGroups: [
      { category: "Product Design", skills: ["UI/UX Design", "Product Design", "Product Strategy", "Product Discovery", "Design Thinking & Ideation", "User Experience Strategy", "User Interface Design", "User Journey Mapping", "Wireframing & Prototyping", "Interaction Design", "Information Architecture", "UX Research"] },
      { category: "Experience & Conversion", skills: ["E-Commerce UX", "Conversion Rate Optimization (CRO)", "Usability Optimization", "Customer Journey Optimization", "Landing Page Design", "E-Commerce Conversion Optimization", "User Flow Optimization", "Design Audits", "Heuristic Evaluation", "A/B Test Planning", "UX Problem Solving", "Data-Informed Design Decisions"] },
      { category: "Design Systems", skills: ["Scalable Design Systems", "Component Libraries", "Design Token Architecture", "Figma Component Architecture", "Visual Design & Brand Consistency", "Responsive Web & Mobile Design", "Accessibility & Responsive Design"] },
      { category: "Technical Knowledge", skills: ["Next.js", "React", "Modern Frontend Design Principles", "Developer Handoff", "Design-to-Development Workflow", "Responsive Implementation", "Component-Based UI Architecture", "Frontend Collaboration", "HTML & CSS Design Fluency", "UI Implementation QA"] },
    ],
    socialLinks: {},
    active: true,
    displayOrder: 4,
    deletedAt: null,
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
  },
];

const seedBlogs: BlogPost[] = [
  {
    id: "1713801600000",
    title: "Engineering for Velocity: Why Speed is a Feature",
    slug: "engineering-for-velocity-why-speed-is-a-feature",
    excerpt:
      "Speed isn't just about loading charts. It's about reducing friction between the user and their goals in a high-concurrency environment.",
    content:
      "<p>Speed is the most important feature of any digital product. Performance is not a layer we add at the end; it is a fundamental architectural requirement.</p><p>When we talk about speed, we are talking about trust. A slow interface is a signal of technical debt. A fast interface is a signal of authority.</p>",
    coverImage: fallbackImage("velocity", "800/500"),
    category: "Architecture",
    tags: ["Performance", "Architecture"],
    author: "Laiba Sahibzada",
    status: "published",
    publishedAt: "2026-04-18T00:00:00.000Z",
    readingTime: "8 min read",
    metaTitle: "Engineering for Velocity",
    metaDescription: "Why speed is a core product feature.",
    deletedAt: null,
    createdAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-18T00:00:00.000Z",
  },
  {
    id: "1713801600001",
    title: "The Aesthetic of Technical Authority",
    slug: "the-aesthetic-of-technical-authority",
    excerpt: "How code quality influences user trust through subtle micro-interactions and strict architectural integrity.",
    content:
      "<p>Design and engineering are the same discipline. Great design is the visual representation of great architecture.</p><p>We don't build websites to look pretty; we build them to command respect. This is the difference between a template and an engineered masterwork.</p>",
    coverImage: fallbackImage("aesthetic", "800/500"),
    category: "Philosophy",
    tags: ["Design", "Engineering"],
    author: "Wajid Hussain",
    status: "published",
    publishedAt: "2026-04-12T00:00:00.000Z",
    readingTime: "5 min read",
    metaTitle: "The Aesthetic of Technical Authority",
    metaDescription: "How engineering quality shapes brand trust.",
    deletedAt: null,
    createdAt: "2026-04-12T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];

const normalizeBlog = (blog: any, index: number): BlogPost => {
  const createdAt = blog.createdAt || blog.publishedAt || "2026-04-22T00:00:00.000Z";
  const content = blog.content?.includes("<") ? blog.content : String(blog.content || "").split("\n\n").map((p) => `<p>${p}</p>`).join("");
  return {
    id: String(blog.id || id()),
    title: blog.title || "Untitled Post",
    slug: blog.slug || slugify(blog.title || `post-${index + 1}`),
    excerpt: blog.excerpt || excerptFromContent(content),
    content,
    coverImage: blog.coverImage || blog.image || fallbackImage(`blog-${index}`, "800/500"),
    category: blog.category || "Development",
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    author: blog.author || "Senior Partner",
    status: blog.status || "published",
    publishedAt: blog.publishedAt || createdAt,
    readingTime: blog.readingTime || blog.time || calculateReadingTime(content),
    metaTitle: blog.metaTitle || blog.title || "Untitled Post",
    metaDescription: blog.metaDescription || blog.excerpt || excerptFromContent(content, 160),
    deletedAt: blog.deletedAt || null,
    createdAt,
    updatedAt: blog.updatedAt || createdAt,
  };
};

const stringList = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];

const normalizeProject = (project: any, index: number): Project => {
  const createdAt = project.createdAt || "2026-04-22T00:00:00.000Z";
  return {
    ...project,
    id: String(project.id || `project-${index + 1}`),
    title: String(project.title || "Untitled Project"),
    slug: project.slug || slugify(project.title || `project-${index + 1}`),
    shortDescription: String(project.shortDescription || project.description || ""),
    fullDescription: String(project.fullDescription || ""),
    thumbnail: String(project.thumbnail || project.image || ""),
    gallery: stringList(project.gallery),
    category: String(project.category || "Other"),
    technologies: stringList(project.technologies),
    liveUrl: String(project.liveUrl || ""),
    githubUrl: String(project.githubUrl || ""),
    featured: Boolean(project.featured),
    status: project.status || "published",
    completionDate: String(project.completionDate || ""),
    metaTitle: String(project.metaTitle || project.title || ""),
    metaDescription: String(project.metaDescription || project.shortDescription || project.description || ""),
    sortOrder: Number(project.sortOrder || index + 1),
    memberId: String(project.memberId || ""),
    memberRole: String(project.memberRole || ""),
    contributors: Array.isArray(project.contributors)
      ? project.contributors
          .map((contributor: any) => ({ memberId: String(contributor.memberId || ""), role: String(contributor.role || "") }))
          .filter((contributor: any) => contributor.memberId && contributor.role)
      : project.memberId
        ? [{ memberId: String(project.memberId), role: String(project.memberRole || "Contributor") }]
        : [],
    client: String(project.client || ""),
    industry: String(project.industry || ""),
    problem: String(project.problem || ""),
    challenge: String(project.challenge || ""),
    solution: String(project.solution || ""),
    process: stringList(project.process),
    results: stringList(project.results),
    achievements: stringList(project.achievements),
    deletedAt: project.deletedAt || null,
    createdAt,
    updatedAt: project.updatedAt || createdAt,
  };
};

const normalizeTeamMember = (member: any, index: number): TeamMember => {
  const memberId = String(member.id || `team-${index + 1}`);
  const createdAt = member.createdAt || "2026-04-22T00:00:00.000Z";
  const socialLinks = member.socialLinks && typeof member.socialLinks === "object" ? member.socialLinks : {};
  return {
    ...member,
    id: memberId,
    slug: member.slug || slugify(member.name || memberId),
    name: String(member.name || "Unnamed Member"),
    role: String(member.role || "Team Member"),
    bio: String(member.bio || ""),
    fullBio: String(member.fullBio || member.bio || ""),
    specialization: String(member.specialization || ""),
    tagline: String(member.tagline || ""),
    avatar: String(member.avatar || member.img || ""),
    coverImage: String(member.coverImage || ""),
    email: String(member.email || ""),
    phone: String(member.phone || ""),
    location: String(member.location || ""),
    availability: String(member.availability || ""),
    yearsExperience: String(member.yearsExperience || ""),
    languages: stringList(member.languages),
    cvUrl: String(member.cvUrl || ""),
    accentColor: String(member.accentColor || "#3D5AFE"),
    skills: stringList(member.skills),
    skillGroups: Array.isArray(member.skillGroups)
      ? member.skillGroups
          .map((group: any) => ({ category: String(group.category || "Skills"), skills: stringList(group.skills) }))
          .filter((group: any) => group.skills.length)
      : [],
    experience: Array.isArray(member.experience)
      ? member.experience.map((item: any, itemIndex: number) => ({
          ...item,
          id: String(item.id || `${memberId}-experience-${itemIndex + 1}`),
          company: String(item.company || ""),
          position: String(item.position || ""),
          startDate: String(item.startDate || ""),
          endDate: String(item.endDate || ""),
          current: Boolean(item.current),
          description: String(item.description || ""),
          responsibilities: stringList(item.responsibilities),
          achievements: stringList(item.achievements),
          technologies: stringList(item.technologies),
        }))
      : [],
    education: Array.isArray(member.education)
      ? member.education.map((item: any, itemIndex: number) => ({
          ...item,
          id: String(item.id || `${memberId}-education-${itemIndex + 1}`),
          institution: String(item.institution || ""),
          degree: String(item.degree || ""),
          field: String(item.field || ""),
          startDate: String(item.startDate || ""),
          endDate: String(item.endDate || ""),
          description: String(item.description || ""),
          achievements: stringList(item.achievements),
        }))
      : [],
    certifications: Array.isArray(member.certifications)
      ? member.certifications.map((item: any, itemIndex: number) => ({
          ...item,
          id: String(item.id || `${memberId}-certification-${itemIndex + 1}`),
          title: String(item.title || ""),
          organization: String(item.organization || ""),
          type: String(item.type || "Certification"),
          issueDate: String(item.issueDate || ""),
          credentialId: String(item.credentialId || ""),
          credentialUrl: String(item.credentialUrl || ""),
          image: String(item.image || ""),
        }))
      : [],
    testimonials: Array.isArray(member.testimonials)
      ? member.testimonials.map((t: any, tIndex: number) => ({
          ...t,
          id: String(t.id || `${memberId}-testimonial-${tIndex + 1}`),
          quote: String(t.quote || ""),
          author: String(t.author || ""),
          role: String(t.role || ""),
          company: String(t.company || ""),
          project: String(t.project || ""),
          avatar: String(t.avatar || ""),
        }))
      : [],
    socialLinks: {
      linkedin: String(socialLinks.linkedin || ""),
      github: String(socialLinks.github || ""),
      twitter: String(socialLinks.twitter || ""),
      behance: String(socialLinks.behance || ""),
      dribbble: String(socialLinks.dribbble || ""),
      instagram: String(socialLinks.instagram || ""),
      website: String(socialLinks.website || ""),
    },
    active: member.active !== false,
    displayOrder: Number(member.displayOrder || index + 1),
    deletedAt: member.deletedAt || null,
    createdAt,
    updatedAt: member.updatedAt || createdAt,
  };
};

const normalizeDB = (raw: Partial<DB> | any): DB => ({
  messages: Array.isArray(raw.messages) ? raw.messages : [],
  projects: (Array.isArray(raw.projects) && raw.projects.length > 0 ? raw.projects : seedProjects).map(normalizeProject),
  team: (Array.isArray(raw.team) && raw.team.length > 0 ? raw.team : seedTeam).map(normalizeTeamMember),
  blogs: Array.isArray(raw.blogs) && raw.blogs.length > 0 ? raw.blogs.map(normalizeBlog) : seedBlogs,
  activity: Array.isArray(raw.activity) ? raw.activity : [],
  views: raw.views && typeof raw.views.total === "number" ? raw.views : { total: 0 },
});

async function loadDB(): Promise<DB> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return normalizeDB(JSON.parse(data));
  } catch {
    return normalizeDB({});
  }
}

async function saveDB(db: DB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

const uniqueSlug = <T extends { id: string; slug: string }>(items: T[], desired: string, currentId?: string) => {
  const base = slugify(desired);
  let candidate = base;
  let suffix = 2;
  while (items.some((item) => item.id !== currentId && item.slug === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
};

const addActivity = (db: DB, label: string) => {
  db.activity.unshift({ id: id(), label, createdAt: nowIso() });
  db.activity = db.activity.slice(0, 50);
};

const publishDuePosts = (db: DB) => {
  const now = Date.now();
  let changed = false;
  db.blogs = db.blogs.map((post) => {
    if (post.status === "scheduled" && post.publishedAt && new Date(post.publishedAt).getTime() <= now) {
      changed = true;
      return { ...post, status: "published" as BlogStatus, updatedAt: nowIso() };
    }
    return post;
  });
  return changed;
};

const listPaginated = <T extends { id: string }>(items: T[], cursor?: string, limit = 20) => {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const startIndex = cursor ? Math.max(items.findIndex((item) => item.id === cursor) + 1, 0) : 0;
  const page = items.slice(startIndex, startIndex + safeLimit);
  return {
    items: page,
    nextCursor: startIndex + safeLimit < items.length ? page.at(-1)?.id || null : null,
    total: items.length,
  };
};

const publicProject = (project: Project) => ({
  ...project,
  image: project.thumbnail,
  description: project.shortDescription,
  date: project.completionDate ? dated(project.completionDate) : "",
});

const publicTeamMember = (member: TeamMember) => ({
  ...member,
  img: member.avatar,
});

const publicBlog = (post: BlogPost) => ({
  ...post,
  image: post.coverImage,
  date: dated(post.publishedAt || post.createdAt),
  time: post.readingTime,
});

const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || value === "#" || value.startsWith("/") || /^https?:\/\//i.test(value), "Unsafe URL");
const safeImage = z
  .string()
  .trim()
  .max(20_000_000)
  .refine(
    (value) => !value || value.startsWith("/") || /^https?:\/\//i.test(value) || /^data:image\/(?:png|jpe?g|webp);base64,/i.test(value),
    "Unsupported image source",
  );
const safeDocumentUrl = z
  .string()
  .trim()
  .max(7_000_000)
  .refine(
    (value) => !value || value.startsWith("/") || /^https?:\/\//i.test(value) || /^data:application\/pdf;base64,/i.test(value),
    "Unsupported document source",
  );
const shortText = (max = 300) => z.string().trim().max(max);
const textList = z.array(z.string().trim().min(1).max(160)).max(50).default([]);

const experienceSchema = z.object({
  id: z.string().optional().default(""),
  company: shortText(160),
  position: shortText(160),
  startDate: shortText(30),
  endDate: shortText(30).optional().default(""),
  current: z.boolean().optional().default(false),
  description: shortText(3000).optional().default(""),
  responsibilities: textList,
  achievements: textList,
  technologies: textList,
});

const educationSchema = z.object({
  id: z.string().optional().default(""),
  institution: shortText(160),
  degree: shortText(160),
  field: shortText(160).optional().default(""),
  startDate: shortText(30).optional().default(""),
  endDate: shortText(30).optional().default(""),
  description: shortText(3000).optional().default(""),
  achievements: textList,
});

const certificationSchema = z.object({
  id: z.string().optional().default(""),
  title: shortText(200),
  organization: shortText(160).optional().default(""),
  type: shortText(80).optional().default("Certification"),
  issueDate: shortText(30).optional().default(""),
  credentialId: shortText(160).optional().default(""),
  credentialUrl: safeUrl.optional().default(""),
  image: safeImage.optional().default(""),
});

const projectSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: shortText(180).optional(),
  shortDescription: z.string().trim().min(1).max(280),
  fullDescription: z.string().min(1).max(50_000),
  thumbnail: safeImage.refine(Boolean, "Thumbnail is required"),
  gallery: z.array(safeImage).max(20).default([]),
  category: z.string().trim().min(1).max(80),
  technologies: textList,
  liveUrl: safeUrl.optional().default(""),
  githubUrl: safeUrl.optional().default(""),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  completionDate: shortText(30).optional().default(""),
  metaTitle: shortText(180).optional().default(""),
  metaDescription: shortText(320).optional().default(""),
  sortOrder: z.number().optional(),
  memberId: shortText(100).optional().default(""),
  memberRole: shortText(180).optional().default(""),
  contributors: z.array(z.object({ memberId: z.string().trim().min(1).max(100), role: z.string().trim().min(1).max(180) })).max(30).default([]),
  client: shortText(180).optional().default(""),
  industry: shortText(180).optional().default(""),
  problem: shortText(5000).optional().default(""),
  challenge: shortText(5000).optional().default(""),
  solution: shortText(10_000).optional().default(""),
  process: textList,
  results: textList,
  achievements: textList,
});

const testimonialSchema = z.object({
  id: z.string().optional().default(""),
  quote: shortText(2000),
  author: shortText(160),
  role: shortText(160),
  company: shortText(160).optional().default(""),
  project: shortText(160).optional().default(""),
  avatar: safeImage.optional().default(""),
});

const teamSchema = z.object({
  slug: shortText(180).optional(),
  name: z.string().trim().min(1).max(160),
  role: z.string().trim().min(1).max(160),
  bio: z.string().trim().min(1).max(500),
  fullBio: shortText(10_000).optional().default(""),
  specialization: shortText(240).optional().default(""),
  tagline: shortText(240).optional().default(""),
  avatar: safeImage.refine(Boolean, "Profile image is required"),
  coverImage: safeImage.optional().default(""),
  email: z.union([z.literal(""), z.email()]).optional().default(""),
  location: shortText(180).optional().default(""),
  availability: shortText(180).optional().default(""),
  yearsExperience: shortText(80).optional().default(""),
  languages: textList,
  cvUrl: safeDocumentUrl.optional().default(""),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#3D5AFE"),
  skills: textList,
  skillGroups: z.array(z.object({ category: z.string().trim().min(1).max(120), skills: textList })).max(20).default([]),
  experience: z.array(experienceSchema).max(30).default([]),
  education: z.array(educationSchema).max(20).default([]),
  certifications: z.array(certificationSchema).max(40).default([]),
  testimonials: z.array(testimonialSchema).max(20).default([]),
  socialLinks: z
    .object({
      linkedin: safeUrl.optional().default(""),
      github: safeUrl.optional().default(""),
      twitter: safeUrl.optional().default(""),
      behance: safeUrl.optional().default(""),
      dribbble: safeUrl.optional().default(""),
      instagram: safeUrl.optional().default(""),
      website: safeUrl.optional().default(""),
    })
    .default({ linkedin: "", github: "", twitter: "", behance: "", dribbble: "", instagram: "", website: "" }),
  active: z.boolean().default(true),
  displayOrder: z.number().optional(),
});

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional().default(""),
  content: z.string().min(1),
  coverImage: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  publishedAt: z.string().optional().default(""),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
});

const messageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10).max(5000),
  memberId: z.string().trim().max(100).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (scope: string, max: number, windowMs: number) => (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateBuckets) if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
  }
  const key = `${scope}:${req.ip || req.socket.remoteAddress || "unknown"}`;
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (current.count >= max) {
    res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  current.count += 1;
  return next();
};

const escapeXml = (value: string) =>
  value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character] || character);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const isProduction = process.env.NODE_ENV === "production";
  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self'${isProduction ? "" : " 'unsafe-inline'"}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "media-src 'self' blob: https:",
    "connect-src 'self' https: ws: wss:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(compression({
    threshold: 1024,
    filter: (req, res) => (
      !req.headers.range
      && !res.getHeader("Content-Range")
      && compression.filter(req, res)
    ),
  }));
  app.use((_req, res, next) => {
    res.set({
      "Content-Security-Policy": contentSecurityPolicy,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    if (process.env.NODE_ENV === "production") res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
  const databaseConfig = databaseConfigFromEnv();
  let postgres = databaseConfig ? createDatabase(databaseConfig) : null;
  if (postgres) {
    try {
      const result = await sql<{ users_table: string | null }>`select to_regclass('app.users')::text as users_table`.execute(postgres);
      if (!result.rows[0]?.users_table) throw new Error("The app.users table is missing. Run npm run db:setup.");
      process.stdout.write(`${JSON.stringify({ level: "info", event: "postgres_ready" })}\n`);
    } catch (error) {
      process.stderr.write(`${JSON.stringify({ level: "error", event: "postgres_startup_check_failed", message: error instanceof Error ? error.message : String(error) })}\n`);
      await postgres.destroy();
      postgres = null;
      if (isProduction) throw new Error("PostgreSQL is unavailable or not initialized.");
    }
  } else {
    process.stderr.write(`${JSON.stringify({ level: "warn", event: "postgres_not_configured" })}\n`);
  }
  if (isProduction && !postgres) throw new Error("PostgreSQL is required in production.");
  if (process.env.NODE_ENV === "production" && !process.env.IP_HASH_SALT) throw new Error("IP_HASH_SALT is required in production.");
  app.use("/api/v2", postgres ? createV2Router(postgres) : createUnavailableV2Router());

  const uploadRoot = localUploadRoot();
  await fs.mkdir(uploadRoot, { recursive: true });
  app.use("/uploads", express.static(uploadRoot, {
    dotfiles: "deny",
    index: false,
    immutable: true,
    maxAge: "1y",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    },
  }));
  app.use("/uploads", (_req, res) => res.status(404).json({ success: false, error: { code: "MEDIA_NOT_FOUND", message: "Media asset not found." } }));

  const mysqlConfig = mysqlConfigFromEnv();
  let mysql = mysqlConfig ? createMysqlDatabase(mysqlConfig) : null;
  let v3Store = mysql ? new MysqlV3Store(mysql) : null;
  if (v3Store) {
    try {
      await v3Store.ping();
      await sql`SELECT id FROM users LIMIT 0`.execute(mysql!);
      process.stdout.write(`${JSON.stringify({ level: "info", event: "mysql_v3_ready" })}\n`);
    } catch (error) {
      process.stderr.write(`${JSON.stringify({ level: "error", event: "mysql_v3_startup_check_failed", message: error instanceof Error ? error.message : String(error) })}\n`);
      await mysql?.destroy();
      mysql = null;
      v3Store = null;
    }
  } else {
    process.stderr.write(`${JSON.stringify({ level: "warn", event: "mysql_v3_not_configured" })}\n`);
  }
  if (isProduction && process.env.API_V3_REQUIRED === "true" && !v3Store) throw new Error("MySQL API v3 is required but unavailable.");
  if (isProduction && process.env.API_V3_REQUIRED === "true" && !process.env.API_CURSOR_SECRET) throw new Error("API_CURSOR_SECRET is required when API v3 is required in production.");
  app.use("/api/v3", v3Store ? createV3Router(v3Store) : createUnavailableV3Router());

  app.use("/api/admin", (_req, res) => {
    res.status(410).json({ error: { code: "LEGACY_API_DISABLED", message: "Use /api/v2." } });
  });
  if (postgres) {
    app.use(["/api/messages", "/api/projects", "/api/team", "/api/blog", "/api/blogs"], (_req, res) => {
      res.status(410).json({ error: { code: "LEGACY_API_DISABLED", message: "Use /api/v2." } });
    });
  }
  app.use(express.json({ limit: "20mb" }));

  app.post("/api/messages", rateLimit("contact", 5, 10 * 60 * 1000), async (req, res) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    const { name, email, subject, message, memberId } = parsed.data;
    const db = await loadDB();
    const member = memberId ? db.team.find((item) => item.id === memberId && !item.deletedAt && item.active) : undefined;
    if (memberId && !member) return res.status(400).json({ error: "Selected team member is unavailable" });
    const newMessage: Message = {
      id: id(),
      name,
      email,
      subject,
      message,
      memberId: member?.id,
      memberSlug: member?.slug,
      memberName: member?.name,
      createdAt: nowIso(),
    };
    db.messages.push(newMessage);
    addActivity(db, `Message from ${name} received${member ? ` for ${member.name}` : ""}`);
    await saveDB(db);
    res.status(201).json({ id: newMessage.id, received: true });
  });

  app.get("/api/projects", async (req, res) => {
    const db = await loadDB();
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    const items = db.projects
      .filter((project) => !project.deletedAt && project.status === "published")
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
      .map(publicProject);
    res.json(listPaginated(items, String(req.query.cursor || ""), Number(req.query.limit || 20)));
  });

  app.get("/api/projects/:slug", async (req, res) => {
    const db = await loadDB();
    const project = db.projects.find((item) => !item.deletedAt && item.status === "published" && item.slug === req.params.slug);
    if (!project) return res.status(404).json({ error: "Not found" });
    db.views.total += 1;
    await saveDB(db);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json(publicProject(project));
  });

const generateVCard = (member: TeamMember, origin: string) => {
  const nameParts = member.name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.pop() : "";
  const firstName = nameParts.join(" ") || member.name;
  const portfolioUrl = `${origin}/team/${member.slug}`;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${member.name}`,
    `N:${lastName};${firstName};;;`,
    `ORG:LB CodeBase`,
    `TITLE:${member.role}`,
    member.email ? `EMAIL;TYPE=INTERNET,PREF:${member.email}` : "",
    member.location ? `ADR;TYPE=WORK:;;;${member.location};;;` : "",
    `URL:${portfolioUrl}`,
    member.tagline || member.bio ? `NOTE:${(member.tagline || member.bio).replace(/\r?\n/g, " ")}` : "",
    member.socialLinks?.linkedin ? `X-SOCIALPROFILE;type=linkedin:${member.socialLinks.linkedin}` : "",
    member.socialLinks?.github ? `X-SOCIALPROFILE;type=github:${member.socialLinks.github}` : "",
    "END:VCARD",
  ].filter(Boolean);

  return lines.join("\r\n");
};

  app.get("/api/team", async (req, res) => {
    const db = await loadDB();
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    let items = db.team
      .filter((member) => !member.deletedAt && member.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const query = typeof req.query.search === "string" ? req.query.search.toLowerCase().trim() : "";
    if (query) {
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query) ||
          m.skills.some((s) => s.toLowerCase().includes(query)) ||
          (m.specialization && m.specialization.toLowerCase().includes(query)),
      );
    }

    const skillQuery = typeof req.query.skill === "string" ? req.query.skill.toLowerCase().trim() : "";
    if (skillQuery) {
      items = items.filter((m) => m.skills.some((s) => s.toLowerCase().includes(skillQuery)));
    }

    res.json({
      items: items.map(publicTeamMember),
      total: items.length,
    });
  });

  app.get("/api/team/:slug/vcard", async (req, res) => {
    const db = await loadDB();
    const member = db.team.find((item) => !item.deletedAt && item.active && item.slug === req.params.slug);
    if (!member) return res.status(404).json({ error: "Team member not found" });
    const origin = (process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const vcard = generateVCard(member, origin);
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${member.slug}.vcf"`);
    res.send(vcard);
  });

  app.get("/api/team/:slug", async (req, res) => {
    const db = await loadDB();
    const member = db.team.find((item) => !item.deletedAt && item.active && item.slug === req.params.slug);
    if (!member) return res.status(404).json({ error: "Team member not found" });
    const projects = db.projects
      .filter(
        (project) =>
          !project.deletedAt &&
          project.status === "published" &&
          (project.memberId === member.id || project.contributors?.some((contributor) => contributor.memberId === member.id)),
      )
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
      .map((project) => ({
        ...publicProject(project),
        memberRole: project.contributors?.find((contributor) => contributor.memberId === member.id)?.role || project.memberRole,
      }));
    const stats = {
      projectsCount: projects.length,
      skillsCount: member.skills?.length || 0,
      experienceCount: member.experience?.length || 0,
      certificationsCount: member.certifications?.length || 0,
    };
    db.views.total += 1;
    await saveDB(db);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json({ ...publicTeamMember(member), projects, stats });
  });

  app.get("/api/team/:memberSlug/projects/:projectSlug", async (req, res) => {
    const db = await loadDB();
    const member = db.team.find((item) => !item.deletedAt && item.active && item.slug === req.params.memberSlug);
    if (!member) return res.status(404).json({ error: "Team member not found" });
    const project = db.projects.find(
      (item) =>
        !item.deletedAt &&
        item.status === "published" &&
        (item.memberId === member.id || item.contributors?.some((contributor) => contributor.memberId === member.id)) &&
        item.slug === req.params.projectSlug,
    );
    if (!project) return res.status(404).json({ error: "Member project not found" });
    const related = db.projects
      .filter(
        (item) =>
          !item.deletedAt &&
          item.status === "published" &&
          (item.memberId === member.id || item.contributors?.some((contributor) => contributor.memberId === member.id)) &&
          item.id !== project.id,
      )
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
      .slice(0, 3)
      .map((item) => ({
        ...publicProject(item),
        memberRole: item.contributors?.find((contributor) => contributor.memberId === member.id)?.role || item.memberRole,
      }));
    db.views.total += 1;
    await saveDB(db);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json({
      project: {
        ...publicProject(project),
        memberRole: project.contributors?.find((contributor) => contributor.memberId === member.id)?.role || project.memberRole,
      },
      member: publicTeamMember(member),
      related,
    });
  });

  app.get(["/api/blog", "/api/blogs"], async (req, res) => {
    const db = await loadDB();
    if (publishDuePosts(db)) await saveDB(db);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    const items = db.blogs
      .filter((post) => !post.deletedAt && post.status === "published")
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      .map(publicBlog);
    if (req.path === "/api/blogs") return res.json(items);
    return res.json(listPaginated(items, String(req.query.cursor || ""), Number(req.query.limit || 20)));
  });

  app.get("/api/blog/:slug", async (req, res) => {
    const db = await loadDB();
    if (publishDuePosts(db)) await saveDB(db);
    const post = db.blogs.find((item) => !item.deletedAt && item.status === "published" && item.slug === req.params.slug);
    if (!post) return res.status(404).json({ error: "Not found" });
    db.views.total += 1;
    await saveDB(db);
    const related = db.blogs
      .filter((item) => !item.deletedAt && item.status === "published" && item.id !== post.id && item.category === post.category)
      .slice(0, 3)
      .map(publicBlog);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json({ ...publicBlog(post), related });
  });

  app.get("/sitemap.xml", async (req, res) => {
    const baseUrl = (process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const staticPaths = ["", "/about", "/services", "/portfolio", "/blog", "/contact"];
    const urls = staticPaths.map((route) => `${baseUrl}${route}`);
    if (postgres) {
      const [members, projects, blogs, memberProjects] = await Promise.all([
        postgres.selectFrom("team_members").select(["id", "slug"]).where("deleted_at", "is", null).where("active", "=", true).execute(),
        postgres.selectFrom("projects").select(["id", "slug"]).where("deleted_at", "is", null).where("status", "=", "published").execute(),
        postgres.selectFrom("blog_posts").select("slug").where("deleted_at", "is", null).where("status", "=", "published").execute(),
        postgres.selectFrom("project_team_members").select(["project_id", "team_member_id"]).execute(),
      ]);
      for (const project of projects) urls.push(`${baseUrl}/portfolio/${project.slug}`);
      for (const post of blogs) urls.push(`${baseUrl}/blog/${post.slug}`);
      for (const member of members) {
        urls.push(`${baseUrl}/team/${member.slug}`);
        for (const relation of memberProjects.filter((item) => item.team_member_id === member.id)) {
          const project = projects.find((item) => item.id === relation.project_id);
          if (project) urls.push(`${baseUrl}/team/${member.slug}/projects/${project.slug}`);
        }
      }
    } else {
      const db = await loadDB();
      for (const member of db.team.filter((item) => !item.deletedAt && item.active)) {
        urls.push(`${baseUrl}/team/${member.slug}`);
        for (const project of db.projects.filter(
          (item) => !item.deletedAt && item.status === "published" && (item.memberId === member.id || item.contributors?.some((contributor) => contributor.memberId === member.id)),
        )) urls.push(`${baseUrl}/team/${member.slug}/projects/${project.slug}`);
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
      .join("\n")}\n</urlset>`;
    res.type("application/xml").set("Cache-Control", "public, max-age=3600").send(xml);
  });

  const authenticateAdminPage = postgres ? authenticate(postgres) : null;
  app.use("/admin", (req, res, next) => {
    if (/^\/login\/?$/.test(req.path)) return next();
    if (!authenticateAdminPage) return res.redirect(302, "/admin/login");
    return authenticateAdminPage(req, res, (error?: unknown) => {
      if (error) return res.redirect(302, "/admin/login");
      return next();
    });
  });

  if (process.env.NODE_ENV !== "production" && process.env.SERVE_STATIC !== "true") {
    const vite = await createViteServer({
      configLoader: "runner",
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        const normalizedPath = filePath.replace(/\\/g, "/");
        if (normalizedPath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (normalizedPath.endsWith("/index.html") || normalizedPath.endsWith("/sw.js")) {
          res.setHeader("Cache-Control", "no-cache");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
        }
      },
    }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
