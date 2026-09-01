import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function capture(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
  return result.stdout.trim();
}

const base = process.env.CALYSTR_QUALITY_BASE || 'HEAD^';
const changed = capture('git', ['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`])
  .split('\n')
  .filter(Boolean)
  .filter((path) => existsSync(path));

const prettierFiles = changed.filter((path) => /\.(?:[cm]?[jt]s|ts|jsonc?|md)$/.test(path));
const eslintFiles = changed.filter((path) => /\.(?:[cm]?js|ts)$/.test(path));
const markdownFiles = changed.filter((path) => path.endsWith('.md'));

if (prettierFiles.length) run('prettier', ['--check', ...prettierFiles]);
if (eslintFiles.length) run('eslint', [...eslintFiles]);
if (markdownFiles.length) run('markdownlint-cli2', [...markdownFiles]);
for (const path of markdownFiles) run('markdown-link-check', ['-q', '-c', '.markdown-link-check.json', path]);

console.log(
  `Quality gates passed for ${changed.length} changed files (${prettierFiles.length} formatted, ${eslintFiles.length} code, ${markdownFiles.length} markdown).`
);
