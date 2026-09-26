import crypto from 'node:crypto';
import type { Kysely, Selectable, Transaction } from 'kysely';
import { sql } from 'kysely';
import type { z } from 'zod';
import type { Database, JsonValue, ProjectTable, TeamMemberTable, BlogPostTable, ServiceTable, TestimonialTable } from '../../db/types';
import { ApiError } from './http';
import { blogInput, projectInput, serviceInput, slugify, teamInput, testimonialInput } from './schemas';

type ProjectInput = z.infer<typeof projectInput>;
type TeamInput = z.infer<typeof teamInput>;
type BlogInput = z.infer<typeof blogInput>;
type ServiceInput = z.infer<typeof serviceInput>;
type TestimonialInput = z.infer<typeof testimonialInput>;
type DbExecutor = Kysely<Database> | Transaction<Database>;

// node-postgres treats JavaScript arrays as PostgreSQL arrays. JSONB inputs must
// therefore be serialized explicitly so the same code works in real PostgreSQL.
const json = (value: unknown): JsonValue => JSON.stringify(value) as unknown as JsonValue;
const iso = (value: Date | string | null | undefined) => value ? new Date(value).toISOString() : '';
const values = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const CORE_EXPERTISE_CATEGORY = 'Core Expertise';

const uniqueNames = (names: string[]) => {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export interface ListQuery { page: number; limit: number; offset: number; search?: string; status?: string; category?: string; includeDeleted?: boolean }

async function projectRelations(db: DbExecutor, projectIds: string[], publicOnly = false) {
  const technologies = projectIds.length ? await db.selectFrom('project_technologies')
    .innerJoin('technologies', 'technologies.id', 'project_technologies.technology_id')
    .select(['project_technologies.project_id', 'technologies.name', 'project_technologies.display_order'])
    .where('project_technologies.project_id', 'in', projectIds).where('technologies.deleted_at', 'is', null)
    .orderBy('project_technologies.display_order').execute() : [];
  let contributorQuery = db.selectFrom('project_team_members')
    .innerJoin('team_members', 'team_members.id', 'project_team_members.team_member_id')
    .select(['project_team_members.project_id', 'project_team_members.team_member_id', 'project_team_members.contribution_role', 'project_team_members.display_order', 'team_members.name', 'team_members.slug', 'team_members.role', 'team_members.avatar_url'])
    .where('project_team_members.project_id', 'in', projectIds).where('team_members.deleted_at', 'is', null);
  if (publicOnly) contributorQuery = contributorQuery.where('team_members.active', '=', true);
  const contributors = projectIds.length ? await contributorQuery.orderBy('project_team_members.display_order').execute() : [];
  const gallery = projectIds.length ? await db.selectFrom('project_media')
    .innerJoin('media_assets', 'media_assets.id', 'project_media.media_id')
    .select(['project_media.project_id', 'project_media.media_id', 'media_assets.public_url', 'project_media.display_order'])
    .where('project_media.project_id', 'in', projectIds).where('media_assets.deleted_at', 'is', null).where('media_assets.status', '=', 'ready')
    .orderBy('project_media.display_order').execute() : [];
  return { technologies, contributors, gallery };
}

function mapProject(row: Selectable<ProjectTable>, relations: Awaited<ReturnType<typeof projectRelations>>) {
  const contributors = relations.contributors.filter((item) => item.project_id === row.id);
  const primary = contributors[0];
  return {
    id: row.id, title: row.title, slug: row.slug, shortDescription: row.short_description, fullDescription: row.full_description,
    thumbnail: row.thumbnail_url, thumbnailMediaId: row.thumbnail_media_id,
    gallery: relations.gallery.filter((item) => item.project_id === row.id).map((item) => item.public_url),
    galleryMediaIds: relations.gallery.filter((item) => item.project_id === row.id).map((item) => item.media_id),
    category: row.category, technologies: relations.technologies.filter((item) => item.project_id === row.id).map((item) => item.name),
    liveUrl: row.live_url, githubUrl: row.github_url, featured: row.featured, status: row.status,
    completionDate: row.completion_date || '', metaTitle: row.meta_title, metaDescription: row.meta_description, sortOrder: row.sort_order,
    memberId: primary?.team_member_id || '', memberRole: primary?.contribution_role || '',
    contributors: contributors.map((item) => ({ memberId: item.team_member_id, role: item.contribution_role, member: { id: item.team_member_id, name: item.name, slug: item.slug, role: item.role, avatar: item.avatar_url } })),
    client: row.client, industry: row.industry, problem: row.problem, challenge: row.challenge, solution: row.solution,
    process: values<string>(row.process), results: values<string>(row.results), achievements: values<string>(row.achievements), version: row.version,
    createdAt: iso(row.created_at), updatedAt: iso(row.updated_at), deletedAt: row.deleted_at ? iso(row.deleted_at) : null,
  };
}

export async function listProjects(db: Kysely<Database>, query: ListQuery, publicOnly = false) {
  let base = db.selectFrom('projects').selectAll();
  let count = db.selectFrom('projects').select(sql<number>`count(*)::int`.as('count'));
  if (!query.includeDeleted) { base = base.where('deleted_at', 'is', null); count = count.where('deleted_at', 'is', null); }
  if (publicOnly) { base = base.where('status', '=', 'published'); count = count.where('status', '=', 'published'); }
  else if (query.status) { const status = query.status as 'draft' | 'published' | 'archived'; base = base.where('status', '=', status); count = count.where('status', '=', status); }
  if (query.category) { base = base.where('category', '=', query.category); count = count.where('category', '=', query.category); }
  if (query.search) {
    const search = `%${query.search}%`;
    base = base.where((eb) => eb.or([eb('title', 'ilike', search), eb('short_description', 'ilike', search)]));
    count = count.where((eb) => eb.or([eb('title', 'ilike', search), eb('short_description', 'ilike', search)]));
  }
  const [rows, totalRow] = await Promise.all([
    base.orderBy(publicOnly ? 'featured' : 'sort_order', publicOnly ? 'desc' : 'asc').orderBy('sort_order').orderBy('id').limit(query.limit).offset(query.offset).execute(),
    count.executeTakeFirstOrThrow(),
  ]);
  const relations = await projectRelations(db, rows.map((row) => row.id), publicOnly);
  return { items: rows.map((row) => mapProject(row, relations)), total: Number(totalRow.count) };
}

export async function getProject(db: Kysely<Database>, identifier: string, publicOnly = false) {
  let query = db.selectFrom('projects').selectAll().where((eb) => eb.or([eb('id', '=', identifier), eb('slug', '=', identifier)])).where('deleted_at', 'is', null);
  if (publicOnly) query = query.where('status', '=', 'published');
  const row = await query.executeTakeFirst();
  if (!row) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found.');
  return mapProject(row, await projectRelations(db, [row.id], publicOnly));
}

async function syncProjectRelations(trx: Transaction<Database>, projectId: string, input: ProjectInput) {
  const contributorMap = new Map(input.contributors.map((item) => [item.memberId, item.role]));
  if (input.memberId && !contributorMap.has(input.memberId)) contributorMap.set(input.memberId, input.memberRole || 'Contributor');
  const memberIds = [...contributorMap.keys()];
  if (memberIds.length) {
    const members = await trx.selectFrom('team_members').select('id').where('id', 'in', memberIds).where('deleted_at', 'is', null).execute();
    if (members.length !== memberIds.length) throw new ApiError(422, 'TEAM_MEMBER_INVALID', 'One or more contributors do not exist.');
  }
  await trx.deleteFrom('project_team_members').where('project_id', '=', projectId).execute();
  if (memberIds.length) await trx.insertInto('project_team_members').values(memberIds.map((memberId, index) => ({ project_id: projectId, team_member_id: memberId, contribution_role: contributorMap.get(memberId)!, display_order: index }))).execute();

  const techIds: string[] = [];
  for (const name of [...new Set(input.technologies)]) {
    const techSlug = slugify(name);
    const existing = await trx.selectFrom('technologies').select('id').where(sql`lower(name)`, '=', name.toLowerCase()).where('deleted_at', 'is', null).executeTakeFirst();
    const id = existing?.id || `tech-${techSlug}-${crypto.createHash('sha1').update(name.toLowerCase()).digest('hex').slice(0, 6)}`;
    if (!existing) await trx.insertInto('technologies').values({ id, name, slug: techSlug, category: 'Technology', icon_url: '', proficiency: '', description: '', deleted_at: null }).execute();
    techIds.push(id);
  }
  await trx.deleteFrom('project_technologies').where('project_id', '=', projectId).execute();
  if (techIds.length) await trx.insertInto('project_technologies').values(techIds.map((technologyId, index) => ({ project_id: projectId, technology_id: technologyId, display_order: index }))).execute();

  const mediaIds = [...new Set(input.galleryMediaIds)];
  if (input.gallery.length) {
    const media = await trx.selectFrom('media_assets').select(['id', 'public_url']).where('public_url', 'in', input.gallery).where('deleted_at', 'is', null).execute();
    for (const url of input.gallery) {
      const id = media.find((item) => item.public_url === url)?.id;
      if (id && !mediaIds.includes(id)) mediaIds.push(id);
    }
  }
  if (mediaIds.length) {
    const validMedia = await trx.selectFrom('media_assets').select('id').where('id', 'in', mediaIds).where('status', '=', 'ready').where('deleted_at', 'is', null).execute();
    if (validMedia.length !== mediaIds.length) throw new ApiError(422, 'MEDIA_INVALID', 'One or more gallery assets are unavailable.');
  }
  await trx.deleteFrom('project_media').where('project_id', '=', projectId).execute();
  if (mediaIds.length) await trx.insertInto('project_media').values(mediaIds.map((mediaId, index) => ({ project_id: projectId, media_id: mediaId, display_order: index, caption: '' }))).execute();
}

export async function createProject(db: Kysely<Database>, input: ProjectInput, actorId: string) {
  const id = crypto.randomUUID();
  return db.transaction().execute(async (trx) => {
    let thumbnailMediaId = input.thumbnailMediaId || null;
    if (!thumbnailMediaId && input.thumbnail) thumbnailMediaId = (await trx.selectFrom('media_assets').select('id').where('public_url', '=', input.thumbnail).executeTakeFirst())?.id || null;
    await trx.insertInto('projects').values({
      id, slug: input.slug || slugify(input.title), title: input.title, short_description: input.shortDescription, full_description: input.fullDescription,
      thumbnail_url: input.thumbnail, thumbnail_media_id: thumbnailMediaId, category: input.category, live_url: input.liveUrl, github_url: input.githubUrl,
      featured: input.featured, status: input.status, completion_date: input.completionDate || null, meta_title: input.metaTitle, meta_description: input.metaDescription,
      sort_order: input.sortOrder, client: input.client, industry: input.industry, problem: input.problem, challenge: input.challenge, solution: input.solution,
      process: json(input.process), results: json(input.results), achievements: json(input.achievements), created_by: actorId, updated_by: actorId, deleted_at: null,
    }).execute();
    await syncProjectRelations(trx, id, input);
    return getProject(trx as Kysely<Database>, id);
  });
}

export async function updateProject(db: Kysely<Database>, id: string, input: ProjectInput, actorId: string) {
  return db.transaction().execute(async (trx) => {
    const current = await trx.selectFrom('projects').select(['id', 'version']).where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
    if (!current) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found.');
    if (input.version && input.version !== current.version) throw new ApiError(409, 'VERSION_CONFLICT', 'The project was modified by another user.');
    let thumbnailMediaId = input.thumbnailMediaId || null;
    if (!thumbnailMediaId && input.thumbnail) thumbnailMediaId = (await trx.selectFrom('media_assets').select('id').where('public_url', '=', input.thumbnail).where('status', '=', 'ready').where('deleted_at', 'is', null).executeTakeFirst())?.id || null;
    await trx.updateTable('projects').set({
      slug: input.slug || slugify(input.title), title: input.title, short_description: input.shortDescription, full_description: input.fullDescription,
      thumbnail_url: input.thumbnail, thumbnail_media_id: thumbnailMediaId, category: input.category, live_url: input.liveUrl, github_url: input.githubUrl,
      featured: input.featured, status: input.status, completion_date: input.completionDate || null, meta_title: input.metaTitle, meta_description: input.metaDescription,
      sort_order: input.sortOrder, client: input.client, industry: input.industry, problem: input.problem, challenge: input.challenge, solution: input.solution,
      process: json(input.process), results: json(input.results), achievements: json(input.achievements), updated_by: actorId, version: current.version + 1,
    }).where('id', '=', id).execute();
    await syncProjectRelations(trx, id, input);
    return getProject(trx as Kysely<Database>, id);
  });
}

async function teamRelations(db: DbExecutor, memberIds: string[], publicOnly = false) {
  const skills = memberIds.length ? await db.selectFrom('team_member_skills').innerJoin('skills', 'skills.id', 'team_member_skills.skill_id')
    .select(['team_member_skills.team_member_id', 'skills.name', 'skills.category', 'team_member_skills.display_order', 'team_member_skills.featured'])
    .where('team_member_skills.team_member_id', 'in', memberIds).where('skills.deleted_at', 'is', null).orderBy('team_member_skills.display_order').execute() : [];
  const social = memberIds.length ? await db.selectFrom('team_social_links').selectAll().where('team_member_id', 'in', memberIds).execute() : [];
  let testimonialQuery = db.selectFrom('testimonials').selectAll().where('team_member_id', 'in', memberIds).where('deleted_at', 'is', null);
  if (publicOnly) testimonialQuery = testimonialQuery.where('active', '=', true);
  const testimonials = memberIds.length ? await testimonialQuery.orderBy('display_order').execute() : [];
  return { skills, social, testimonials };
}

function mapTeam(row: Selectable<TeamMemberTable>, relations: Awaited<ReturnType<typeof teamRelations>>) {
  const skillRows = relations.skills.filter((item) => item.team_member_id === row.id);
  const groups = new Map<string, string[]>();
  for (const item of skillRows) {
    if (item.category === CORE_EXPERTISE_CATEGORY) continue;
    (groups.get(item.category) || (groups.set(item.category, []), groups.get(item.category)!)).push(item.name);
  }
  const coreSkills = skillRows.filter((item) => item.category === CORE_EXPERTISE_CATEGORY).map((item) => item.name);
  const featuredSkills = skillRows.filter((item) => item.featured).map((item) => item.name);
  // Older rows only persisted featured skills that exactly matched a detailed
  // skill-group label. Fill a short list from the remaining capabilities so a
  // single match cannot hide the rest of a member's expertise on team cards.
  const skills = coreSkills.length
    ? uniqueNames(coreSkills)
    : uniqueNames([...featuredSkills, ...skillRows.map((item) => item.name)]).slice(0, 8);
  const socialLinks = Object.fromEntries(relations.social.filter((item) => item.team_member_id === row.id).map((item) => [item.platform, item.url]));
  return {
    id: row.id, name: row.name, slug: row.slug, role: row.role, tagline: row.tagline, bio: row.bio, fullBio: row.full_bio, specialization: row.specialization,
    avatar: row.avatar_url, avatarMediaId: row.avatar_media_id, coverImage: row.cover_image_url, coverMediaId: row.cover_media_id,
    email: row.email, phone: row.phone, location: row.location, availability: row.availability, yearsExperience: row.years_experience,
    languages: values<string>(row.languages), cvUrl: row.cv_url, cvMediaId: row.cv_media_id, accentColor: row.accent_color,
    skills,
    skillGroups: [...groups.entries()].map(([category, groupSkills]) => ({ category, skills: groupSkills })),
    experience: values(row.experience), education: values(row.education), certifications: values(row.certifications), socialLinks,
    testimonials: relations.testimonials.filter((item) => item.team_member_id === row.id).map(mapTestimonial),
    active: row.active, displayOrder: row.display_order, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at), deletedAt: row.deleted_at ? iso(row.deleted_at) : null,
  };
}

