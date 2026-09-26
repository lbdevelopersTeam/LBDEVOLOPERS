SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role ENUM('super_admin','admin','editor','team_member') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME(3) NULL,
  team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  UNIQUE KEY users_username_uq (username), UNIQUE KEY users_email_uq (email),
  KEY users_role_active_idx (role,is_active,deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  csrf_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(3) NOT NULL, last_seen_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ip_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL, user_agent VARCHAR(500) NULL,
  revoked_at DATETIME(3) NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY sessions_token_uq (token_hash), KEY sessions_user_idx (user_id,revoked_at,expires_at),
  KEY sessions_expiry_idx (expires_at),
  CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_assets (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  uploaded_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  provider ENUM('local','s3') NOT NULL, object_key VARCHAR(700) NOT NULL, public_url TEXT NOT NULL,
  original_name VARCHAR(255) NOT NULL, mime_type VARCHAR(120) NOT NULL,
  byte_size BIGINT NOT NULL, checksum_sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  width INT NULL, height INT NULL, alt_text VARCHAR(300) NOT NULL DEFAULT '',
  status ENUM('pending','ready','quarantined','deleted') NOT NULL DEFAULT 'ready',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY media_object_uq (object_key), KEY media_status_idx (status,created_at), KEY media_user_idx (uploaded_by),
  CONSTRAINT media_user_fk FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, slug VARCHAR(180) NOT NULL,
  name VARCHAR(160) NOT NULL, role VARCHAR(180) NOT NULL, tagline VARCHAR(500) NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '', full_bio MEDIUMTEXT NOT NULL DEFAULT '', specialization VARCHAR(300) NOT NULL DEFAULT '',
  email VARCHAR(254) NOT NULL DEFAULT '', phone VARCHAR(30) NOT NULL DEFAULT '', location VARCHAR(240) NOT NULL DEFAULT '',
  availability VARCHAR(240) NOT NULL DEFAULT '', years_experience VARCHAR(80) NOT NULL DEFAULT '',
  languages LONGTEXT NOT NULL DEFAULT '[]', avatar_url TEXT NOT NULL DEFAULT '', cover_image_url TEXT NOT NULL DEFAULT '', cv_url TEXT NOT NULL DEFAULT '',
  avatar_media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, cover_media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  cv_media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, accent_color VARCHAR(20) NOT NULL DEFAULT '#3D5AFE',
  active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT NOT NULL DEFAULT 0,
  experience LONGTEXT NOT NULL DEFAULT '[]', education LONGTEXT NOT NULL DEFAULT '[]', certifications LONGTEXT NOT NULL DEFAULT '[]',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY team_slug_uq (slug), KEY team_public_idx (active,display_order,id),
  CONSTRAINT team_avatar_fk FOREIGN KEY (avatar_media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  CONSTRAINT team_cover_fk FOREIGN KEY (cover_media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  CONSTRAINT team_cv_fk FOREIGN KEY (cv_media_id) REFERENCES media_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_social_links (
  team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, platform VARCHAR(40) NOT NULL, url TEXT NOT NULL,
  PRIMARY KEY (team_member_id,platform), CONSTRAINT team_social_fk FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skills (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, name VARCHAR(160) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'General', slug VARCHAR(180) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY skills_slug_uq (slug), UNIQUE KEY skills_name_category_uq (name,category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_member_skills (
  team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, skill_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_order INT NOT NULL DEFAULT 0, featured BOOLEAN NOT NULL DEFAULT FALSE, PRIMARY KEY (team_member_id,skill_id),
  KEY team_skill_idx (skill_id,team_member_id), CONSTRAINT tms_team_fk FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
  CONSTRAINT tms_skill_fk FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technologies (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, name VARCHAR(160) NOT NULL, slug VARCHAR(180) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'Technology', icon_url TEXT NOT NULL DEFAULT '', proficiency VARCHAR(120) NOT NULL DEFAULT '', description VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY technologies_name_uq (name), UNIQUE KEY technologies_slug_uq (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, slug VARCHAR(180) NOT NULL, title VARCHAR(240) NOT NULL,
  short_description VARCHAR(500) NOT NULL DEFAULT '', full_description MEDIUMTEXT NOT NULL DEFAULT '', thumbnail_url TEXT NOT NULL DEFAULT '',
  thumbnail_media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, category VARCHAR(120) NOT NULL DEFAULT 'Web',
  live_url TEXT NOT NULL DEFAULT '', github_url TEXT NOT NULL DEFAULT '', featured BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft', completion_date DATE NULL,
  meta_title VARCHAR(240) NOT NULL DEFAULT '', meta_description VARCHAR(500) NOT NULL DEFAULT '', sort_order INT NOT NULL DEFAULT 0,
  client VARCHAR(200) NOT NULL DEFAULT '', industry VARCHAR(200) NOT NULL DEFAULT '', problem MEDIUMTEXT NOT NULL DEFAULT '',
  challenge MEDIUMTEXT NOT NULL DEFAULT '', solution MEDIUMTEXT NOT NULL DEFAULT '', process LONGTEXT NOT NULL DEFAULT '[]', results LONGTEXT NOT NULL DEFAULT '[]', achievements LONGTEXT NOT NULL DEFAULT '[]',
  version INT NOT NULL DEFAULT 1, created_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, updated_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY projects_slug_uq (slug), KEY projects_public_idx (status,featured,sort_order,id), KEY projects_category_idx (category,status),
  CONSTRAINT project_thumb_fk FOREIGN KEY (thumbnail_media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  CONSTRAINT project_creator_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT project_updater_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_team_members (
  project_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  contribution_role VARCHAR(240) NOT NULL, display_order INT NOT NULL DEFAULT 0, PRIMARY KEY(project_id,team_member_id),
  CONSTRAINT ptm_project_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT ptm_team_fk FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, technology_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_order INT NOT NULL DEFAULT 0, PRIMARY KEY(project_id,technology_id),
  CONSTRAINT ptech_project_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT ptech_technology_fk FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS project_media (
  project_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_order INT NOT NULL DEFAULT 0, caption VARCHAR(500) NOT NULL DEFAULT '', PRIMARY KEY(project_id,media_id),
  CONSTRAINT pm_project_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT pm_media_fk FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, slug VARCHAR(180) NOT NULL, title VARCHAR(200) NOT NULL,
  short_description VARCHAR(500) NOT NULL DEFAULT '', description MEDIUMTEXT NOT NULL DEFAULT '', features LONGTEXT NOT NULL DEFAULT '[]',
  image_url TEXT NOT NULL DEFAULT '', media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, icon VARCHAR(80) NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE, active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT NOT NULL DEFAULT 0,
  meta_title VARCHAR(240) NOT NULL DEFAULT '', meta_description VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY services_slug_uq (slug), KEY services_public_idx (active,display_order,id),
  CONSTRAINT service_media_fk FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  service_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, quote TEXT NOT NULL, author VARCHAR(160) NOT NULL,
  author_role VARCHAR(160) NOT NULL DEFAULT '', company VARCHAR(200) NOT NULL DEFAULT '', project_name VARCHAR(200) NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '', avatar_media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE, active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  KEY testimonials_public_idx (active,featured,display_order),
  CONSTRAINT testimonial_team_fk FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE SET NULL,
  CONSTRAINT testimonial_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  CONSTRAINT testimonial_media_fk FOREIGN KEY (avatar_media_id) REFERENCES media_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL,
  subject VARCHAR(160) NOT NULL, message TEXT NOT NULL, team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  status ENUM('new','read','replied','archived','spam') NOT NULL DEFAULT 'new', source_ip_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
  user_agent VARCHAR(500) NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  KEY messages_queue_idx (status,created_at), CONSTRAINT messages_team_fk FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  `key` VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, value LONGTEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE, description VARCHAR(500) NOT NULL DEFAULT '', updated_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY settings_public_idx (is_public,`key`), CONSTRAINT settings_user_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, slug VARCHAR(180) NOT NULL, title VARCHAR(240) NOT NULL,
  excerpt VARCHAR(500) NOT NULL DEFAULT '', content MEDIUMTEXT NOT NULL DEFAULT '', cover_image_url TEXT NOT NULL DEFAULT '',
  cover_media_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, category VARCHAR(120) NOT NULL DEFAULT 'Development',
  tags LONGTEXT NOT NULL DEFAULT '[]', author_name VARCHAR(160) NOT NULL, author_team_member_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  status ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft', published_at DATETIME(3) NULL, live_url TEXT NOT NULL DEFAULT '',
  reading_time INT NOT NULL DEFAULT 1, meta_title VARCHAR(240) NOT NULL DEFAULT '', meta_description VARCHAR(500) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0, version INT NOT NULL DEFAULT 1, created_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  updated_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
  UNIQUE KEY blogs_slug_uq (slug), KEY blogs_public_idx (status,published_at,id), KEY blogs_category_idx (category,status),
  CONSTRAINT blog_cover_fk FOREIGN KEY (cover_media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  CONSTRAINT blog_author_fk FOREIGN KEY (author_team_member_id) REFERENCES team_members(id) ON DELETE SET NULL,
  CONSTRAINT blog_creator_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT blog_updater_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_views (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, resource_type VARCHAR(40) NOT NULL, resource_id VARCHAR(100) NOT NULL,
  viewed_on DATE NOT NULL, view_count BIGINT NOT NULL DEFAULT 0,
  UNIQUE KEY page_views_uq (resource_type,resource_id,viewed_on), KEY page_views_resource_idx (resource_type,resource_id,viewed_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, actor_user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  action VARCHAR(120) NOT NULL, resource_type VARCHAR(80) NOT NULL, resource_id VARCHAR(100) NULL, request_id VARCHAR(100) NULL,
  metadata LONGTEXT NOT NULL DEFAULT '{}', created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY audit_actor_idx (actor_user_id,created_at), KEY audit_resource_idx (resource_type,resource_id,created_at),
  CONSTRAINT audit_actor_fk FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
