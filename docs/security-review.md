# Security review

Protected assets include administrator identities and sessions, unpublished content, contact messages, database and storage credentials, uploaded objects, settings, and audit records. The main boundaries are browser-to-API, authenticated administrator-to-API, application-to-MariaDB, and upload API-to-storage.

Implemented controls include parameterized Kysely queries, normalized relations with foreign keys, bcrypt password hashing, random opaque sessions stored as hashes, secure/same-site cookies, CSRF validation, role-based permissions, ownership checks, validation and HTML sanitization, upload signature checks, rate limiting, request IDs, security headers, soft deletion, audit records, and checksummed migrations under a MariaDB advisory lock.

Production requires MariaDB and `IP_HASH_SALT`; there is no JSON or second-database fallback. Real credentials are read from Hostinger environment variables and must never be committed. Remove `ADMIN_INITIAL_PASSWORD` after the first seed. Use HTTPS and `COOKIE_SECURE=true`.

Operational release checks are a MariaDB migration, idempotent seed, `npm run db:verify`, backup/restore test, contact-form insertion check, admin login/session/logout check, representative CRUD check, and a review of Hostinger runtime logs. Monitor API errors, login failures, pool saturation, storage failures, session growth, backup age, and slow MariaDB queries.
