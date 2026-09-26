# Backend architecture

The application has one production API (`/api/v2`) and one MariaDB database. The React client never reads `db.json` at runtime. `db.json` is only a source for the idempotent first-time seed.

Kysely and `mysql2` provide a shared connection pool. `server/db/client.ts` is the only runtime database connection module. The checksummed migration in `server/db/mariadb-migrations` creates normalized InnoDB/utf8mb4 tables for public content, contact forms, administrator accounts, sessions, settings, media metadata, page views, and audit records.

Production startup fails closed when `DATABASE_URL` is absent, unreachable, or unmigrated. Public reads, form submissions, admin authentication, and admin edits therefore cannot silently diverge into different stores.

Authentication uses opaque database sessions, bcrypt password hashes, secure HTTP-only cookies, CSRF validation for writes, role permissions, request rate limits, and audit logging. Multi-table content writes use transactions. Media uploads validate signatures and size before writing metadata; local storage is suitable for one persistent Hostinger Node.js instance, while S3-compatible storage remains available for multi-instance deployments.

Deployment order:

1. Create the Hostinger MariaDB database and user.
2. Add `DATABASE_URL` and the other values documented in `.env.example` to the Node.js Web App.
3. Run `npm run db:migrate`, `npm run db:seed`, and `npm run db:verify`.
4. Build with `npm run build` and start with `npm start`.
5. Verify `/api/v2/health`, a form submission, admin login, and an admin edit.

Back up with Hostinger's database backup tools or `npm run db:backup`, and periodically test restoration to a separate MariaDB database.
