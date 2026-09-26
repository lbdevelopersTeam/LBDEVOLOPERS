import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { V3ApiError } from './http';

const boundedText = (max: number) => z.string().trim().max(max);
const slug = z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const httpUrl = z.url().max(2048).refine((value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, 'URL must use HTTP or HTTPS.');
const relativeUrl = z.string().regex(/^\/(?!\/).{1,2047}$/, 'Relative URLs must begin with one slash.');
const nullableUrl = z.union([z.literal(''), httpUrl, relativeUrl, z.null()]).transform((value) => value || null);
const richText = z.string().max(100_000).transform((value) => sanitizeHtml(value, {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }, true) },
}));
const technologies = z.array(boundedText(160).min(1)).max(40).transform((values) => [...new Set(values)]);

export const v3LoginInput = z.object({
  username: z.string().trim().min(3).max(64).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(200),
}).strict();

export const v3ProjectCreateInput = z.object({
  title: boundedText(240).min(1),
  slug: slug.optional(),
  summary: boundedText(500).default(''),
  descriptionHtml: richText.default(''),
  category: boundedText(120).default('Web'),
  thumbnailUrl: nullableUrl.default(null),
  liveUrl: nullableUrl.default(null),
  repositoryUrl: nullableUrl.default(null),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sortOrder: z.number().int().min(0).max(1_000_000).default(0),
  technologies: technologies.default([]),
}).strict();

export const v3ProjectPatchInput = z.object({
  title: boundedText(240).min(1).optional(),
  slug: slug.optional(),
  summary: boundedText(500).optional(),
  descriptionHtml: richText.optional(),
  category: boundedText(120).optional(),
  thumbnailUrl: nullableUrl.optional(),
  liveUrl: nullableUrl.optional(),
  repositoryUrl: nullableUrl.optional(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  technologies: technologies.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field must be supplied.');

export const v3ContactInput = z.object({
  name: boundedText(120).min(2),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  subject: boundedText(160).min(1),
  message: boundedText(5000).min(10),
  website: z.string().max(0).optional().default(''),
}).strict();

export const v3ProjectListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(500).optional(),
  category: boundedText(120).optional(),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
}).strict();

export const v3ResourceId = z.string().trim().min(1).max(36).regex(/^[A-Za-z0-9-]+$/);

export type V3ProjectCreate = z.infer<typeof v3ProjectCreateInput>;
export type V3ProjectPatch = z.infer<typeof v3ProjectPatchInput>;
export type V3Contact = z.infer<typeof v3ContactInput>;

export function validateV3<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fields: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_root';
    (fields[key] ||= []).push(issue.message);
  }
  throw new V3ApiError(422, 'VALIDATION_FAILED', 'Validation failed.', fields);
}

export const slugifyV3 = (value: string) => value.toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180) || 'item';
