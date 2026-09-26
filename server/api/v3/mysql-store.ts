import crypto from 'node:crypto';
import { sql, type Kysely, type Selectable, type Transaction } from 'kysely';
import type { MysqlDatabase, MysqlProjectTable } from '../../mysql/types';
import { slugifyV3, type V3Contact, type V3ProjectCreate, type V3ProjectPatch } from './contracts';
import {
  IdempotencyMismatchError,
  type ContactReceipt,
  type IdempotentResult,
  type MutationContext,
  type ProjectListOptions,
  type ProjectListResult,
  type SessionCreate,
  type V3Principal,
  type V3Project,
  type V3Store,
  type V3UserAuth,
  type VersionedDeleteResult,
  type VersionedMutationResult,
} from './store';

type DbExecutor = Kysely<MysqlDatabase> | Transaction<MysqlDatabase>;
type ProjectRow = Selectable<MysqlProjectTable>;

const iso = (value: Date | string | null) => value ? new Date(value).toISOString() : null;
const mysqlCode = (error: unknown) => typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

function parseJson<T>(value: unknown): T {
  if (typeof value === 'string') return JSON.parse(value) as T;
  return value as T;
}

export class MysqlV3Store implements V3Store {
  constructor(private readonly db: Kysely<MysqlDatabase>) {}

  async ping() {
    await sql`SELECT 1`.execute(this.db);
  }

  async findUserByUsername(username: string): Promise<V3UserAuth | null> {
    const row = await this.db.selectFrom('users').selectAll()
      .where('username', '=', username).where('is_active', '=', 1).where('deleted_at', 'is', null).executeTakeFirst();
    return row ? {
      id: row.id, username: row.username, email: row.email, passwordHash: row.password_hash,
      displayName: row.display_name, role: row.role, active: Boolean(row.is_active),
    } : null;
  }

  async createSession(input: SessionCreate) {
    await this.db.insertInto('sessions').values({
      id: input.id, user_id: input.userId, token_hash: input.tokenHash, csrf_hash: input.csrfHash,
      expires_at: input.expiresAt, ip_hash: input.ipHash, user_agent: input.userAgent, revoked_at: null,
    }).execute();
  }

  async findPrincipalByTokenHash(tokenHash: Buffer): Promise<V3Principal | null> {
    const row = await this.db.selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select([
        'sessions.id as session_id', 'sessions.csrf_hash', 'users.id', 'users.username', 'users.email',
        'users.display_name', 'users.role',
      ])
      .where('sessions.token_hash', '=', tokenHash)
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .where('users.is_active', '=', 1)
      .where('users.deleted_at', 'is', null)
      .executeTakeFirst();
    return row ? {
      id: row.id, username: row.username, email: row.email, displayName: row.display_name,
      role: row.role, sessionId: row.session_id, csrfHash: row.csrf_hash,
    } : null;
  }

  async touchSession(sessionId: string) {
    await this.db.updateTable('sessions').set({ last_seen_at: new Date() }).where('id', '=', sessionId).execute();
  }

  async revokeSession(sessionId: string) {
    await this.db.updateTable('sessions').set({ revoked_at: new Date() }).where('id', '=', sessionId).where('revoked_at', 'is', null).execute();
  }

  async recordLogin(userId: string) {
    await this.db.updateTable('users').set({ last_login_at: new Date() }).where('id', '=', userId).execute();
  }

  async listPublishedProjects(options: ProjectListOptions): Promise<ProjectListResult> {
    let query = this.db.selectFrom('projects').selectAll()
      .where('status', '=', 'published').where('deleted_at', 'is', null);
    if (options.category) query = query.where('category', '=', options.category);
    if (options.featured !== undefined) query = query.where('featured', '=', options.featured ? 1 : 0);
    if (options.cursor) {
      const cursor = options.cursor;
      query = query.where((eb) => eb.or([
        eb('sort_order', '>', cursor.sortOrder),
        eb.and([eb('sort_order', '=', cursor.sortOrder), eb('id', '>', cursor.id)]),
      ]));
    }
    const rows = await query.orderBy('sort_order').orderBy('id').limit(options.limit + 1).execute();
    const hasMore = rows.length > options.limit;
    const visibleRows = hasMore ? rows.slice(0, options.limit) : rows;
    const items = await this.hydrateProjects(this.db, visibleRows);
    const last = visibleRows.at(-1);
    return { items, nextCursor: hasMore && last ? { sortOrder: last.sort_order, id: last.id } : null };
  }

  async getPublishedProjectBySlug(slug: string): Promise<V3Project | null> {
    const row = await this.db.selectFrom('projects').selectAll()
      .where('slug', '=', slug).where('status', '=', 'published').where('deleted_at', 'is', null).executeTakeFirst();
    if (!row) return null;
    return (await this.hydrateProjects(this.db, [row]))[0] || null;
  }

