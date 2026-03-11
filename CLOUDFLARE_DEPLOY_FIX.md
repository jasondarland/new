# Cloudflare Workers Builds: Fix for `binding DB of type d1 must have a valid id` (10021)

If you still see:

- `Failed to match Worker name ... using "ssi-platform", expected "new"`
- build command shown as `> vite build` (instead of your chained scripts)
- `binding DB of type d1 must have a valid id [10021]`

then Cloudflare is deploying stale branch settings and/or stale binding metadata.

## 1) Force correct branch + latest commit
1. Cloudflare Dashboard → Workers & Pages → your project (`new`) → Settings → Builds.
2. Confirm **Production branch** is the branch containing latest commit.
3. Disconnect and reconnect the Git repo if branch value looks correct but logs still show old behavior.
4. Trigger a new deployment.

## 2) Set deploy command to repo script
In Settings → Builds:
- Build command: `npm run build`
- Deploy command: `npm run deploy:ci`

`deploy:ci` writes a temporary `.wrangler-ci.toml` with a concrete D1 `database_id`
then runs `wrangler deploy --config .wrangler-ci.toml`.

## 3) Recreate D1 binding metadata (required when 10021 persists)
1. Worker `new` → Settings → Bindings.
2. Delete D1 binding `DB`.
3. Re-add D1 binding:
   - Binding: `DB`
   - Database: `ssi_d1` (correct DB)
4. Save and redeploy.

## 4) Optional: force exact D1 id from env
In Workers Builds environment variables, set:
- `D1_DATABASE_ID=<your_d1_uuid>`

This bypasses auto-lookup and is the most deterministic fix.

## 5) What success looks like in logs
- No worker-name mismatch warning.
- Deploy command is `npm run deploy:ci`.
- You should see output similar to: `Using D1 ssi_d1 (<uuid>) bound as DB`.
- No `10021` validation error.
