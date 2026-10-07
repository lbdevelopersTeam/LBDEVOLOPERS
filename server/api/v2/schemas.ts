import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { ApiError } from './http';

const text = (max: number) => z.string().trim().max(max);
const httpUrl = z.url().max(2048).refine((value) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}, 'URL must use HTTP or HTTPS.');
const optionalUrl = z.union([z.literal(''), httpUrl, z.string().regex(/^\/(?!\/).{1,2047}$/)]).default('');
const slug = z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const username = z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'Username may contain letters, numbers, hyphens, and underscores.');
const stringList = z.array(z.string().trim().min(1).max(200)).max(100).default([]);
const richText = z.string().max(100_000).transform((value) => sanitizeHtml(value, {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }, true) },
}));

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(200).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(200),
}).strict();

export const projectInput = z.object({
  title: text(240).min(1), slug: slug.optional(), shortDescription: text(500).default(''), fullDescription: richText.default(''),
  thumbnail: optionalUrl, thumbnailMediaId: text(100).nullable().optional(), gallery: z.array(optionalUrl).max(30).default([]), galleryMediaIds: z.array(text(100)).max(30).default([]),
  category: text(120).default('Web'), technologies: stringList, liveUrl: optionalUrl, githubUrl: optionalUrl,
  featured: z.boolean().default(false), status: z.enum(['draft', 'published', 'archived']).default('published'), completionDate: z.union([z.literal(''), z.iso.date()]).default(''),
  metaTitle: text(240).default(''), metaDescription: text(500).default(''), sortOrder: z.number().int().min(0).max(100000).default(0),
  memberId: text(100).default(''), memberRole: text(240).default(''), contributors: z.array(z.object({ memberId: text(100).min(1), role: text(240).min(1) })).max(50).default([]),
  client: text(200).default(''), industry: text(200).default(''), problem: text(10_000).default(''), challenge: text(10_000).default(''), solution: text(10_000).default(''),
  process: stringList, results: stringList, achievements: stringList, version: z.number().int().positive().optional(),
}).strict();

const socialLinks = z.object({ linkedin: optionalUrl, github: optionalUrl, twitter: optionalUrl, behance: optionalUrl, dribbble: optionalUrl, instagram: optionalUrl, website: optionalUrl }).partial().default({});
const experience = z.array(z.object({ id: text(100).optional(), company: text(200), position: text(200), startDate: text(50), endDate: text(50).default(''), current: z.boolean().default(false), description: text(5000).default(''), responsibilities: stringList, achievements: stringList, technologies: stringList })).max(50).default([]);
const education = z.array(z.object({ id: text(100).optional(), institution: text(240), degree: text(200), field: text(200).default(''), startDate: text(50).default(''), endDate: text(50).default(''), description: text(5000).default(''), achievements: stringList })).max(30).default([]);
const certifications = z.array(z.object({ id: text(100).optional(), title: text(240), organization: text(200).default(''), type: text(120).default('Certification'), issueDate: text(50).default(''), credentialUrl: optionalUrl, credentialId: text(160).default(''), image: optionalUrl })).max(50).default([]);

export const teamInput = z.object({
  name: text(160).min(1), slug: slug.optional(), role: text(180).min(1), tagline: text(500).default(''), bio: text(5000).default(''), fullBio: text(20_000).default(''), specialization: text(300).default(''),
  avatar: optionalUrl, coverImage: optionalUrl, email: z.union([z.literal(''), z.email().max(254)]).default(''), phone: text(30).default(''), location: text(240).default(''), availability: text(240).default(''), yearsExperience: text(80).default(''),
  languages: stringList, cvUrl: optionalUrl, accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3D5AFE'), skills: stringList,
  skillGroups: z.array(z.object({ category: text(120).min(1), skills: stringList })).max(40).default([]), experience, education, certifications, socialLinks,
  active: z.boolean().default(true), displayOrder: z.number().int().min(0).max(100000).default(0),
  avatarMediaId: text(100).nullable().optional(), coverMediaId: text(100).nullable().optional(), cvMediaId: text(100).nullable().optional(),
}).strict();

export const blogInput = z.object({
  title: text(240).min(1), slug: slug.optional(), excerpt: text(500).default(''), content: richText.pipe(z.string().min(1)), coverImage: optionalUrl,
  coverMediaId: text(100).nullable().optional(), category: text(120).default('Development'), tags: stringList, author: text(160).min(1), authorTeamMemberId: text(100).nullable().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'), publishedAt: z.union([z.literal(''), z.iso.datetime({ offset: true })]).default(''), liveUrl: optionalUrl,
  metaTitle: text(240).default(''), metaDescription: text(500).default(''), sortOrder: z.number().int().min(0).max(100000).default(0), version: z.number().int().positive().optional(),
}).strict();

export const serviceInput = z.object({
  title: text(200).min(1), slug: slug.optional(), shortDescription: text(500).default(''), description: richText.default(''), image: optionalUrl,
  features: stringList,
  mediaId: text(100).nullable().optional(), icon: text(80).default(''), featured: z.boolean().default(false), active: z.boolean().default(true), displayOrder: z.number().int().min(0).max(100000).default(0),
  metaTitle: text(240).default(''), metaDescription: text(500).default(''),
}).strict();

export const technologyInput = z.object({ name: text(160).min(1), slug: slug.optional(), category: text(120).default('Technology'), iconUrl: optionalUrl, proficiency: text(120).default(''), description: text(500).default('') }).strict();
export const skillInput = z.object({ name: text(160).min(1), slug: slug.optional(), category: text(120).default('General') }).strict();

export const testimonialInput = z.object({
  quote: text(4000).min(10), author: text(160).min(1), role: text(160).default(''), company: text(200).default(''), project: text(200).default(''), avatar: optionalUrl,
  teamMemberId: text(100).nullable().optional(), serviceId: text(100).nullable().optional(), avatarMediaId: text(100).nullable().optional(),
  featured: z.boolean().default(false), active: z.boolean().default(true), displayOrder: z.number().int().min(0).max(100000).default(0),
}).strict();

export const messageInput = z.object({
  name: text(120).min(2), email: z.email().max(254), subject: text(160).min(1), message: text(5000).min(10), memberId: text(100).optional().default(''), website: z.string().max(0).optional().default(''),
}).strict();

export const userInput = z.object({
  username, email: z.email().max(254).transform((value) => value.toLowerCase()), displayName: text(120).min(1), password: z.string().min(12).max(200), role: z.enum(['super_admin', 'admin', 'editor', 'team_member']), teamMemberId: text(100).nullable().optional(), isActive: z.boolean().default(true),
}).strict().refine((value) => value.role !== 'team_member' || Boolean(value.teamMemberId), { message: 'A team-member account must be linked to a team profile.', path: ['teamMemberId'] });
export const userUpdateInput = z.object({
  username: username.optional(), email: z.email().max(254).transform((value) => value.toLowerCase()).optional(), displayName: text(120).min(1).optional(), password: z.string().min(12).max(200).optional(), role: z.enum(['super_admin', 'admin', 'editor', 'team_member']).optional(), teamMemberId: text(100).nullable().optional(), isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

export const settingInput = z.object({ value: z.json(), isPublic: z.boolean().default(false), description: text(500).default('') }).strict();

export function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_root';
      (fields[key] ||= []).push(issue.message);
    }
    throw new ApiError(422, 'VALIDATION_FAILED', 'Validation failed.', fields);
  }
  return result.data;
}

export const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180) || 'item';
