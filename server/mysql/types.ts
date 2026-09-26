import type { ColumnType, Generated } from 'kysely';

export type MysqlRole = 'super_admin' | 'admin' | 'editor';
export type ProjectStatus = 'draft' | 'published' | 'archived';
export type MessageStatus = 'new' | 'read' | 'replied' | 'archived' | 'spam';
export type MysqlInstant = ColumnType<Date, Date | string, Date | string>;
export type GeneratedInstant = ColumnType<Date, Date | string | undefined, Date | string>;
export type NullableInstant = ColumnType<Date | null, Date | string | null | undefined, Date | string | null>;
export type MysqlBoolean = ColumnType<number, boolean | number | undefined, boolean | number>;
export type JsonDocument = ColumnType<unknown, string, string>;

interface Timestamped {
  created_at: GeneratedInstant;
  updated_at: GeneratedInstant;
  deleted_at: NullableInstant;
}

export interface MysqlUserTable extends Timestamped {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: MysqlRole;
  is_active: MysqlBoolean;
  last_login_at: NullableInstant;
}

export interface MysqlSessionTable {
  id: string;
  user_id: string;
  token_hash: Buffer;
  csrf_hash: Buffer;
  expires_at: MysqlInstant;
  last_seen_at: GeneratedInstant;
  ip_hash: Buffer | null;
  user_agent: string | null;
  revoked_at: NullableInstant;
  created_at: GeneratedInstant;
}

export interface MysqlProjectTable extends Timestamped {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description_html: string;
  category: string;
  thumbnail_url: string | null;
  live_url: string | null;
  repository_url: string | null;
  featured: MysqlBoolean;
  status: ProjectStatus;
  sort_order: number;
  version: Generated<number>;
  published_at: NullableInstant;
  created_by: string | null;
  updated_by: string | null;
}

export interface MysqlTechnologyTable extends Timestamped {
  id: string;
  slug: string;
  name: string;
}

export interface MysqlProjectTechnologyTable {
  project_id: string;
  technology_id: string;
  display_order: number;
  created_at: GeneratedInstant;
}

export interface MysqlContactMessageTable {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  source_ip_hash: Buffer | null;
  user_agent: string | null;
  created_at: GeneratedInstant;
  updated_at: GeneratedInstant;
  deleted_at: NullableInstant;
}

export interface MysqlIdempotencyKeyTable {
  scope: string;
  key_hash: Buffer;
  request_hash: Buffer;
  actor_user_id: string | null;
  response_status: number;
  response_body: JsonDocument;
  resource_type: string | null;
  resource_id: string | null;
  expires_at: MysqlInstant;
  created_at: GeneratedInstant;
}

export interface MysqlAuditLogTable {
  id: Generated<string>;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  request_id: string;
  metadata: JsonDocument;
  created_at: GeneratedInstant;
}

export interface MysqlOutboxEventTable {
  id: string;
  topic: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: JsonDocument;
  attempts: Generated<number>;
  available_at: GeneratedInstant;
  processed_at: NullableInstant;
  last_error: string | null;
  created_at: GeneratedInstant;
}

export interface MysqlDatabase {
  users: MysqlUserTable;
  sessions: MysqlSessionTable;
  projects: MysqlProjectTable;
  technologies: MysqlTechnologyTable;
  project_technologies: MysqlProjectTechnologyTable;
  contact_messages: MysqlContactMessageTable;
  idempotency_keys: MysqlIdempotencyKeyTable;
  audit_logs: MysqlAuditLogTable;
  outbox_events: MysqlOutboxEventTable;
}