export async function listTeam(db: Kysely<Database>, query: ListQuery, publicOnly = false) {
  let base = db.selectFrom('team_members').selectAll();
  let count = db.selectFrom('team_members').select(sql<number>`count(*)::int`.as('count'));
  if (!query.includeDeleted) { base = base.where('deleted_at', 'is', null); count = count.where('deleted_at', 'is', null); }
  if (publicOnly) { base = base.where('active', '=', true); count = count.where('active', '=', true); }
  if (query.search) { const search = `%${query.search}%`; base = base.where((eb) => eb.or([eb('name', 'ilike', search), eb('role', 'ilike', search)])); count = count.where((eb) => eb.or([eb('name', 'ilike', search), eb('role', 'ilike', search)])); }
  const [rows, total] = await Promise.all([base.orderBy('display_order').orderBy('id').limit(query.limit).offset(query.offset).execute(), count.executeTakeFirstOrThrow()]);
  const relations = await teamRelations(db, rows.map((row) => row.id), publicOnly);
  return { items: rows.map((row) => mapTeam(row, relations)), total: Number(total.count) };
}

export async function getTeamMember(db: Kysely<Database>, identifier: string, publicOnly = false) {
  let query = db.selectFrom('team_members').selectAll().where((eb) => eb.or([eb('id', '=', identifier), eb('slug', '=', identifier)])).where('deleted_at', 'is', null);
  if (publicOnly) query = query.where('active', '=', true);
  const row = await query.executeTakeFirst();
  if (!row) throw new ApiError(404, 'TEAM_MEMBER_NOT_FOUND', 'Team member not found.');
  const member = mapTeam(row, await teamRelations(db, [row.id], publicOnly));
  const projects = await db.selectFrom('project_team_members').innerJoin('projects', 'projects.id', 'project_team_members.project_id').select('projects.id')
    .where('project_team_members.team_member_id', '=', row.id).where('projects.deleted_at', 'is', null).where('projects.status', '=', 'published').orderBy('projects.sort_order').execute();
  const projectRows = (await Promise.all(projects.map((item) => getProject(db, item.id, true)))).map((project) => ({
    ...project,
    memberId: row.id,
    memberRole: project.contributors.find((item) => item.memberId === row.id)?.role || member.role,
  }));
  return { ...member, projects: projectRows };
}

