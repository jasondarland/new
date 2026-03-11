import { execSync } from 'node:child_process';

try {
  // Best-effort only; never block dependency installation.
  execSync('node scripts/ensure-d1-binding.mjs', { stdio: 'inherit' });
} catch (error) {
  console.warn('postinstall-safe: ensure-d1-binding failed, but install will continue.');
}
process.exit(0);
