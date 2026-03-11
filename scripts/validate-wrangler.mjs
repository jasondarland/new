import { readFileSync } from 'node:fs';

const file = 'wrangler.toml';
const text = readFileSync(file, 'utf8');

const errors = [];

if (/database_id\s*=\s*"replace-with-d1-id"/.test(text)) {
  errors.push('Found placeholder D1 database_id in wrangler.toml. Remove it or set a real D1 id.');
}

const nameMatch = text.match(/^name\s*=\s*"([^"]+)"/m);
if (!nameMatch) {
  errors.push('Missing Worker name in wrangler.toml.');
} else if (nameMatch[1] !== 'new') {
  errors.push(`Worker name is "${nameMatch[1]}" but connected CI expects "new".`);
}

if (errors.length) {
  console.error('\nWrangler config validation failed:\n');
  for (const err of errors) console.error(`- ${err}`);
  console.error('\nFix wrangler.toml before deploying.\n');
  process.exit(1);
}

console.log('Wrangler config validation passed.');