async function syncTeamRelations(trx: Transaction<Database>, memberId: string, input: TeamInput) {
  await trx.deleteFrom('team_social_links').where('team_member_id', '=', memberId).execute();
  const links = Object.entries(input.socialLinks).filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (links.length) await trx.insertInto('team_social_links').values(links.map(([platform, url]) => ({ team_member_id: memberId, platform, url }))).execute();

  const normalized = input.skillGroups.length
    ? [
        ...input.skills.map((name) => ({ name, category: CORE_EXPERTISE_CATEGORY, featured: true })),
        ...input.skillGroups.flatMap((group) => group.skills.map((name) => ({ name, category: group.category, featured: false }))),
      ]
    : input.skills.map((name) => ({ name, category: 'General', featured: true }));
  const unique = [...new Map(normalized.map((item) => [`${item.category.toLowerCase()}:${item.name.toLowerCase()}`, item])).values()];
  const skillIds: { id: string; featured: boolean }[] = [];
  for (const skill of unique) {
    const existing = await trx.selectFrom('skills').select('id').where(sql`lower(name)`, '=', skill.name.toLowerCase()).where(sql`lower(category)`, '=', skill.category.toLowerCase()).where('deleted_at', 'is', null).executeTakeFirst();
    const id = existing?.id || `skill-${slugify(`${skill.category}-${skill.name}`)}-${crypto.createHash('sha1').update(`${skill.category}:${skill.name}`.toLowerCase()).digest('hex').slice(0, 6)}`;
    if (!existing) await trx.insertInto('skills').values({ id, name: skill.name, category: skill.category, slug: slugify(`${skill.category}-${skill.name}`), deleted_at: null }).execute();
    skillIds.push({ id, featured: skill.featured });
  }
  await trx.deleteFrom('team_member_skills').where('team_member_id', '=', memberId).execute();
  if (skillIds.length) await trx.insertInto('team_member_skills').values(skillIds.map((skill, index) => ({ team_member_id: memberId, skill_id: skill.id, display_order: index, featured: skill.featured }))).execute();
}

