import 'dotenv/config';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sql } from 'kysely';
import { createDatabase, databaseConfigFromEnv } from './client';
import { hashPassword } from '../api/v2/security';
import { projectInput, teamInput, blogInput, serviceInput, slugify, validate } from '../api/v2/schemas';
import { updateBlog, updateProject, updateTeamMember } from '../api/v2/content-repository';
import type { JsonValue } from './types';

interface LegacyProject { id: string; [key: string]: unknown }
interface LegacyTeamMember { id: string; testimonials?: LegacyTestimonial[]; [key: string]: unknown }
interface LegacyBlog { id: string; [key: string]: unknown }
interface LegacyTestimonial { id?: string; quote?: string; author?: string; role?: string; company?: string; project?: string; avatar?: string }
interface LegacyDatabase { projects: LegacyProject[]; team: LegacyTeamMember[]; blogs: LegacyBlog[] }

const services = [
  ['DESIGN A WEBSITE', 'Start your digital journey with a bespoke design that captures your brand essence.', '/images/designwebsiteservice.png', ['Custom UI Kit', 'Mobile-First Design', 'Brand Guidelines', 'Cinematic Animations']],
  ['RE-DESIGN A WEBSITE', 'Transform your outdated platform into a modern masterwork with performance and conversion at its core.', '/images/websiteredesignservice.webp', ['UX Audit & Research', 'Modern Tech Migration', 'SEO Preservation', 'Performance Overhaul']],
  ['WEB DEVELOPMENT', 'High-performance, scalable web applications using modern full-stack architecture.', '/images/webdevolopmentservice.webp', ['Next.js App Router', 'Full-Stack Node.js', 'Performance Optimization', 'Secure Architecture']],
  ['APP DEVELOPMENT', 'Cross-platform mobile solutions with native-level performance and intuitive journeys.', '/images/appdevolopmentservice.jpeg', ['React Native', 'Firebase Integration', 'App Store Deployment', 'Push Cloud Services']],
  ['SHOPIFY & E-COM', 'Premium Shopify and WooCommerce stores engineered to convert traffic into loyal customers.', '/images/shopifyecommerseservice.jpg', ['Custom Liquid Themes', 'Checkout Optimization', 'API Integrations', 'CRO Strategy']],
  ['DIGITAL AUDIT', 'A focused analysis of security gaps, performance bottlenecks, and UX friction.', '/images/digitalauditservice.webp', ['Performance Profiling', 'Security Scanning', 'UX Friction Analysis', 'Strategic Roadmap']],
  ['GROWTH & MAINTENANCE', 'Continuous iteration, security patches, and conversion optimization after launch.', '/images/growthandmintainenceservice.jpg', ['Priority Support', 'Conversion Optimization', 'Security Monitoring', 'Feature Iteration']],
] as const;

const technologyGroups = [
  ['Frontend Architecture', [['React 18+', 'Mastery', 'Advanced state management and concurrent rendering.'], ['Next.js 14', 'Full Stack', 'Server actions and edge-ready delivery.'], ['Tailwind CSS', 'Expert', 'Atomic styling with design-system precision.'], ['Framer Motion', 'Mastery', 'Production-grade physics-based animations.']]],
  ['Backend & Infrastructure', [['Node.js / Bun', 'High Velocity', 'Scalable runtimes for APIs and services.'], ['PostgreSQL', 'Architect', 'Relational modeling, integrity, and query optimization.'], ['Redis', 'Elite', 'Low-latency caching and coordination.'], ['Docker / K8s', 'Enterprise', 'Containerized deployment and orchestration.']]],
  ['Cloud Ecosystem', [['AWS', 'Certified', 'Global infrastructure deployment and management.'], ['Vercel', 'Partner', 'Frontend cloud for high-performance applications.'], ['Supabase', 'Expert', 'Managed PostgreSQL and realtime platform integration.'], ['Cloudflare', 'Shield', 'Edge security and content delivery.']]],
  ['Mobile & Emerging', [['React Native', 'Mastery', 'Cross-platform native-performance applications.'], ['Swift / Kotlin', 'Native', 'OS-native experiences and integrations.'], ['Pinecone / Vector', 'AI Ready', 'Semantic search and retrieval infrastructure.'], ['OpenAI / Gemini', 'Advanced', 'Custom AI product integrations.']]],
] as const;

