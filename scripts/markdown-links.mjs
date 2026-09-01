import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ignoredDirectories = new Set(['.git', 'node_modules', 'coverage', 'dist']);

async function collectMarkdown(directory = '.') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectMarkdown(path)));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}

const files = await collectMarkdown();
for (const file of files) {
  const result = spawnSync('markdown-link-check', ['-q', '-c', '.markdown-link-check.json', file], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Markdown links passed for ${files.length} files.`);