export async function createTeamMember(db: Kysely<Database>, input: TeamInput) {
  const id = crypto.randomUUID();
  return db.transaction().execute(async (trx) => {
    await trx.insertInto('team_members').values({
      id, slug: input.slug || slugify(input.name), name: input.name, role: input.role, tagline: input.tagline, bio: input.bio, full_bio: input.fullBio,
      specialization: input.specialization, email: input.email, phone: input.phone, location: input.location, availability: input.availability, years_experience: input.yearsExperience,
      languages: json(input.languages), avatar_url: input.avatar, cover_image_url: input.coverImage, cv_url: input.cvUrl, avatar_media_id: input.avatarMediaId || null,
      cover_media_id: input.coverMediaId || null, cv_media_id: input.cvMediaId || null, accent_color: input.accentColor, active: input.active, display_order: input.displayOrder,
      experience: json(input.experience), education: json(input.education), certifications: json(input.certifications), deleted_at: null,
    }).execute();
    await syncTeamRelations(trx, id, input);
    return getTeamMember(trx as Kysely<Database>, id);
  });
}

export async function updateTeamMember(db: Kysely<Database>, id: string, input: TeamInput) {
  return db.transaction().execute(async (trx) => {
    const exists = await trx.selectFrom('team_members').select('id').where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
    if (!exists) throw new ApiError(404, 'TEAM_MEMBER_NOT_FOUND', 'Team member not found.');
    await trx.updateTable('team_members').set({
      slug: input.slug || slugify(input.name), name: input.name, role: input.role, tagline: input.tagline, bio: input.bio, full_bio: input.fullBio,
      specialization: input.specialization, email: input.email, phone: input.phone, location: input.location, availability: input.availability, years_experience: input.yearsExperience,
      languages: json(input.languages), avatar_url: input.avatar, cover_image_url: input.coverImage, cv_url: input.cvUrl, avatar_media_id: input.avatarMediaId || null,
      cover_media_id: input.coverMediaId || null, cv_media_id: input.cvMediaId || null, accent_color: input.accentColor, active: input.active, display_order: input.displayOrder,
      experience: json(input.experience), education: json(input.education), certifications: json(input.certifications),
    }).where('id', '=', id).execute();
    await syncTeamRelations(trx, id, input);
    return getTeamMember(trx as Kysely<Database>, id);
  });
}

