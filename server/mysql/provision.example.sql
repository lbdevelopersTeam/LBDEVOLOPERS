-- Provisioning is intentionally separate from application migrations.
-- Run as a MySQL administrator, replace both passwords, and restrict account
-- hosts to the application network in production.

CREATE DATABASE IF NOT EXISTS lb_developers_v3
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'lb_v3_migrator'@'127.0.0.1'
  IDENTIFIED BY 'replace-with-a-strong-migration-password';
CREATE USER IF NOT EXISTS 'lb_v3_app'@'127.0.0.1'
  IDENTIFIED BY 'replace-with-a-strong-runtime-password';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
  ON lb_developers_v3.* TO 'lb_v3_migrator'@'127.0.0.1';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON lb_developers_v3.* TO 'lb_v3_app'@'127.0.0.1';

FLUSH PRIVILEGES;
