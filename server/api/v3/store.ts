import type { V3Contact, V3ProjectCreate, V3ProjectPatch } from './contracts';
import type { MysqlRole } from '../../mysql/types';

export interface V3UserAuth {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: MysqlRole;
  active: boolean;
}

export interface V3Principal extends Omit<V3UserAuth, 'passwordHash' | 'active'> {
  sessionId: string;
  csrfHash: Buffer;
}

export interface V3Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  descriptionHtml: string;
  category: string;
  thumbnailUrl: string | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  version: number;
  technologies: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCursor {
  sortOrder: number;
  id: string;
}

export interface ProjectListOptions {
  limit: number;
  cursor?: ProjectCursor;
  category?: string;
  featured?: boolean;
}

export interface ProjectListResult {
  items: V3Project[];
  nextCursor: ProjectCursor | null;
}

export interface SessionCreate {
  id: string;
  userId: string;
  tokenHash: Buffer;
  csrfHash: Buffer;
  expiresAt: Date;
  ipHash: Buffer | null;
  userAgent: string | null;
}

export interface MutationContext {
  requestId: string;
  actorUserId: string | null;
  idempotencyScope: string;
  idempotencyKeyHash: Buffer;
  requestHash: Buffer;
  expiresAt: Date;
}

export interface IdempotentResult<T> {
  value: T;
  status: number;
  replayed: boolean;
}

export type VersionedMutationResult =
  | { outcome: 'updated'; project: V3Project }
  | { outcome: 'not_found' }
  | { outcome: 'version_conflict'; currentVersion: number };

export type VersionedDeleteResult =
  | { outcome: 'deleted'; version: number }
  | { outcome: 'not_found' }
  | { outcome: 'version_conflict'; currentVersion: number };

export interface ContactReceipt {
  id: string;
  status: 'received';
  createdAt: string;
}

export class IdempotencyMismatchError extends Error {}

export interface V3Store {
  ping(): Promise<void>;
  findUserByUsername(username: string): Promise<V3UserAuth | null>;
  createSession(input: SessionCreate): Promise<void>;
  findPrincipalByTokenHash(tokenHash: Buffer): Promise<V3Principal | null>;
  touchSession(sessionId: string): Promise<void>;
  revokeSession(sessionId: string): Promise<void>;
  recordLogin(userId: string): Promise<void>;
  listPublishedProjects(options: ProjectListOptions): Promise<ProjectListResult>;
  getPublishedProjectBySlug(slug: string): Promise<V3Project | null>;
  createProject(input: V3ProjectCreate, context: MutationContext): Promise<IdempotentResult<V3Project>>;
  updateProject(id: string, expectedVersion: number, input: V3ProjectPatch, actorUserId: string, requestId: string): Promise<VersionedMutationResult>;
  deleteProject(id: string, expectedVersion: number, actorUserId: string, requestId: string): Promise<VersionedDeleteResult>;
  createContactMessage(input: V3Contact, sourceIpHash: Buffer | null, userAgent: string | null, context: MutationContext): Promise<IdempotentResult<ContactReceipt>>;
}
