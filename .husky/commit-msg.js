import { execSync } from 'node:child_process';

const msgFile = process.argv[2];

try {
  execSync(`pnpm exec commitlint --edit ${msgFile}`, {
    stdio: 'inherit',
  });
} catch {
  process.exit(1);
}