function mapBlog(row: Selectable<BlogPostTable>) {
  return { id: row.id, title: row.title, slug: row.slug, excerpt: row.excerpt, content: row.content, coverImage: row.cover_image_url, coverMediaId: row.cover_media_id, category: row.category, tags: values<string>(row.tags), author: row.author_name, status: row.status, publishedAt: iso(row.published_at), liveUrl: row.live_url, readingTime: row.reading_time, metaTitle: row.meta_title, metaDescription: row.meta_description, sortOrder: row.sort_order, version: row.version, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at), deletedAt: row.deleted_at ? iso(row.deleted_at) : null };
}

export async function listBlogs(db: Kysely<Database>, query: ListQuery, publicOnly = false) {
  let base = db.selectFrom('blog_posts').selectAll();
  let count = db.selectFrom('blog_posts').select(sql<number>`count(*)::int`.as('count'));
  if (!query.includeDeleted) { base = base.where('deleted_at', 'is', null); count = count.where('deleted_at', 'is', null); }
  if (publicOnly) { base = base.where('status', '=', 'published').where('published_at', '<=', new Date()); count = count.where('status', '=', 'published').where('published_at', '<=', new Date()); }
  else if (query.status) { const status = query.status as 'draft' | 'published' | 'scheduled' | 'archived'; base = base.where('status', '=', status); count = count.where('status', '=', status); }
  if (query.category) { base = base.where('category', '=', query.category); count = count.where('category', '=', query.category); }
  if (query.search) { const search = `%${query.search}%`; base = base.where((eb) => eb.or([eb('title', 'ilike', search), eb('excerpt', 'ilike', search)])); count = count.where((eb) => eb.or([eb('title', 'ilike', search), eb('excerpt', 'ilike', search)])); }
  const [rows, total] = await Promise.all([base.orderBy('published_at', 'desc').orderBy('id').limit(query.limit).offset(query.offset).execute(), count.executeTakeFirstOrThrow()]);
  return { items: rows.map(mapBlog), total: Number(total.count) };
}

