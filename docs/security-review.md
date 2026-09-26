# Security review

Review date: 2026-08-22

## Scope and model

The review covered the Express bootstrap and legacy compatibility routes, API v2 routes, validation, authentication and authorization, repositories, migration and seed paths, upload storage, frontend API clients, admin UI, environment/configuration, service worker, dependency tree, and production build output.

Primary protected assets are administrator identities and sessions, unpublished portfolio content, contact messages and internal workflow state, database/storage credentials, uploaded objects, settings, and audit records. The principal trust boundaries are public browser to API, authenticated browser to privileged API, application to PostgreSQL, and upload API to local/S3 object storage.

Likely threats include credential stuffing, CSRF, XSS through rich content or URLs, SQL injection, IDOR/broken role checks, upload polyglots, contact spam/database amplification, session theft, accidental secret exposure, and dependency compromise.

## Controls verified

- Kysely parameterized queries and transaction-scoped multi-table writes; no user input is concatenated into SQL.
- Strict Zod schemas for every mutation and bounded list/search inputs. Client-supplied IDs and extra mutation fields are rejected.
- Allow-list HTML sanitization and safe URL schemes for stored/rendered content.
- Bcrypt cost-12 password hashing, generic login failures, database-backed random sessions, hashed token verifiers, expiry, rotation, revocation, secure production cookies, and no browser localStorage authentication.
- SameSite cookies, double-submit CSRF token verification using timing-safe comparison, and same-origin validation.
- Server-enforced RBAC for super-admin, admin, editor, and team-member ownership. Team members cannot list privileged content and cannot change profile publication/order fields.
- Login, contact, read, and upload throttles; contact honeypot; request and JSON/upload size limits.
- PNG/JPEG/WebP/PDF allow-list plus magic-byte validation, generated object names, 10 MB limit, and metadata-only database storage.
- CSP, clickjacking, MIME-sniffing, referrer, permissions, COOP, and production HSTS headers.
- Structured request IDs and audit records without passwords, session tokens, cookies, or contact bodies.
- Production refuses to start without PostgreSQL and an IP hashing salt, ignores the legacy JSON API escape hatch, and requires S3-compatible media storage.
- Checksummed, locked, transactional migrations and normalized constraints/indexes.

## Findings fixed during review

1. Stored external URLs accepted unsafe schemes. URL validation now permits only HTTP(S) or safe root-relative paths, and the client also rejects dangerous schemes before rendering links.
2. The team-member role inherited administrative content reads. That permission was removed; a dedicated ownership-checked profile read/update path is used instead.
3. Related public records could include inactive contributors or testimonials. Public relation loaders now enforce active/non-deleted visibility.
4. Legacy administrative paths could remain reachable alongside PostgreSQL. They are disabled by default whenever PostgreSQL is configured and cannot be enabled in production.
5. Malformed JSON, oversized uploads, and unsupported uploads did not consistently use the stable error contract. They now return bounded 400/413/415 responses with safe codes and request IDs.
6. Frontend build configuration injected an unrelated API value. The injection was removed.
7. Dependency audit findings, including a transitive esbuild issue under `tsx`, were patched/overridden. The final production dependency audit reports zero known vulnerabilities.
8. The service worker attempted to cache partial video responses. It now caches complete responses only and handles offline misses without an unhandled rejection.

No unresolved high- or medium-severity source-code finding remains in the reviewed scope.

## Residual operational risks

- Rate limiting and public view deduplication are process-local. Multi-instance production should use a Redis/provider-backed limiter.
- Signature validation is not malware scanning. Production uploads should enter quarantine and be promoted only after an asynchronous scanner passes.
- MFA, password recovery/email delivery, centralized log shipping, alerting, and S3/CDN lifecycle rules require deployment-provider integration.
- PGlite exercised the migration and data/API behavior locally because PostgreSQL/Docker was not available. A PostgreSQL 15+ staging migration, seed, backup, restore, and smoke test remains a release gate.

The configured Codex security enrollment check reported that exploit-generation access was not granted. The standard review was therefore limited to defensive source analysis and non-exploit verification. Independent parallel baseline review was also unavailable in this run, so the threat model and source review were performed sequentially.