  async createProject(input: V3ProjectCreate, context: MutationContext): Promise<IdempotentResult<V3Project>> {
    return this.withIdempotency(context, async (trx) => {
      const id = crypto.randomUUID();
      await trx.insertInto('projects').values({
        id, slug: input.slug || slugifyV3(input.title), title: input.title, summary: input.summary,
        description_html: input.descriptionHtml, category: input.category, thumbnail_url: input.thumbnailUrl,
        live_url: input.liveUrl, repository_url: input.repositoryUrl, featured: input.featured ? 1 : 0,
        status: input.status, sort_order: input.sortOrder,
        published_at: input.status === 'published' ? new Date() : null,
        created_by: context.actorUserId, updated_by: context.actorUserId, deleted_at: null,
      }).execute();
      await this.replaceTechnologies(trx, id, input.technologies);
      const project = await this.getProjectById(trx, id);
      if (!project) throw new Error('The newly created project could not be reloaded.');
      await this.recordMutation(trx, context, 'project.created', 'project', id, project);
      return { value: project, status: 201, resourceType: 'project', resourceId: id };
    });
  }

  async updateProject(id: string, expectedVersion: number, input: V3ProjectPatch, actorUserId: string, requestId: string): Promise<VersionedMutationResult> {
    return this.transactionWithRetry(async (trx) => {
      const result = await trx.updateTable('projects').set({
        title: input.title, slug: input.slug, summary: input.summary, description_html: input.descriptionHtml,
        category: input.category, thumbnail_url: input.thumbnailUrl, live_url: input.liveUrl,
        repository_url: input.repositoryUrl, featured: input.featured === undefined ? undefined : input.featured ? 1 : 0,
        status: input.status, sort_order: input.sortOrder, updated_by: actorUserId,
        published_at: input.status === undefined ? undefined : input.status === 'published'
          ? sql<Date>`COALESCE(published_at, CURRENT_TIMESTAMP(3))` : null,
        version: sql<number>`version + 1`,
      })
        .where('id', '=', id).where('version', '=', expectedVersion).where('deleted_at', 'is', null).executeTakeFirst();
      if (Number(result.numUpdatedRows) === 0) {
        const current = await trx.selectFrom('projects').select('version').where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
        return current ? { outcome: 'version_conflict', currentVersion: current.version } : { outcome: 'not_found' };
      }
      if (input.technologies) await this.replaceTechnologies(trx, id, input.technologies);
      const project = await this.getProjectById(trx, id);
      if (!project) return { outcome: 'not_found' };
      await this.recordMutation(trx, { requestId, actorUserId }, 'project.updated', 'project', id, { version: project.version });
      return { outcome: 'updated', project };
    });
  }

  async deleteProject(id: string, expectedVersion: number, actorUserId: string, requestId: string): Promise<VersionedDeleteResult> {
    return this.transactionWithRetry(async (trx) => {
      const deletedAt = new Date();
      const result = await trx.updateTable('projects').set({
        status: 'archived', deleted_at: deletedAt, updated_by: actorUserId, version: sql<number>`version + 1`,
      }).where('id', '=', id).where('version', '=', expectedVersion).where('deleted_at', 'is', null).executeTakeFirst();
      if (Number(result.numUpdatedRows) === 0) {
        const current = await trx.selectFrom('projects').select('version').where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
        return current ? { outcome: 'version_conflict', currentVersion: current.version } : { outcome: 'not_found' };
      }
      const version = expectedVersion + 1;
      await this.recordMutation(trx, { requestId, actorUserId }, 'project.deleted', 'project', id, { version });
      return { outcome: 'deleted', version };
    });
  }

  async createContactMessage(input: V3Contact, sourceIpHash: Buffer | null, userAgent: string | null, context: MutationContext): Promise<IdempotentResult<ContactReceipt>> {
    return this.withIdempotency(context, async (trx) => {
      const id = crypto.randomUUID();
      const createdAt = new Date();
      await trx.insertInto('contact_messages').values({
        id, name: input.name, email: input.email, subject: input.subject, message: input.message,
        status: 'new', source_ip_hash: sourceIpHash, user_agent: userAgent, created_at: createdAt,
        updated_at: createdAt, deleted_at: null,
      }).execute();
      const receipt: ContactReceipt = { id, status: 'received', createdAt: createdAt.toISOString() };
      await this.recordMutation(trx, context, 'contact.received', 'contact_message', id, { status: 'new' });
      return { value: receipt, status: 201, resourceType: 'contact_message', resourceId: id };
    });
  }

  private async getProjectById(executor: DbExecutor, id: string): Promise<V3Project | null> {
    const row = await executor.selectFrom('projects').selectAll().where('id', '=', id).where('deleted_at', 'is', null).executeTakeFirst();
    return row ? (await this.hydrateProjects(executor, [row]))[0] || null : null;
  }

