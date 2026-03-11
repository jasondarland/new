import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  JWT_ISSUER: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_VERIFY_URL: string;
}

type Vars = { user?: any };

const app = new Hono<{ Bindings: Env; Variables: Vars }>();
app.use('/api/*', cors());

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8), turnstileToken: z.string().min(8) });

const signer = (secret: string) => new TextEncoder().encode(secret);

async function verifyTurnstile(c: any, token: string) {
  const formData = new FormData();
  formData.append('secret', c.env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  const res = await fetch(c.env.TURNSTILE_VERIFY_URL, { method: 'POST', body: formData });
  const body = (await res.json()) as { success: boolean };
  return body.success;
}

app.use('/api/*', async (c, next) => {
  const token = getCookie(c, 'ssi_session');
  if (token) {
    try {
      const jwt = await jwtVerify(token, signer(c.env.JWT_SECRET));
      c.set('user', jwt.payload);
    } catch {
      deleteCookie(c, 'ssi_session');
    }
  }
  await next();
});

app.get('/api/health', (c) => c.json({ ok: true, service: 'ssi-platform' }));

app.post('/api/auth/login', async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.text('Invalid payload', 400);
  if (!(await verifyTurnstile(c, parsed.data.turnstileToken))) return c.text('Turnstile verification failed', 403);

  const user = await c.env.DB.prepare(
    'SELECT u.id,u.email,u.full_name,r.slug as role,u.company_id FROM users u JOIN roles r ON r.id=u.role_id WHERE u.email=? AND u.password_hash=? AND u.status="active"'
  ).bind(parsed.data.email.toLowerCase(), parsed.data.password).first();

  if (!user) return c.text('Invalid credentials', 401);

  const token = await new SignJWT({ sub: user.id, email: user.email, fullName: user.full_name, role: user.role, companyId: user.company_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(c.env.JWT_ISSUER)
    .setExpirationTime('12h')
    .sign(signer(c.env.JWT_SECRET));

  setCookie(c, 'ssi_session', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/' });
  await c.env.DB.prepare('INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata_json,created_at) VALUES (lower(hex(randomblob(16))),?,?,"session",?,"{}",datetime("now"))')
    .bind(user.id, 'login', user.id).run();
  return c.json({ ok: true });
});

app.post('/api/auth/logout', async (c) => {
  deleteCookie(c, 'ssi_session');
  return c.json({ ok: true });
});

app.get('/api/auth/me', async (c) => {
  const user = c.get('user');
  if (!user) return c.text('Unauthorized', 401);
  return c.json({ user });
});

function requireAuth(c: any) {
  const user = c.get('user');
  if (!user) return c.text('Unauthorized', 401);
  return null;
}

app.get('/api/dashboard', async (c) => {
  const auth = requireAuth(c); if (auth) return auth;
  const stats = await c.env.DB.prepare(
    'SELECT (SELECT count(*) FROM projects) projects, (SELECT count(*) FROM tickets WHERE status IN ("open","in_progress")) openTickets, (SELECT count(*) FROM tasks WHERE status!="done") pendingTasks'
  ).first();
  return c.json(stats);
});

app.get('/api/projects', async (c) => {
  const auth = requireAuth(c); if (auth) return auth;
  const rows = await c.env.DB.prepare('SELECT id,name,status,start_date,end_date FROM projects ORDER BY updated_at DESC').all();
  return c.json(rows.results ?? []);
});

app.get('/api/projects/:id', async (c) => {
  const auth = requireAuth(c); if (auth) return auth;
  const id = c.req.param('id');
  const project = await c.env.DB.prepare('SELECT * FROM projects WHERE id=?').bind(id).first();
  if (!project) return c.text('Not found', 404);
  const [milestones, tasks, contacts, docs, downloads, licenses, tickets, commissioning, activity] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM milestones WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM tasks WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM contacts WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM files WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM downloads WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM licenses WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM tickets WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM commissioning_items WHERE project_id=?').bind(id).all(),
    c.env.DB.prepare('SELECT * FROM activity_logs WHERE project_id=? ORDER BY created_at DESC LIMIT 100').bind(id).all()
  ]);
  return c.json({ project, milestones: milestones.results, tasks: tasks.results, contacts: contacts.results, documents: docs.results, downloads: downloads.results, licenses: licenses.results, tickets: tickets.results, commissioning: commissioning.results, activity: activity.results });
});

app.post('/api/licenses/:id/reissue', async (c) => {
  const auth = requireAuth(c); if (auth) return auth;
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE licenses SET status="reissued", updated_at=datetime("now") WHERE id=?').bind(id).run();
  return c.json({ ok: true });
});

app.put('/api/files/:key', async (c) => {
  const auth = requireAuth(c); if (auth) return auth;
  const key = c.req.param('key');
  const body = await c.req.arrayBuffer();
  await c.env.R2.put(key, body, { httpMetadata: { contentType: c.req.header('content-type') || 'application/octet-stream' } });
  return c.json({ ok: true, key });
});

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
