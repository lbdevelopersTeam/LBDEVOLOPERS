CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE app.users (
  id text PRIMARY KEY,
  email varchar(254) NOT NULL,
  password_hash text NOT NULL,
  display_name varchar(120) NOT NULL,
  role varchar(32) NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor', 'team_member')),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX users_email_unique ON app.users (lower(email)) WHERE deleted_at IS NULL;
CREATE INDEX users_role_active_idx ON app.users (role, is_active) WHERE deleted_at IS NULL;

CREATE TABLE app.sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  csrf_hash char(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ip_hash char(64),
  user_agent varchar(500),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_active_idx ON app.sessions (user_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX sessions_expiry_idx ON app.sessions (expires_at);

CREATE TABLE app.media_assets (
  id text PRIMARY KEY,
  uploaded_by text REFERENCES app.users(id) ON DELETE SET NULL,
  provider varchar(32) NOT NULL CHECK (provider IN ('local', 's3')),
  object_key varchar(700) NOT NULL UNIQUE,
  public_url text NOT NULL,
  original_name varchar(255) NOT NULL,
  mime_type varchar(120) NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size > 0 AND byte_size <= 10485760),
  checksum_sha256 char(64) NOT NULL,
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  alt_text varchar(300) NOT NULL DEFAULT '',
  status varchar(24) NOT NULL DEFAULT 'ready' CHECK (status IN ('pending', 'ready', 'quarantined', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX media_assets_status_created_idx ON app.media_assets (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX media_assets_uploaded_by_idx ON app.media_assets (uploaded_by) WHERE deleted_at IS NULL;

CREATE TABLE app.team_members (
  id text PRIMARY KEY,
  slug varchar(180) NOT NULL,
  name varchar(160) NOT NULL,
  role varchar(180) NOT NULL,
  tagline varchar(500) NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  full_bio text NOT NULL DEFAULT '',
  specialization varchar(300) NOT NULL DEFAULT '',
  email varchar(254) NOT NULL DEFAULT '',
  location varchar(240) NOT NULL DEFAULT '',
  availability varchar(240) NOT NULL DEFAULT '',
  years_experience varchar(80) NOT NULL DEFAULT '',
  languages jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(languages) = 'array'),
  avatar_url text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  cv_url text NOT NULL DEFAULT '',
  avatar_media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  cover_media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  cv_media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  accent_color varchar(20) NOT NULL DEFAULT '#3D5AFE',
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  experience jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(experience) = 'array'),
  education jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(education) = 'array'),
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(certifications) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX team_members_slug_unique ON app.team_members (lower(slug)) WHERE deleted_at IS NULL;
CREATE INDEX team_members_public_order_idx ON app.team_members (active, display_order, id) WHERE deleted_at IS NULL;

ALTER TABLE app.users ADD COLUMN team_member_id text UNIQUE REFERENCES app.team_members(id) ON DELETE SET NULL;

CREATE TABLE app.team_social_links (
  team_member_id text NOT NULL REFERENCES app.team_members(id) ON DELETE CASCADE,
  platform varchar(40) NOT NULL,
  url text NOT NULL,
  PRIMARY KEY (team_member_id, platform),
  CHECK (platform IN ('linkedin', 'github', 'twitter', 'behance', 'dribbble', 'instagram', 'website'))
);

CREATE TABLE app.skills (
  id text PRIMARY KEY,
  name varchar(160) NOT NULL,
  category varchar(120) NOT NULL DEFAULT 'General',
  slug varchar(180) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX skills_name_category_unique ON app.skills (lower(name), lower(category)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX skills_slug_unique ON app.skills (lower(slug)) WHERE deleted_at IS NULL;

CREATE TABLE app.team_member_skills (
  team_member_id text NOT NULL REFERENCES app.team_members(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES app.skills(id) ON DELETE RESTRICT,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  featured boolean NOT NULL DEFAULT false,
  PRIMARY KEY (team_member_id, skill_id)
);
CREATE INDEX team_member_skills_skill_idx ON app.team_member_skills (skill_id, team_member_id);

CREATE TABLE app.technologies (
  id text PRIMARY KEY,
  name varchar(160) NOT NULL,
  slug varchar(180) NOT NULL,
  category varchar(120) NOT NULL DEFAULT 'Technology',
  icon_url text NOT NULL DEFAULT '',
  proficiency varchar(120) NOT NULL DEFAULT '',
  description varchar(500) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX technologies_name_unique ON app.technologies (lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX technologies_slug_unique ON app.technologies (lower(slug)) WHERE deleted_at IS NULL;

CREATE TABLE app.projects (
  id text PRIMARY KEY,
  slug varchar(180) NOT NULL,
  title varchar(240) NOT NULL,
  short_description varchar(500) NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  thumbnail_media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  category varchar(120) NOT NULL DEFAULT 'Web',
  live_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  status varchar(24) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  completion_date date,
  meta_title varchar(240) NOT NULL DEFAULT '',
  meta_description varchar(500) NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  client varchar(200) NOT NULL DEFAULT '',
  industry varchar(200) NOT NULL DEFAULT '',
  problem text NOT NULL DEFAULT '',
  challenge text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  process jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(process) = 'array'),
  results jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(results) = 'array'),
  achievements jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(achievements) = 'array'),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by text REFERENCES app.users(id) ON DELETE SET NULL,
  updated_by text REFERENCES app.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX projects_slug_unique ON app.projects (lower(slug)) WHERE deleted_at IS NULL;
CREATE INDEX projects_public_listing_idx ON app.projects (status, featured DESC, sort_order, id) WHERE deleted_at IS NULL;
CREATE INDEX projects_category_status_idx ON app.projects (category, status) WHERE deleted_at IS NULL;

CREATE TABLE app.project_team_members (
  project_id text NOT NULL REFERENCES app.projects(id) ON DELETE CASCADE,
  team_member_id text NOT NULL REFERENCES app.team_members(id) ON DELETE RESTRICT,
  contribution_role varchar(240) NOT NULL,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  PRIMARY KEY (project_id, team_member_id)
);
CREATE INDEX project_team_members_member_idx ON app.project_team_members (team_member_id, project_id);

CREATE TABLE app.project_technologies (
  project_id text NOT NULL REFERENCES app.projects(id) ON DELETE CASCADE,
  technology_id text NOT NULL REFERENCES app.technologies(id) ON DELETE RESTRICT,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  PRIMARY KEY (project_id, technology_id)
);
CREATE INDEX project_technologies_technology_idx ON app.project_technologies (technology_id, project_id);

CREATE TABLE app.project_media (
  project_id text NOT NULL REFERENCES app.projects(id) ON DELETE CASCADE,
  media_id text NOT NULL REFERENCES app.media_assets(id) ON DELETE RESTRICT,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  caption varchar(500) NOT NULL DEFAULT '',
  PRIMARY KEY (project_id, media_id)
);

CREATE TABLE app.services (
  id text PRIMARY KEY,
  slug varchar(180) NOT NULL,
  title varchar(200) NOT NULL,
  short_description varchar(500) NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features) = 'array'),
  image_url text NOT NULL DEFAULT '',
  media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  icon varchar(80) NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  meta_title varchar(240) NOT NULL DEFAULT '',
  meta_description varchar(500) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX services_slug_unique ON app.services (lower(slug)) WHERE deleted_at IS NULL;
CREATE INDEX services_public_order_idx ON app.services (active, display_order, id) WHERE deleted_at IS NULL;

CREATE TABLE app.testimonials (
  id text PRIMARY KEY,
  team_member_id text REFERENCES app.team_members(id) ON DELETE SET NULL,
  service_id text REFERENCES app.services(id) ON DELETE SET NULL,
  quote text NOT NULL CHECK (char_length(quote) BETWEEN 10 AND 4000),
  author varchar(160) NOT NULL,
  author_role varchar(160) NOT NULL DEFAULT '',
  company varchar(200) NOT NULL DEFAULT '',
  project_name varchar(200) NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  avatar_media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX testimonials_public_order_idx ON app.testimonials (active, featured DESC, display_order) WHERE deleted_at IS NULL;
CREATE INDEX testimonials_team_member_idx ON app.testimonials (team_member_id) WHERE deleted_at IS NULL;

CREATE TABLE app.contact_messages (
  id text PRIMARY KEY,
  name varchar(120) NOT NULL,
  email varchar(254) NOT NULL,
  subject varchar(160) NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  team_member_id text REFERENCES app.team_members(id) ON DELETE SET NULL,
  status varchar(24) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived', 'spam')),
  source_ip_hash char(64),
  user_agent varchar(500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX contact_messages_queue_idx ON app.contact_messages (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX contact_messages_team_idx ON app.contact_messages (team_member_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE app.site_settings (
  key varchar(160) PRIMARY KEY,
  value jsonb NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  description varchar(500) NOT NULL DEFAULT '',
  updated_by text REFERENCES app.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX site_settings_public_idx ON app.site_settings (is_public, key);

CREATE TABLE app.blog_posts (
  id text PRIMARY KEY,
  slug varchar(180) NOT NULL,
  title varchar(240) NOT NULL,
  excerpt varchar(500) NOT NULL DEFAULT '',
  content text NOT NULL,
  cover_image_url text NOT NULL DEFAULT '',
  cover_media_id text REFERENCES app.media_assets(id) ON DELETE SET NULL,
  category varchar(120) NOT NULL DEFAULT 'Development',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(tags) = 'array'),
  author_name varchar(160) NOT NULL,
  author_team_member_id text REFERENCES app.team_members(id) ON DELETE SET NULL,
  status varchar(24) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at timestamptz,
  live_url text NOT NULL DEFAULT '',
  reading_time integer NOT NULL DEFAULT 1 CHECK (reading_time > 0),
  meta_title varchar(240) NOT NULL DEFAULT '',
  meta_description varchar(500) NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by text REFERENCES app.users(id) ON DELETE SET NULL,
  updated_by text REFERENCES app.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX blog_posts_slug_unique ON app.blog_posts (lower(slug)) WHERE deleted_at IS NULL;
CREATE INDEX blog_posts_public_listing_idx ON app.blog_posts (status, published_at DESC, id) WHERE deleted_at IS NULL;
CREATE INDEX blog_posts_category_idx ON app.blog_posts (category, status) WHERE deleted_at IS NULL;

CREATE TABLE app.page_views (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  resource_type varchar(40) NOT NULL,
  resource_id text NOT NULL,
  viewed_on date NOT NULL DEFAULT CURRENT_DATE,
  view_count bigint NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  UNIQUE (resource_type, resource_id, viewed_on)
);
CREATE INDEX page_views_resource_idx ON app.page_views (resource_type, resource_id, viewed_on DESC);

CREATE TABLE app.audit_logs (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  actor_user_id text REFERENCES app.users(id) ON DELETE SET NULL,
  action varchar(120) NOT NULL,
  resource_type varchar(80) NOT NULL,
  resource_id text,
  request_id varchar(100),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_actor_created_idx ON app.audit_logs (actor_user_id, created_at DESC);
CREATE INDEX audit_logs_resource_created_idx ON app.audit_logs (resource_type, resource_id, created_at DESC);

CREATE OR REPLACE FUNCTION app.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_touch BEFORE UPDATE ON app.users FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER media_assets_touch BEFORE UPDATE ON app.media_assets FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER team_members_touch BEFORE UPDATE ON app.team_members FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER skills_touch BEFORE UPDATE ON app.skills FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER technologies_touch BEFORE UPDATE ON app.technologies FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER projects_touch BEFORE UPDATE ON app.projects FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER services_touch BEFORE UPDATE ON app.services FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER testimonials_touch BEFORE UPDATE ON app.testimonials FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER contact_messages_touch BEFORE UPDATE ON app.contact_messages FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON app.site_settings FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
CREATE TRIGGER blog_posts_touch BEFORE UPDATE ON app.blog_posts FOR EACH ROW EXECUTE FUNCTION app.touch_updated_at();
