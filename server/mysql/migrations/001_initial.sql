CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  username VARCHAR(64) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role ENUM('super_admin', 'admin', 'editor') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_username_uq (username),
  UNIQUE KEY users_email_uq (email),
  KEY users_active_role_idx (is_active, role, deleted_at),
  CONSTRAINT users_username_chk CHECK (CHAR_LENGTH(username) BETWEEN 3 AND 64)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  token_hash BINARY(32) NOT NULL,
  csrf_hash BINARY(32) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  last_seen_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ip_hash BINARY(32) NULL,
  user_agent VARCHAR(500) NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY sessions_token_hash_uq (token_hash),
  KEY sessions_user_active_idx (user_id, revoked_at, expires_at),
  KEY sessions_expiry_idx (expires_at),
  CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(180) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(240) NOT NULL,
  summary VARCHAR(500) NOT NULL DEFAULT '',
  description_html MEDIUMTEXT NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'Web',
  thumbnail_url VARCHAR(2048) NULL,
  live_url VARCHAR(2048) NULL,
  repository_url VARCHAR(2048) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at DATETIME(3) NULL,
  created_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  updated_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY projects_slug_uq (slug),
  KEY projects_public_order_idx (status, deleted_at, sort_order, id),
  KEY projects_featured_updated_idx (featured, status, deleted_at, updated_at, id),
  KEY projects_category_idx (category, status, deleted_at, sort_order, id),
  CONSTRAINT projects_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT projects_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT projects_version_chk CHECK (version > 0),
  CONSTRAINT projects_sort_order_chk CHECK (sort_order >= 0)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS technologies (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(180) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(160) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY technologies_slug_uq (slug),
  UNIQUE KEY technologies_name_uq (name),
  KEY technologies_active_name_idx (deleted_at, name)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS project_technologies (
  project_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  technology_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (project_id, technology_id),
  KEY project_technologies_order_idx (project_id, display_order, technology_id),
  KEY project_technologies_technology_idx (technology_id, project_id),
  CONSTRAINT project_technologies_project_fk FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT project_technologies_technology_fk FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE RESTRICT,
  CONSTRAINT project_technologies_order_chk CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived', 'spam') NOT NULL DEFAULT 'new',
  source_ip_hash BINARY(32) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY contact_messages_workflow_idx (status, deleted_at, created_at, id),
  KEY contact_messages_email_idx (email, created_at),
  CONSTRAINT contact_messages_name_chk CHECK (CHAR_LENGTH(name) BETWEEN 2 AND 120),
  CONSTRAINT contact_messages_body_chk CHECK (CHAR_LENGTH(message) BETWEEN 10 AND 5000)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS idempotency_keys (
  scope VARCHAR(180) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  key_hash BINARY(32) NOT NULL,
  request_hash BINARY(32) NOT NULL,
  actor_user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  response_status SMALLINT NOT NULL,
  response_body JSON NOT NULL,
  resource_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL,
  resource_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (scope, key_hash),
  KEY idempotency_expiry_idx (expires_at),
  KEY idempotency_actor_idx (actor_user_id, created_at),
  CONSTRAINT idempotency_actor_fk FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT idempotency_status_chk CHECK (response_status BETWEEN 200 AND 599)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  actor_user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  action VARCHAR(120) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  resource_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  resource_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NULL,
  request_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  metadata JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY audit_resource_idx (resource_type, resource_id, created_at),
  KEY audit_actor_idx (actor_user_id, created_at),
  KEY audit_request_idx (request_id),
  CONSTRAINT audit_actor_fk FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS outbox_events (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  topic VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  aggregate_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  aggregate_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  payload JSON NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 0,
  available_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processed_at DATETIME(3) NULL,
  last_error VARCHAR(1000) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY outbox_dispatch_idx (processed_at, available_at, attempts, id),
  KEY outbox_aggregate_idx (aggregate_type, aggregate_id, created_at),
  CONSTRAINT outbox_attempts_chk CHECK (attempts BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
