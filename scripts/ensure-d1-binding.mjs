import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

process.exitCode = 0;
process.on('uncaughtException', (err) => {
  console.warn(`ensure-d1-binding uncaughtException: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(0);
});
process.on('unhandledRejection', (err) => {
  console.warn(`ensure-d1-binding unhandledRejection: ${String(err)}`);
  process.exit(0);
});

const WRANGLER_FILE = 'wrangler.toml';
const BINDING = process.env.D1_BINDING_NAME || 'DB';
const DB_NAME = process.env.D1_DATABASE_NAME || 'ssi_d1';
const MIGRATIONS_DIR = process.env.D1_MIGRATIONS_DIR || 'db/migrations';

function warn(message) {
  console.warn(`${message}\nContinuing (ensure-d1-binding never fails CI install).`);
}

function getD1IdByName(name) {
  try {
    const stdout = execSync('npx wrangler d1 list --json', { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    const list = JSON.parse(stdout);
    return list.find((db) => db.name === name)?.uuid || null;
  } catch {
    return null;
  }
}

try {
  const text = readFileSync(WRANGLER_FILE, 'utf8');
  const existingBlockRegex = /\[\[d1_databases\]\][\s\S]*?(?=\n\[\[|\n\[|$)/g;
  const existingBlocks = [...text.matchAll(existingBlockRegex)].map((m) => m[0]);

  const hasValid = existingBlocks.some((block) => {
    const binding = block.match(/binding\s*=\s*"([^"]+)"/)?.[1];
    const id = block.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
    return binding === BINDING && id && id !== 'replace-with-d1-id';
  });

  if (hasValid) {
    console.log(`D1 binding ${BINDING} already has a valid database_id in ${WRANGLER_FILE}.`);
    process.exit(0);
  }

  const d1Id = process.env.D1_DATABASE_ID || getD1IdByName(DB_NAME);
  if (!d1Id) {
    warn(`Could not resolve D1 database id for '${DB_NAME}'. Ensure Wrangler is authenticated and DB exists.`);
    process.exit(0);
  }

  const newBlock = `\n[[d1_databases]]\nbinding = "${BINDING}"\ndatabase_name = "${DB_NAME}"\ndatabase_id = "${d1Id}"\nmigrations_dir = "${MIGRATIONS_DIR}"\n`;

  let updated = text;
  if (existingBlocks.length > 0) {
    updated = updated.replace(existingBlockRegex, (block) => {
      const binding = block.match(/binding\s*=\s*"([^"]+)"/)?.[1];
      return binding === BINDING ? '' : block;
    });
  }

  if (updated.includes('\n[[r2_buckets]]')) {
    updated = updated.replace('\n[[r2_buckets]]', `${newBlock}\n[[r2_buckets]]`);
  } else {
    updated += `\n${newBlock}`;
  }

  writeFileSync(WRANGLER_FILE, updated);
  console.log(`Injected valid D1 binding (${BINDING} -> ${DB_NAME}/${d1Id}) into ${WRANGLER_FILE}.`);
  process.exit(0);
} catch (error) {
  warn(`ensure-d1-binding failed unexpectedly: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(0);
}
