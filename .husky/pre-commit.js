import { execSync } from 'node:child_process';

try {
  execSync('pnpm format', { stdio: 'inherit' });
} catch {
  process.exit(1);
}
