# MySQL API v3 architecture and operations

## Scope and compatibility

`/api/v3` is a new MySQL-backed contract. It does not rename or silently change `/api/v2`, so the current React client remains compatible while consumers move deliberately. Set `API_V3_REQUIRED=true` only after MySQL is provisioned, migrated, seeded, and monitored in the target environment.

Target engine: Oracle MySQL 8.0.34 or newer. The schema intentionally uses MySQL 8 enforced checks and the `utf8mb4_0900_ai_ci` collation; it is not a MariaDB migration.

## Reliability model

- InnoDB foreign keys keep users, sessions, projects, technologies, and relationship rows consistent.
- All application times are stored as UTC `DATETIME(3)` values. Runtime connections force UTC conversion.
- Public project pagination is keyset-based and uses signed opaque cursors.
- Project creates require `Idempotency-Key`; project updates and deletes require the latest strong `ETag` through `If-Match`.
- Contact submissions require idempotency keys, preventing duplicate leads during retries.
- Mutations write domain data, a privacy-minimized audit row, and an outbox event in one transaction.
- Deadlocks and lock timeouts receive bounded retries. Remaining contention returns a retryable `503` rather than a silent partial write.
- Session and CSRF tokens are random; only SHA-256 verifiers are stored. Passwords use bcrypt cost 12.
- Runtime SQL is parameterized through Kysely/mysql2. Runtime connections explicitly disable multiple statements.

## Provisioning

Database and account creation requires administrative privileges and is separate from migrations. Review and run `server/mysql/provision.example.sql` as a MySQL administrator after replacing both placeholder passwords and restricting account hosts for the deployment network.

Configure:

```dotenv
MYSQL_DATABASE_URL=mysql://lb_v3_app:runtime-password@127.0.0.1:3306/lb_developers_v3
MYSQL_MIGRATION_URL=mysql://lb_v3_migrator:migration-password@127.0.0.1:3306/lb_developers_v3
MYSQL_SSL=false
MYSQL_POOL_MAX=10
MYSQL_ADMIN_INITIAL_PASSWORD=one-time-password-at-least-12-characters
API_CURSOR_SECRET=at-least-32-random-characters
```

Use TLS in production and keep both URLs in the deployment secret manager. The migration account must never be used by the running web process.

## Apply and verify

```bash
npm run mysql:setup
```

This applies checksummed, advisory-lock-protected migrations, creates or preserves the initial super administrator, imports only missing legacy projects from `db.json`, and verifies the server version, timezone, schema, migrations, and row counts. Remove `MYSQL_ADMIN_INITIAL_PASSWORD` after first setup.

MySQL DDL commits implicitly. The migration runner therefore does not claim transactional rollback: migrations are forward-only and rerunnable where safe. An edited applied migration is rejected by checksum.

## API contract

The authoritative transport contract is `server/api/v3/openapi.yaml`, also served from `/api/v3/openapi.yaml` even when MySQL is unavailable.

Operational endpoints:

- `GET /api/v3/live` checks the process only.
- `GET /api/v3/ready` checks the MySQL dependency.

Primary resources:

- `POST /api/v3/auth/sessions`, `GET/DELETE /api/v3/auth/session`
- `GET /api/v3/projects`, `GET /api/v3/projects/{slug}`
- `POST /api/v3/contact-messages`
- `POST /api/v3/admin/projects`
- `PATCH/DELETE /api/v3/admin/projects/{id}`

Errors use a stable `{ error: { code, message, requestId, fields? } }` envelope. Logs contain request correlation and timing only when `API_ACCESS_LOG=true`; authorization headers, cookies, passwords, tokens, and message bodies are never logged.

## Backup, rollout, and recovery

Before every production schema change, take and verify a consistent backup using the deployment provider's snapshot facility or `mysqldump --single-transaction --set-gtid-purged=OFF lb_developers_v3` with an appropriately privileged backup account.

Recommended rollout:

1. Provision MySQL and take a baseline backup.
2. Run `npm run mysql:migrate`, then `npm run mysql:seed`, then `npm run mysql:verify` from a controlled release job.
3. Deploy with `API_V3_REQUIRED=false` and verify `/api/v3/ready` plus representative read/write flows.
4. Migrate consumers to the documented contract.
5. Enable `API_V3_REQUIRED=true` so future deployments fail closed when MySQL is unavailable.

For a failed DDL rollout, restore the verified backup to a new database and repoint the deployment, or ship a reviewed forward-repair migration. Do not edit a migration that has been recorded in `_app_migrations`.

## Remaining production responsibilities

- Configure automated backups, point-in-time recovery, TLS, alerting, slow-query capture, and outbox dispatch in the chosen MySQL platform.
- Benchmark pool size and indexes with production-like traffic before raising `MYSQL_POOL_MAX`.
- Establish retention jobs for expired sessions, idempotency rows, audit logs, and processed outbox events.
- Process outbox events with a separate least-privilege worker before enabling downstream integrations.