export async function getBlog(db: Kysely<Database>, identifier: string, publicOnly = false) {
  let query = db.selectFrom('blog_posts').selectAll().where((eb) => eb.or([eb('id', '=', identifier), eb('slug', '=', identifier)])).where('deleted_at', 'is', null);
  if (publicOnly) query = query.where('status', '=', 'published').where('published_at', '<=', new Date());
  const row = await query.executeTakeFirst();
  if (!row) throw new ApiError(404, 'BLOG_NOT_FOUND', 'Blog post not found.');
  return mapBlog(row);
}

const readingTime = (html: string) => Math.max(1, Math.ceil(html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 220));
export async function createBlog(db: Kysely<Database>, input: BlogInput, actorId: string) {
  const id = crypto.randomUUID();
  await db.insertInto('blog_posts').values({ id, slug: input.slug || slugify(input.title), title: input.title, excerpt: input.excerpt, content: input.content, cover_image_url: input.coverImage, cover_media_id: input.coverMediaId || null, category: input.category, tags: json(input.tags), author_name: input.author, author_team_member_id: input.authorTeamMemberId || null, status: input.status, published_at: input.publishedAt ? new Date(input.publishedAt) : null, live_url: input.liveUrl || '', reading_time: readingTime(input.content), meta_title: input.metaTitle, meta_description: input.metaDescription, sort_order: input.sortOrder, created_by: actorId, updated_by: actorId, deleted_at: null }).execute();
  return getBlog(db, id);
}
export async function updateBlog(db: Kysely<Database>, id: string, input: BlogInput, actorId: string) {
  const current = await db.selectFrom('blog_posts').select(['id', 'version']).where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
  if (!current) throw new ApiError(404, 'BLOG_NOT_FOUND', 'Blog post not found.');
  if (input.version && input.version !== current.version) throw new ApiError(409, 'VERSION_CONFLICT', 'The blog post was modified by another user.');
  await db.updateTable('blog_posts').set({ slug: input.slug || slugify(input.title), title: input.title, excerpt: input.excerpt, content: input.content, cover_image_url: input.coverImage, cover_media_id: input.coverMediaId || null, category: input.category, tags: json(input.tags), author_name: input.author, author_team_member_id: input.authorTeamMemberId || null, status: input.status, published_at: input.publishedAt ? new Date(input.publishedAt) : null, live_url: input.liveUrl || '', reading_time: readingTime(input.content), meta_title: input.metaTitle, meta_description: input.metaDescription, sort_order: input.sortOrder, updated_by: actorId, version: current.version + 1 }).where('id', '=', id).execute();
  return getBlog(db, id);
}

