# Backend architecture and operations

## Architecture

`server.ts` mounts the new API at `/api/v2` before the compatibility API. A configured PostgreSQL connection disables the legacy JSON routes. The versioned router is separated into HTTP/error handling, schemas, authentication/authorization, repositories, storage, database types, migration, and seed modules.

Request flow:

1. Request IDs and security headers are attached.
2. JSON and upload size limits are enforced.
3. Zod validates and normalizes all accepted input; rich text is allow-list sanitized server-side.
4. Public requests enter repository queries. Admin requests additionally require a database session, CSRF token, and permission check.
5. Kysely emits parameterized PostgreSQL queries. Multi-table writes run in transactions.
6. Privileged mutations append an audit record. Errors return a stable code, message, request ID, and optional field map without stack traces.

## Schema and relationships

- `users 1—N sessions`; optional `users 1—1 team_members` link for team-member accounts.
- `projects N—N team_members` through `project_team_members`, with contribution role and order.
- `projects N—N technologies` through `project_technologies`.
- `team_members N—N skills` through `team_member_skills`, with featured/order metadata.
- `team_members 1—N team_social_links` and `team_members 1—N testimonials`.
- `projects N—N media_assets` through `project_media`; thumbnail, team images/CVs, service images, testimonial avatars, and blog covers have explicit optional media foreign keys.
- `services`, `testimonials`, `contact_messages`, `site_settings`, and `blog_posts` are standalone managed entities.
- `page_views` aggregates by resource/day; `audit_logs` records privileged actions.

Stable nested résumé and case-study arrays remain `jsonb` because their structures are owned by one record and are never independently queried. Reusable skills, technologies, contributors, media, testimonials, users, and services are normalized.

All resource slugs have case-insensitive partial unique indexes. Foreign keys, status checks, length/range checks, ordered-list indexes, public listing indexes, queue indexes, session expiry indexes, and audit lookup indexes match implemented reads. Instants use `timestamptz` and are returned as UTC ISO strings.

## Authentication and RBAC

Passwords are hashed with bcrypt cost 12. Login responses are generic and rate-limited. A successful login rotates prior sessions, stores only a SHA-256 verifier for a random 256-bit session token, and sends an `HttpOnly`, `SameSite=Strict`, production-secure cookie. Sessions expire, can be revoked at logout, and are rejected for disabled/deleted users.

State-changing authenticated requests need the session plus a matching `X-CSRF-Token`; browser origins are checked when present. The CSRF value is stored in a separate strict cookie while only its hash is persisted.

Roles:

- `super_admin`: all content, users, settings, messages, media, and audit access.
- `admin`: all operational content/settings/messages/media and audit access; cannot manage accounts.
- `editor`: content, messages, and media; no accounts, settings, or audit access.
- `team_member`: authenticated reads and updates only to the team profile linked to the account.

Authorization derives identity and ownership from the verified session, never from a client-supplied user ID.

## Media

Uploads accept verified PNG, JPEG, WebP, or PDF signatures up to 10 MB. Filenames are generated, source names are reduced to basenames, checksums are stored, and SVG/executable content is rejected. Checksum-identical ready assets are reused instead of creating duplicate files or records. `STORAGE_DRIVER=local` writes to `LOCAL_UPLOAD_DIRECTORY` (default `public/uploads`) and is served through the protected `/uploads` static mount, which is appropriate for a single persistent Node host. Serverless and horizontally scaled deployments should use `STORAGE_DRIVER=s3` so every instance sees the same durable objects. PostgreSQL stores metadata and public/object keys, not binary blobs.

Admin uploads use a same-origin `POST /api/v2/admin/media` request with browser-generated `multipart/form-data`, the `file` and `altText` fields, the authenticated session cookie, and the current CSRF token. Do not add a manual `Content-Type` header because the browser must generate the multipart boundary. Successful responses contain `{ success: true, file: { id, url, path, name, type, size, reused } }`; failures contain `{ success: false, error: { code, message, requestId } }`.

All admin image controls accept browser-decodable raster images in any resolution or aspect ratio. Source images may be up to 50 MB; the browser preserves the complete frame, scales only when necessary, strips unsafe active content/metadata through canvas conversion, and sends an optimized WebP below the API's 10 MB storage limit. SVG is intentionally rejected because it can contain active content. PDFs are not converted and remain limited to 10 MB.

The frontend and API are designed to be deployed behind the same public origin. This avoids cross-origin session-cookie and mixed-content failures. For S3-compatible storage, `S3_PUBLIC_BASE_URL` must be a public HTTPS origin in production; the bucket or CDN must allow reads for returned object URLs.

For a production malware workflow, send newly uploaded objects to a quarantine bucket, scan them asynchronously, and change `media_assets.status` from `quarantined` to `ready` only after the scanner passes. The current synchronous implementation provides type/signature/size defenses but does not include an antivirus engine.

## Migration, deployment, rollback

1. Back up the target database and verify the restore procedure.
2. Use a DDL-capable `DATABASE_MIGRATION_URL` to run `npm run db:migrate` exactly once in the release pipeline. Migrations are checksummed and use a transaction plus advisory lock.
3. Run `npm run db:seed` for the initial import only; it is transactional at repository-write boundaries and idempotent by stable legacy IDs.
4. Deploy the application with a least-privilege `DATABASE_URL`, `NODE_ENV=production`, HTTPS, `COOKIE_SECURE=true`, `IP_HASH_SALT`, and S3 variables.
5. Verify `/api/v2/health`, public pages, authentication, a read-only admin listing, upload, and one reversible draft CRUD flow.

Roll back application code first when the schema is backward compatible. Migrations are forward-only; use a corrective migration for schema mistakes. For destructive data failure, stop writes and restore the verified pre-release backup. `ENABLE_LEGACY_JSON_API=true` is a development-only local-data compatibility switch; production disables the legacy API regardless of this value.

## Backups, retention, monitoring

Run daily encrypted provider snapshots plus `npm run db:backup`; keep daily backups for 14 days, weekly for 8 weeks, and monthly for 12 months. Test a restore quarterly. Keep `audit_logs` for at least one year, expired/revoked sessions for 30 days, and contact messages according to the private `contact.retention_days` setting and applicable policy.

Logs are structured JSON and include request IDs without cookies, tokens, passwords, or message bodies. Monitor API 5xx/429 rates, login failures, pool saturation, slow PostgreSQL queries, storage failures, session-table growth, backup age, and restore-test status. Use PostgreSQL slow-query logging/`pg_stat_statements` and application-platform metrics in production.

## Known operational limits

- No PostgreSQL service or Docker runtime was present in the development environment. Automated tests execute the real migration and repository/API behavior on PGlite; run the same migrations against a staging PostgreSQL 15+ instance before deployment.
- SMTP notifications, MFA/password recovery, asynchronous antivirus scanning, CDN purge hooks, and a distributed rate-limit store require deployment-provider integrations. The API stores messages reliably and is structured for those additions.
