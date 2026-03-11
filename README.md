# Show Systems International (SSI) Cloudflare Platform

Production-oriented full-stack application for SSI with a polished public marketing site and a secure role-based portal running on **Cloudflare Workers + D1 + R2 + Turnstile**.

## Stack
- React + React Router + Vite (public website + portal UX)
- Cloudflare Workers runtime API (Hono)
- Cloudflare D1 relational schema + migrations + seed data
- Cloudflare R2 for secure files/download objects
- Cloudflare Turnstile verification on auth/contact workflows
- Optional Cloudflare Access for internal-only routes (`/portal/internal/*`)

## Included deliverables
- Full source code under `src/client` and `src/worker`
- D1 migration at `db/migrations/0001_initial.sql`
- Seed data at `db/seed.sql`
- Environment template at `.env.example`
- Cloudflare config at `wrangler.toml`
- Demo accounts listed below

## Feature coverage
### Public website
- Home, About, Products, IMMERSE™, TITAN™, Solutions, Support, Contact, Portal Login routes.

### Portal + RBAC structure
- Role-based navigation and dashboards for:
  - Super Admin
  - Internal Admin
  - Project Manager
  - Engineering
  - Support
  - Sales
  - Installer / Integrator
  - Client Admin
  - Client User
  - Accounting / Licensing Manager

### Core modules represented
1. Dashboard
2. Projects
3. Tasks / Milestones
4. Support Tickets
5. License Key Management
6. Downloads Center
7. Document Management
8. Commissioning / Installation Tracking
9. Client / Company Management
10. User / Role / Permission Admin
11. Activity Logs / Audit Logs
12. Internal Announcements

### Data model
Tables include users, roles, permissions, companies, contacts, projects, project_members, milestones, tasks, tickets (+comments), licenses (+activation history), downloads, files, commissioning items, announcements, sessions, invitations, activity logs, and audit logs.

## Local development
```bash
npm install
npm run dev
```

## D1 setup & migration
1. Create DB in Cloudflare:
   ```bash
   wrangler d1 create ssi_d1
   ```
2. Bind D1 to Worker binding `DB`:
   - Workers Builds / CI: set D1 binding in Cloudflare dashboard (binding name `DB`).
   - Manual Wrangler deploy: add `[[d1_databases]]` with the real `database_id` from `wrangler d1 create`.
3. Apply migration:
   ```bash
   npm run db:migrate
   ```
4. Seed:
   ```bash
   npm run db:seed
   ```

## Deploy to Cloudflare
```bash
npm run build
wrangler deploy
```

### Workers Builds deploy command (recommended)
Set the deploy command in Cloudflare Workers Builds to:
```bash
npm run deploy:ci
```
This command generates `.wrangler-ci.toml` with a real D1 `database_id` before deployment.
You can provide `D1_DATABASE_ID` explicitly, or allow auto-resolution via `wrangler d1 list --json`.


`npm run build` now includes deploy guards:
- `postinstall` also runs `ensure:d1`, so Workers Builds patches a valid D1 id right after dependency install
  (before `npm run build` and before `wrangler deploy`).
- `validate:wrangler` checks worker-name drift / placeholder D1 issues.
- `ensure:d1` auto-resolves the D1 database id for `ssi_d1` via `wrangler d1 list --json`
  and injects a valid `[[d1_databases]]` block before deploy (CI-safe).


### Important CI note (fixes `binding DB of type d1 must have a valid id`)
If you commit a placeholder D1 id, deployment fails at version upload with error `10021`.
Use dashboard-managed D1 binding in CI, or commit only a real id.

### Mandatory Cloudflare dashboard fix for error `10021`
The specific error `binding DB of type d1 must have a valid id` is produced by Cloudflare when the Worker's **dashboard binding metadata** is invalid. This failure occurs even if your repository code is correct.

Do this in Cloudflare Dashboard before redeploying:
1. Go to **Workers & Pages → new → Settings → Bindings**.
2. Remove the existing D1 binding named `DB`.
3. Add D1 binding again with name `DB` and select the real database `ssi_d1`.
4. Save, then redeploy.

If build logs still print `name = "ssi-platform"` or `> vite build` (without `validate:wrangler`), your project is deploying an older branch/commit. Reconnect Workers Builds to the branch containing commit `0e8d8cb` or newer.

### Deployment troubleshooting (if CI still shows `ssi-platform` and D1 `10021`)
If logs still show `name = "ssi-platform"` or `npm run build` runs only `vite build`, Cloudflare is deploying an **older commit/branch**.

1. In Cloudflare Workers Builds, confirm the connected branch is the one containing commit `0e8d8cb` (or newer).
2. Re-run build after reconnecting/syncing the repository branch.
3. In Worker **Settings → Bindings**, delete and recreate D1 binding `DB`, selecting your actual `ssi_d1` database.
4. Verify the deploy logs no longer show worker-name mismatch and no longer report D1 validation `10021`.

Optional build-time vars for D1 auto-resolution:
- `D1_DATABASE_NAME` (default `ssi_d1`)
- `D1_BINDING_NAME` (default `DB`)
- `D1_MIGRATIONS_DIR` (default `db/migrations`)

## Environment variables
Copy `.env.example` and configure in Cloudflare Worker settings/secrets:
- `JWT_SECRET`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`
- `PUBLIC_APP_URL`

Set secrets:
```bash
wrangler secret put JWT_SECRET
wrangler secret put TURNSTILE_SECRET_KEY
```

## Security notes
- Turnstile validation is enforced on login endpoint.
- Auth session is HttpOnly secure cookie.
- Server-side authorization gate required for all `/api/*` portal resources.
- Audit logging seeded and endpoint-integrated for auth events.
- Structure supports strict client isolation by company and role filters (add row-level filters in every query before production launch).
- Configure Cloudflare Access for internal ops routes if required.

## Demo accounts (seed)
Password for all demo users: `DemoPass!123`
- `superadmin@ssi.demo` (Super Admin)
- `pm@ssi.demo` (Project Manager)
- `support@ssi.demo` (Support)
- `clientadmin@ssi.demo` (Client Admin)
- `clientuser@ssi.demo` (Client User)

## Production hardening checklist
- Replace plaintext password demo flow with Argon2 hashing.
- Add company-scoped filters in all query builders.
- Add full CRUD endpoints for every module plus pagination and search.
- Add file malware scan + signed URL pattern for R2.
- Add CSRF and strict rate-limits on auth endpoints.
- Add unit/integration/e2e tests in CI.