function mapService(row: Selectable<ServiceTable>) { return { id: row.id, slug: row.slug, title: row.title, shortDescription: row.short_description, description: row.description, features: values<string>(row.features), image: row.image_url, mediaId: row.media_id, icon: row.icon, featured: row.featured, active: row.active, displayOrder: row.display_order, metaTitle: row.meta_title, metaDescription: row.meta_description, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) }; }
export async function listServices(db: Kysely<Database>, publicOnly = false) { let query = db.selectFrom('services').selectAll().where('deleted_at', 'is', null); if (publicOnly) query = query.where('active', '=', true); return (await query.orderBy('display_order').orderBy('id').execute()).map(mapService); }
export async function getService(db: Kysely<Database>, identifier: string, publicOnly = false) { let query = db.selectFrom('services').selectAll().where((eb) => eb.or([eb('id', '=', identifier), eb('slug', '=', identifier)])).where('deleted_at', 'is', null); if (publicOnly) query = query.where('active', '=', true); const row = await query.executeTakeFirst(); if (!row) throw new ApiError(404, 'SERVICE_NOT_FOUND', 'Service not found.'); return mapService(row); }
export async function createService(db: Kysely<Database>, input: ServiceInput) { const id = crypto.randomUUID(); await db.insertInto('services').values({ id, slug: input.slug || slugify(input.title), title: input.title, short_description: input.shortDescription, description: input.description, features: json(input.features), image_url: input.image, media_id: input.mediaId || null, icon: input.icon, featured: input.featured, active: input.active, display_order: input.displayOrder, meta_title: input.metaTitle, meta_description: input.metaDescription, deleted_at: null }).execute(); return getService(db, id); }
export async function updateService(db: Kysely<Database>, id: string, input: ServiceInput) { const result = await db.updateTable('services').set({ slug: input.slug || slugify(input.title), title: input.title, short_description: input.shortDescription, description: input.description, features: json(input.features), image_url: input.image, media_id: input.mediaId || null, icon: input.icon, featured: input.featured, active: input.active, display_order: input.displayOrder, meta_title: input.metaTitle, meta_description: input.metaDescription }).where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst(); if (!Number(result.numUpdatedRows)) throw new ApiError(404, 'SERVICE_NOT_FOUND', 'Service not found.'); return getService(db, id); }

