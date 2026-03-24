import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(cmd, args) {
  execFileSync(cmd, args, {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

if (process.platform === 'win32') {
  // `npm.cmd` can fail with EINVAL on Windows when the workspace path has spaces.
  run(process.env.comspec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm run build']);
} else {
  run('npm', ['run', 'build']);
}

const distHtml = path.join(__dirname, 'dist', 'index.html');
if (!existsSync(distHtml)) {
  console.error('dist/index.html nao encontrado apos build.');
  process.exit(1);
}

const html = readFileSync(distHtml, 'utf8');
const checks = {
  hasRoot: html.includes('id="root"'),
  hasFincontrolTitle: html.includes('FinControl'),
  hasViteAsset: html.includes('assets/'),
};

console.log(JSON.stringify({ ok: Object.values(checks).every(Boolean), ...checks }));

if (!checks.hasRoot || !checks.hasFincontrolTitle) {
  process.exit(1);
}