  private async hydrateProjects(executor: DbExecutor, rows: ProjectRow[]): Promise<V3Project[]> {
    if (!rows.length) return [];
    const links = await executor.selectFrom('project_technologies')
      .innerJoin('technologies', 'technologies.id', 'project_technologies.technology_id')
      .select(['project_technologies.project_id', 'technologies.name'])
      .where('project_technologies.project_id', 'in', rows.map((row) => row.id))
      .where('technologies.deleted_at', 'is', null)
      .orderBy('project_technologies.display_order').orderBy('technologies.name').execute();
    const byProject = new Map<string, string[]>();
    for (const link of links) (byProject.get(link.project_id) || byProject.set(link.project_id, []).get(link.project_id)!).push(link.name);
    return rows.map((row) => ({
      id: row.id, slug: row.slug, title: row.title, summary: row.summary, descriptionHtml: row.description_html,
      category: row.category, thumbnailUrl: row.thumbnail_url, liveUrl: row.live_url,
      repositoryUrl: row.repository_url, featured: Boolean(row.featured), status: row.status,
      sortOrder: row.sort_order, version: row.version, technologies: byProject.get(row.id) || [],
      publishedAt: iso(row.published_at), createdAt: iso(row.created_at)!, updatedAt: iso(row.updated_at)!,
    }));
  }

  private async replaceTechnologies(trx: Transaction<MysqlDatabase>, projectId: string, names: string[]) {
    await trx.deleteFrom('project_technologies').where('project_id', '=', projectId).execute();
    const normalized = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
    for (const [index, name] of normalized.entries()) {
      const technologySlug = slugifyV3(name);
      let technology = await trx.selectFrom('technologies').select('id').where('slug', '=', technologySlug).executeTakeFirst();
      if (!technology) {
        const technologyId = crypto.randomUUID();
        await trx.insertInto('technologies').values({ id: technologyId, slug: technologySlug, name, deleted_at: null }).execute();
        technology = { id: technologyId };
      } else {
        await trx.updateTable('technologies').set({ name, deleted_at: null }).where('id', '=', technology.id).execute();
      }
      await trx.insertInto('project_technologies').values({ project_id: projectId, technology_id: technology.id, display_order: index }).execute();
    }
  }

  private async recordMutation(
    trx: Transaction<MysqlDatabase>,
    context: Pick<MutationContext, 'requestId' | 'actorUserId'>,
    action: string,
    resourceType: string,
    resourceId: string,
    payload: unknown,
  ) {
    await trx.insertInto('audit_logs').values({
      actor_user_id: context.actorUserId, action, resource_type: resourceType, resource_id: resourceId,
      request_id: context.requestId, metadata: JSON.stringify(payload),
    }).execute();
    await trx.insertInto('outbox_events').values({
      id: crypto.randomUUID(), topic: action, aggregate_type: resourceType, aggregate_id: resourceId,
      payload: JSON.stringify(payload), processed_at: null, last_error: null,
    }).execute();
  }

  private async withIdempotency<T>(
    context: MutationContext,
    operation: (trx: Transaction<MysqlDatabase>) => Promise<{ value: T; status: number; resourceType: string; resourceId: string }>,
  ): Promise<IdempotentResult<T>> {
    return this.transactionWithRetry(async (trx) => {
      const existing = await trx.selectFrom('idempotency_keys').selectAll()
        .where('scope', '=', context.idempotencyScope).where('key_hash', '=', context.idempotencyKeyHash).forUpdate().executeTakeFirst();
      if (existing && new Date(existing.expires_at).getTime() > Date.now()) {
        if (!Buffer.from(existing.request_hash).equals(context.requestHash)) throw new IdempotencyMismatchError();
        return { value: parseJson<T>(existing.response_body), status: existing.response_status, replayed: true };
      }
      if (existing) {
        await trx.deleteFrom('idempotency_keys').where('scope', '=', context.idempotencyScope).where('key_hash', '=', context.idempotencyKeyHash).execute();
      }
      const result = await operation(trx);
      await trx.insertInto('idempotency_keys').values({
        scope: context.idempotencyScope, key_hash: context.idempotencyKeyHash, request_hash: context.requestHash,
        actor_user_id: context.actorUserId, response_status: result.status, response_body: JSON.stringify(result.value),
        resource_type: result.resourceType, resource_id: result.resourceId, expires_at: context.expiresAt,
      }).execute();
      return { value: result.value, status: result.status, replayed: false };
    });
  }

  private async transactionWithRetry<T>(operation: (trx: Transaction<MysqlDatabase>) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.db.transaction().setIsolationLevel('repeatable read').execute(operation);
      } catch (error) {
        if (!['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(mysqlCode(error)) || attempt === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 20 + Math.floor(Math.random() * 40) * (attempt + 1)));
      }
    }
    throw new Error('Transaction retry limit exceeded.');
  }
}