function mapTestimonial(row: Selectable<TestimonialTable>) { return { id: row.id, quote: row.quote, author: row.author, role: row.author_role, company: row.company, project: row.project_name, avatar: row.avatar_url, avatarMediaId: row.avatar_media_id, teamMemberId: row.team_member_id, serviceId: row.service_id, featured: row.featured, active: row.active, displayOrder: row.display_order, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) }; }
export async function listTestimonials(db: Kysely<Database>, publicOnly = false) { let query = db.selectFrom('testimonials').selectAll().where('deleted_at', 'is', null); if (publicOnly) query = query.where('active', '=', true); return (await query.orderBy('featured', 'desc').orderBy('display_order').orderBy('id').execute()).map(mapTestimonial); }
export async function getTestimonial(db: Kysely<Database>, id: string) { const row = await db.selectFrom('testimonials').selectAll().where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst(); if (!row) throw new ApiError(404, 'TESTIMONIAL_NOT_FOUND', 'Testimonial not found.'); return mapTestimonial(row); }
export async function createTestimonial(db: Kysely<Database>, input: TestimonialInput) { const id = crypto.randomUUID(); await db.insertInto('testimonials').values({ id, team_member_id: input.teamMemberId || null, service_id: input.serviceId || null, quote: input.quote, author: input.author, author_role: input.role, company: input.company, project_name: input.project, avatar_url: input.avatar, avatar_media_id: input.avatarMediaId || null, featured: input.featured, active: input.active, display_order: input.displayOrder, deleted_at: null }).execute(); return getTestimonial(db, id); }
export async function updateTestimonial(db: Kysely<Database>, id: string, input: TestimonialInput) { const result = await db.updateTable('testimonials').set({ team_member_id: input.teamMemberId || null, service_id: input.serviceId || null, quote: input.quote, author: input.author, author_role: input.role, company: input.company, project_name: input.project, avatar_url: input.avatar, avatar_media_id: input.avatarMediaId || null, featured: input.featured, active: input.active, display_order: input.displayOrder }).where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst(); if (!Number(result.numUpdatedRows)) throw new ApiError(404, 'TESTIMONIAL_NOT_FOUND', 'Testimonial not found.'); return getTestimonial(db, id); }

export async function softDelete(db: Kysely<Database>, table: 'projects' | 'team_members' | 'blog_posts' | 'services' | 'testimonials', id: string) {
  const result = await db.updateTable(table).set({ deleted_at: new Date() }).where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
  if (!Number(result.numUpdatedRows)) throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Resource not found.');
}
