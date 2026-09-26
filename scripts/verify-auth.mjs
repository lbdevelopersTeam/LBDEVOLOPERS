import 'dotenv/config';
import assert from 'node:assert/strict';

const port = Number(process.env.PORT || 3000);
const origin = `http://127.0.0.1:${port}`;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_INITIAL_PASSWORD;
if (!username || !password) throw new Error('ADMIN_USERNAME and ADMIN_INITIAL_PASSWORD are required for this one-time authentication verification.');

const login = await fetch(`${origin}/api/v2/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
  redirect: 'manual',
});
assert.equal(login.status, 200, `Expected login 200, received ${login.status}.`);
const loginBody = await login.json();
assert.equal(loginBody.user.username, username);
assert.equal(loginBody.user.role, 'super_admin');
assert.ok(loginBody.csrfToken);

const setCookies = typeof login.headers.getSetCookie === 'function'
  ? login.headers.getSetCookie()
  : [login.headers.get('set-cookie')].filter(Boolean);
const cookie = setCookies.map((value) => value.split(';', 1)[0]).join('; ');
assert.match(cookie, /lb_session=/);
assert.match(cookie, /lb_csrf=/);
const sessionCookie = setCookies.find((value) => value.startsWith('lb_session='));
assert.match(sessionCookie, /HttpOnly/i);
assert.match(sessionCookie, /SameSite=Strict/i);
assert.match(sessionCookie, /Path=\//i);

const session = await fetch(`${origin}/api/v2/auth/session`, { headers: { Cookie: cookie }, redirect: 'manual' });
assert.equal(session.status, 200);
const sessionBody = await session.json();
assert.equal(sessionBody.authenticated, true);

const protectedPage = await fetch(`${origin}/admin/dashboard`, { headers: { Cookie: cookie }, redirect: 'manual' });
assert.equal(protectedPage.status, 200);
const unauthenticatedPage = await fetch(`${origin}/admin/dashboard`, { redirect: 'manual' });
assert.equal(unauthenticatedPage.status, 302);
assert.equal(unauthenticatedPage.headers.get('location'), '/admin/login');

const stats = await fetch(`${origin}/api/v2/admin/stats`, { headers: { Cookie: cookie }, redirect: 'manual' });
assert.equal(stats.status, 200);
const statsBody = await stats.json();
assert.equal(statsBody.totalProjects, 8);

const invalidLogin = await fetch(`${origin}/api/v2/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password: `${password}-invalid` }),
});
assert.equal(invalidLogin.status, 401);
assert.equal((await invalidLogin.json()).error.code, 'INVALID_CREDENTIALS');

const legacyLogin = await fetch(`${origin}/api/admin/login`, { method: 'POST' });
assert.equal(legacyLogin.status, 410);

const logout = await fetch(`${origin}/api/v2/auth/logout`, {
  method: 'POST',
  headers: { Cookie: cookie, 'X-CSRF-Token': loginBody.csrfToken },
});
assert.equal(logout.status, 200);
const revokedSession = await fetch(`${origin}/api/v2/auth/session`, { headers: { Cookie: cookie } });
assert.equal(revokedSession.status, 401);

process.stdout.write(`${JSON.stringify({
  status: 'ok',
  login: 200,
  session: 200,
  protectedPage: 200,
  unauthenticatedRedirect: 302,
  databaseDashboard: 200,
  invalidCredentials: 401,
  legacyAuthDisabled: 410,
  logoutRevokesSession: true,
})}\n`);
