# LB CodeBase

The React portfolio has two explicit backend contracts. The current `/api/v2` client remains backed by PostgreSQL for compatibility, while the production-oriented `/api/v3` is a separate MySQL 8.0.34+/MariaDB 10.6+ API with signed cursor pagination, idempotent writes, optimistic concurrency, database sessions, audit history, and transactional outbox records.

## Local setup

Requirements: Node.js 20+ and PostgreSQL 15+.

1. Copy `.env.example` to `.env` and set the PostgreSQL URLs, first-admin credentials, and `IP_HASH_SALT`. Keep `.env` out of source control.
2. Install dependencies with `npm install`.
3. Run `npm run db:setup`. This applies checksummed migrations and idempotently imports the content in `db.json` plus the Services and Tech Stack datasets.
4. Run `npm run dev`, then open `http://localhost:3000`.
5. Sign in at `/admin/login` with the username and password supplied during first-time setup. Remove `ADMIN_INITIAL_PASSWORD` after seeding; repeat setup runs preserve the existing password hash when this value is absent.

On Windows, `powershell -ExecutionPolicy Bypass -File scripts/setup-local-postgres.ps1` installs the checksum-verified PostgreSQL 18 package, creates separate `lb_migrator` and restricted `lb_app` roles, initializes the database, and removes the plaintext bootstrap password. The website still renders its bundled public content if PostgreSQL is unavailable during local development, but admin login fails closed with a safe service-unavailable response. Production refuses to start without a reachable, migrated PostgreSQL database. The legacy JSON admin API is permanently disabled.

## Commands

- `npm run db:migrate` — apply pending checksummed SQL migrations.
- `npm run db:seed` — idempotently import existing site content and create or preserve the initial super admin.
- `npm run db:verify` — verify the real PostgreSQL server, migrations, least-privilege runtime role, record counts, and bcrypt admin hash.
- `npm run verify:auth` — perform the one-time live login/session/route/logout verification while `ADMIN_INITIAL_PASSWORD` is still present.
- `npm test` — run migration, repository, relation, auth, RBAC/ownership, CSRF, validation, upload, and API contract tests against PostgreSQL-compatible PGlite.
- `npm run lint` — strict TypeScript check.
- `npm run build` — optimized production frontend build.
- `npm run db:backup` — create a custom-format `pg_dump` backup (requires PostgreSQL client tools).

The admin console manages projects, team profiles, posts, services, testimonials, skills, technologies, contact workflow, media, public settings, and role-scoped accounts. The API contract is [docs/openapi-v2.yaml](docs/openapi-v2.yaml). Architecture, operations, rollback, security, and deployment guidance are in [docs/backend-architecture.md](docs/backend-architecture.md); the security audit is in [docs/security-review.md](docs/security-review.md).

Homepage client reviews are loaded from the public `/api/v2/testimonials` endpoint. Administrators can publish, reorder, edit, and archive them from **Admin → Content → Testimonials** without changing frontend code.

## MySQL API v3

1. Install Oracle MySQL 8.0.34+ or MariaDB 10.6+ (including Hostinger's managed database).
2. Review and run `server/mysql/provision.example.sql` with an administrative account after replacing its password placeholders.
3. Configure `MYSQL_DATABASE_URL`, `MYSQL_MIGRATION_URL`, `MYSQL_ADMIN_INITIAL_PASSWORD`, and `API_CURSOR_SECRET` from `.env.example`.
4. Run `npm run mysql:setup`.
5. Start the app and verify `GET /api/v3/live`, `GET /api/v3/ready`, and `GET /api/v3/openapi.yaml`.
6. Remove `MYSQL_ADMIN_INITIAL_PASSWORD` after the first successful seed.

MySQL commands:

- `npm run mysql:migrate` — apply ordered checksummed migrations under a MySQL advisory lock.
- `npm run mysql:seed` — create or preserve the initial administrator and import missing legacy projects.
- `npm run mysql:verify` — verify the target version, UTC session, tables, migrations, and record counts.
- `npm run mysql:setup` — run all three steps in order.

The v3 OpenAPI contract is [server/api/v3/openapi.yaml](server/api/v3/openapi.yaml). Schema, least-privilege provisioning, rollout, recovery, and operational requirements are documented in [docs/mysql-v3-architecture.md](docs/mysql-v3-architecture.md).
