import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const base = readFileSync('wrangler.toml', 'utf8');
const name = process.env.D1_DATABASE_NAME || 'ssi_d1';
const binding = process.env.D1_BINDING_NAME || 'DB';
const migrations = process.env.D1_MIGRATIONS_DIR || 'db/migrations';

function resolveId() {
  if (process.env.D1_DATABASE_ID) return process.env.D1_DATABASE_ID;
  const out = execSync('npx wrangler d1 list --json', { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  const list = JSON.parse(out);
  const found = list.find((d) => d.name === name);
  if (!found?.uuid) throw new Error(`Unable to resolve D1 uuid for database '${name}'.`);
  return found.uuid;
}

const id = resolveId();
const d1Block = `\n[[d1_databases]]\nbinding = "${binding}"\ndatabase_name = "${name}"\ndatabase_id = "${id}"\nmigrations_dir = "${migrations}"\n`;

let config = base.replace(/\n\[\[d1_databases\]\][\s\S]*?(?=\n\[\[|\n\[|$)/g, '\n');
if (config.includes('\n[[r2_buckets]]')) {
  config = config.replace('\n[[r2_buckets]]', `${d1Block}\n[[r2_buckets]]`);
} else {
  config += d1Block;
}

writeFileSync('.wrangler-ci.toml', config);
console.log(`Using D1 ${name} (${id}) bound as ${binding}`);
execSync('npx wrangler deploy --config .wrangler-ci.toml', { stdio: 'inherit' });
