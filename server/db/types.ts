import type { ColumnType, Generated } from 'kysely';

export type Role = 'super_admin' | 'admin' | 'editor' | 'team_member';
export type Instant = ColumnType<Date, Date | string, Date | string>;
export type GeneratedInstant = ColumnType<Date, Date | string | undefined, Date | string>;
export type NullableInstant = ColumnType<Date | null, Date | string | null | undefined, Date | string | null>;
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface Timestamped {
  created_at: GeneratedInstant;
  updated_at: GeneratedInstant;
  deleted_at: NullableInstant;
}

export interface UserTable extends Timestamped {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: Role;
  is_active: Generated<boolean>;
  last_login_at: NullableInstant;
  team_member_id: string | null;
}

export interface SessionTable {
  id: string;
  user_id: string;
  token_hash: string;
  csrf_hash: string;
  expires_at: Instant;
  last_seen_at: GeneratedInstant;
  ip_hash: string | null;
  user_agent: string | null;
  revoked_at: NullableInstant;
  created_at: GeneratedInstant;
}

export interface TeamMemberTable extends Timestamped {
  id: string;
  slug: string;
  name: string;
  role: string;
  tagline: Generated<string>;
  bio: Generated<string>;
  full_bio: Generated<string>;
  specialization: Generated<string>;
  email: Generated<string>;
  phone: Generated<string>;
  location: Generated<string>;
  availability: Generated<string>;
  years_experience: Generated<string>;
  languages: Generated<JsonValue>;
  avatar_url: Generated<string>;
  cover_image_url: Generated<string>;
  cv_url: Generated<string>;
  avatar_media_id: string | null;
  cover_media_id: string | null;
  cv_media_id: string | null;
  accent_color: Generated<string>;
  active: Generated<boolean>;
  display_order: Generated<number>;
  experience: Generated<JsonValue>;
  education: Generated<JsonValue>;
  certifications: Generated<JsonValue>;
}

export interface ProjectTable extends Timestamped {
  id: string;
  slug: string;
  title: string;
  short_description: Generated<string>;
  full_description: Generated<string>;
  thumbnail_url: Generated<string>;
  thumbnail_media_id: string | null;
  category: Generated<string>;
  live_url: Generated<string>;
  github_url: Generated<string>;
  featured: Generated<boolean>;
  status: Generated<'draft' | 'published' | 'archived'>;
  completion_date: string | null;
  meta_title: Generated<string>;
  meta_description: Generated<string>;
  sort_order: Generated<number>;
  client: Generated<string>;
  industry: Generated<string>;
  problem: Generated<string>;
  challenge: Generated<string>;
  solution: Generated<string>;
  process: Generated<JsonValue>;
  results: Generated<JsonValue>;
  achievements: Generated<JsonValue>;
  version: Generated<number>;
  created_by: string | null;
  updated_by: string | null;
}

export interface TechnologyTable extends Timestamped {
  id: string;
  name: string;
  slug: string;
  category: Generated<string>;
  icon_url: Generated<string>;
  proficiency: Generated<string>;
  description: Generated<string>;
}

export interface SkillTable extends Timestamped {
  id: string;
  name: string;
  category: Generated<string>;
  slug: string;
}

export interface ServiceTable extends Timestamped {
  id: string;
  slug: string;
  title: string;
  short_description: Generated<string>;
  description: Generated<string>;
  features: Generated<JsonValue>;
  image_url: Generated<string>;
  media_id: string | null;
  icon: Generated<string>;
  featured: Generated<boolean>;
  active: Generated<boolean>;
  display_order: Generated<number>;
  meta_title: Generated<string>;
  meta_description: Generated<string>;
}

export interface BlogPostTable extends Timestamped {
  id: string;
  slug: string;
  title: string;
  excerpt: Generated<string>;
  content: string;
  cover_image_url: Generated<string>;
  cover_media_id: string | null;
  category: Generated<string>;
  tags: Generated<JsonValue>;
  author_name: string;
  author_team_member_id: string | null;
  status: Generated<'draft' | 'published' | 'scheduled' | 'archived'>;
  published_at: NullableInstant;
  live_url: Generated<string>;
  reading_time: Generated<number>;
  meta_title: Generated<string>;
  meta_description: Generated<string>;
  sort_order: Generated<number>;
  version: Generated<number>;
  created_by: string | null;
  updated_by: string | null;
}

export interface TestimonialTable extends Timestamped {
  id: string;
  team_member_id: string | null;
  service_id: string | null;
  quote: string;
  author: string;
  author_role: Generated<string>;
  company: Generated<string>;
  project_name: Generated<string>;
  avatar_url: Generated<string>;
  avatar_media_id: string | null;
  featured: Generated<boolean>;
  active: Generated<boolean>;
  display_order: Generated<number>;
}

export interface ContactMessageTable extends Timestamped {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  team_member_id: string | null;
  status: Generated<'new' | 'read' | 'replied' | 'archived' | 'spam'>;
  source_ip_hash: string | null;
  user_agent: string | null;
}

export interface MediaAssetTable extends Timestamped {
  id: string;
  uploaded_by: string | null;
  provider: 'local' | 's3';
  object_key: string;
  public_url: string;
  original_name: string;
  mime_type: string;
  byte_size: number;
  checksum_sha256: string;
  width: number | null;
  height: number | null;
  alt_text: Generated<string>;
  status: Generated<'pending' | 'ready' | 'quarantined' | 'deleted'>;
}

export interface SiteSettingTable {
  key: string;
  value: JsonValue;
  is_public: Generated<boolean>;
  description: Generated<string>;
  updated_by: string | null;
  created_at: GeneratedInstant;
  updated_at: GeneratedInstant;
}

export interface ProjectTeamTable { project_id: string; team_member_id: string; contribution_role: string; display_order: Generated<number> }
export interface ProjectTechnologyTable { project_id: string; technology_id: string; display_order: Generated<number> }
export interface TeamSkillTable { team_member_id: string; skill_id: string; display_order: Generated<number>; featured: Generated<boolean> }
export interface TeamSocialLinkTable { team_member_id: string; platform: string; url: string }
export interface ProjectMediaTable { project_id: string; media_id: string; display_order: Generated<number>; caption: Generated<string> }
export interface PageViewTable { id: Generated<string>; resource_type: string; resource_id: string; viewed_on: Generated<string>; view_count: Generated<string> }
export interface AuditLogTable { id: Generated<string>; actor_user_id: string | null; action: string; resource_type: string; resource_id: string | null; request_id: string | null; metadata: Generated<JsonValue>; created_at: GeneratedInstant }

export interface Database {
  users: UserTable;
  sessions: SessionTable;
  media_assets: MediaAssetTable;
  team_members: TeamMemberTable;
  team_social_links: TeamSocialLinkTable;
  skills: SkillTable;
  team_member_skills: TeamSkillTable;
  technologies: TechnologyTable;
  projects: ProjectTable;
  project_team_members: ProjectTeamTable;
  project_technologies: ProjectTechnologyTable;
  project_media: ProjectMediaTable;
  services: ServiceTable;
  testimonials: TestimonialTable;
  contact_messages: ContactMessageTable;
  site_settings: SiteSettingTable;
  blog_posts: BlogPostTable;
  page_views: PageViewTable;
  audit_logs: AuditLogTable;
}