const collectUrls = (value: unknown, output = new Set<string>()): Set<string> => {
  if (typeof value === 'string' && (/^\//.test(value) || /^https?:\/\//.test(value)) && /\.(png|jpe?g|webp|pdf)(?:\?|$)/i.test(value)) output.add(value);
  else if (Array.isArray(value)) for (const item of value) collectUrls(item, output);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) collectUrls(item, output);
  return output;
};

const withoutLegacyMetadata = (record: Record<string, unknown>) => {
  const copy = { ...record };
  for (const key of ['id', 'createdAt', 'updatedAt', 'deletedAt', 'readingTime', 'testimonials']) delete copy[key];
  return copy;
};

const json = (value: unknown): JsonValue => JSON.stringify(value) as unknown as JsonValue;

async function main() {
  const config = databaseConfigFromEnv();
  if (!config) throw new Error('DATABASE_URL is required to seed the database.');
  const adminUsername = (process.env.ADMIN_USERNAME || '').trim();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || '';
  const adminDisplayName = (process.env.ADMIN_DISPLAY_NAME || '').trim();
  if (adminUsername && !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(adminUsername)) throw new Error('ADMIN_USERNAME must be 3-64 characters and contain only letters, numbers, hyphens, and underscores.');
  if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) throw new Error('ADMIN_EMAIL must be a valid email address.');
  if (adminPassword && adminPassword.length < 8) throw new Error('ADMIN_INITIAL_PASSWORD must contain at least 8 characters.');

  const legacy = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'db.json'), 'utf8')) as LegacyDatabase;
  const db = createDatabase(config);
  try {
    const admin = await db.transaction().execute(async (trx) => {
      const byUsername = adminUsername
        ? await trx.selectFrom('users').selectAll().where(sql`lower(username)`, '=', adminUsername.toLowerCase()).where('deleted_at', 'is', null).executeTakeFirst()
        : undefined;
      const byEmail = adminEmail
        ? await trx.selectFrom('users').selectAll().where(sql`lower(email)`, '=', adminEmail).where('deleted_at', 'is', null).executeTakeFirst()
        : undefined;
      if (byUsername && byEmail && byUsername.id !== byEmail.id) throw new Error('ADMIN_USERNAME and ADMIN_EMAIL belong to different accounts.');
      const existing = byUsername || byEmail || (!adminUsername && !adminEmail
        ? await trx.selectFrom('users').selectAll().where('role', '=', 'super_admin').where('is_active', '=', true).where('deleted_at', 'is', null).orderBy('created_at', 'asc').executeTakeFirst()
        : undefined);
      if (!existing) {
        if (!adminUsername || !adminEmail || !adminPassword) {
          throw new Error('First-time setup requires ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_INITIAL_PASSWORD. Existing installations can omit ADMIN_INITIAL_PASSWORD.');
        }
        const id = crypto.randomUUID();
        await trx.insertInto('users').values({ id, username: adminUsername, email: adminEmail, password_hash: await hashPassword(adminPassword), display_name: adminDisplayName || 'LB Super Admin', role: 'super_admin', is_active: true, last_login_at: null, team_member_id: null, deleted_at: null }).execute();
        return trx.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirstOrThrow();
      }
      await trx.updateTable('users').set({
        username: adminUsername || existing.username,
        email: adminEmail || existing.email,
        display_name: adminDisplayName || existing.display_name,
        role: 'super_admin',
        is_active: true,
        ...(adminPassword ? { password_hash: await hashPassword(adminPassword) } : {}),
      }).where('id', '=', existing.id).execute();
      if (adminPassword) await trx.updateTable('sessions').set({ revoked_at: new Date() }).where('user_id', '=', existing.id).where('revoked_at', 'is', null).execute();
      return trx.selectFrom('users').selectAll().where('id', '=', existing.id).executeTakeFirstOrThrow();
    });

    const allContent = { legacy, services };
    for (const url of collectUrls(allContent)) {
      const digest = crypto.createHash('sha256').update(url).digest('hex');
      const id = `legacy-media-${digest.slice(0, 24)}`;
      const extension = path.extname(url.split('?')[0]).toLowerCase();
      const mime = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : extension === '.pdf' ? 'application/pdf' : 'image/jpeg';
      await db.insertInto('media_assets').values({ id, uploaded_by: admin.id, provider: 'local', object_key: `legacy/${digest}`, public_url: url, original_name: path.basename(url.split('?')[0]).slice(0, 255) || id, mime_type: mime, byte_size: 1, checksum_sha256: digest, width: null, height: null, alt_text: '', status: 'ready', deleted_at: null }).onDuplicateKeyUpdate({ public_url: url, status: 'ready', deleted_at: null }).execute();
    }

    for (const raw of legacy.team) {
      const input = validate(teamInput, withoutLegacyMetadata(raw));
      await db.insertInto('team_members').values({ id: raw.id, slug: input.slug || slugify(input.name), name: input.name, role: input.role, avatar_media_id: null, cover_media_id: null, cv_media_id: null, deleted_at: null }).onDuplicateKeyUpdate({ deleted_at: null }).execute();
      await updateTeamMember(db, raw.id, input);
    }

    for (const raw of legacy.projects) {
      const input = validate(projectInput, withoutLegacyMetadata(raw));
      await db.insertInto('projects').values({ id: raw.id, slug: input.slug || slugify(input.title), title: input.title, thumbnail_media_id: null, completion_date: null, created_by: admin.id, updated_by: admin.id, deleted_at: null }).onDuplicateKeyUpdate({ deleted_at: null }).execute();
      await updateProject(db, raw.id, input, admin.id);
    }

    for (const raw of legacy.blogs) {
      const input = validate(blogInput, withoutLegacyMetadata(raw));
      await db.insertInto('blog_posts').values({ id: raw.id, slug: input.slug || slugify(input.title), title: input.title, content: input.content, author_name: input.author, cover_media_id: null, author_team_member_id: null, published_at: null, created_by: admin.id, updated_by: admin.id, deleted_at: null }).onDuplicateKeyUpdate({ deleted_at: null }).execute();
      await updateBlog(db, raw.id, input, admin.id);
    }

    for (const [index, [title, shortDescription, image, features]] of services.entries()) {
      const input = validate(serviceInput, { title, slug: slugify(title), shortDescription, description: `<p>${shortDescription}</p>`, features: [...features], image, active: true, featured: index < 3, displayOrder: index + 1 });
      const id = `service-${input.slug}`;
      await db.insertInto('services').values({ id, slug: input.slug!, title: input.title, short_description: input.shortDescription, description: input.description, features: json(input.features), image_url: input.image, media_id: null, icon: '', featured: input.featured, active: input.active, display_order: input.displayOrder, meta_title: '', meta_description: '', deleted_at: null }).onDuplicateKeyUpdate({ title: input.title, short_description: input.shortDescription, description: input.description, features: json(input.features), image_url: input.image, featured: input.featured, active: input.active, display_order: input.displayOrder, deleted_at: null }).execute();
    }

    for (const [category, items] of technologyGroups) {
      for (const [name, proficiency, description] of items) {
        const digest = crypto.createHash('sha1').update(name.toLowerCase()).digest('hex').slice(0, 6);
        const id = `tech-${slugify(name)}-${digest}`;
        await db.insertInto('technologies').values({ id, name, slug: slugify(name), category, icon_url: '', proficiency, description, deleted_at: null }).onDuplicateKeyUpdate({ name, slug: slugify(name), category, proficiency, description, deleted_at: null }).execute();
      }
    }

    for (const member of legacy.team) {
      for (const [index, item] of (member.testimonials || []).entries()) {
        const id = item.id || `testimonial-${member.id}-${index + 1}`;
        await db.insertInto('testimonials').values({ id, team_member_id: member.id, service_id: null, quote: item.quote || '', author: item.author || 'Client', author_role: item.role || '', company: item.company || '', project_name: item.project || '', avatar_url: item.avatar || '', avatar_media_id: null, featured: index === 0, active: true, display_order: index, deleted_at: null }).onDuplicateKeyUpdate({ team_member_id: member.id, quote: item.quote || '', author: item.author || 'Client', author_role: item.role || '', company: item.company || '', project_name: item.project || '', avatar_url: item.avatar || '', active: true, display_order: index, deleted_at: null }).execute();
      }
    }

    const settings = [
      { key: 'site.name', value: 'LB CodeBase', isPublic: true, description: 'Public site name.' },
      { key: 'site.contact_email', value: process.env.PUBLIC_CONTACT_EMAIL || 'lbdevelopers.agency@gmail.com', isPublic: true, description: 'Public contact email.' },
      { key: 'site.default_meta_description', value: 'LB CodeBase builds high-performance digital products, commerce platforms, and brand experiences.', isPublic: true, description: 'Default SEO description.' },
      { key: 'contact.retention_days', value: 365, isPublic: false, description: 'Retention policy for contact messages.' },
    ];
    for (const setting of settings) await db.insertInto('site_settings').values({ key: setting.key, value: json(setting.value), is_public: setting.isPublic, description: setting.description, updated_by: admin.id }).onDuplicateKeyUpdate({ value: json(setting.value), is_public: setting.isPublic, description: setting.description, updated_by: admin.id }).execute();

    process.stdout.write(`Seed complete: ${legacy.projects.length} projects, ${legacy.team.length} team members, ${legacy.blogs.length} blog posts, ${services.length} services.\n`);
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
