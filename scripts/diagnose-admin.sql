-- LB CodeBase / MariaDB admin authentication diagnosis
-- Read-only. Run this in phpMyAdmin or the Hostinger MariaDB console.

SELECT
  DATABASE() AS selected_database,
  VERSION() AS mariadb_version,
  CURRENT_USER() AS database_account,
  NOW() AS server_time;

-- Confirm the application schema exists.
SHOW TABLES;

-- Migration state.
SELECT name, applied_at, checksum
FROM _app_migrations
ORDER BY applied_at ASC;

-- Admin accounts. Never expose password_hash outside the database console.
SELECT
  id,
  username,
  email,
  display_name,
  role,
  is_active,
  deleted_at,
  last_login_at,
  created_at
FROM users
ORDER BY created_at ASC;

-- Find duplicate identifiers that can make account setup ambiguous.
SELECT LOWER(username) AS normalized_username, COUNT(*) AS matches
FROM users
WHERE deleted_at IS NULL
GROUP BY LOWER(username)
HAVING COUNT(*) > 1;

SELECT LOWER(email) AS normalized_email, COUNT(*) AS matches
FROM users
WHERE deleted_at IS NULL
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- Check active, expired, and revoked sessions without returning session tokens.
SELECT
  COUNT(*) AS total_sessions,
  SUM(revoked_at IS NULL AND expires_at > UTC_TIMESTAMP()) AS active_sessions,
  SUM(revoked_at IS NOT NULL) AS revoked_sessions,
  SUM(revoked_at IS NULL AND expires_at <= UTC_TIMESTAMP()) AS expired_sessions
FROM sessions;

-- Confirm core content tables are populated.
SELECT 'projects' AS table_name, COUNT(*) AS row_count FROM projects WHERE deleted_at IS NULL
UNION ALL SELECT 'team_members', COUNT(*) FROM team_members WHERE deleted_at IS NULL
UNION ALL SELECT 'blog_posts', COUNT(*) FROM blog_posts WHERE deleted_at IS NULL
UNION ALL SELECT 'services', COUNT(*) FROM services WHERE deleted_at IS NULL;

-- Expected result for the login account:
-- exactly one active, non-deleted row whose username or email matches the value used at login.
