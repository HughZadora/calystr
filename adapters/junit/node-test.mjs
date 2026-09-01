import { spawnSync } from 'node:child_process';

export function runNodeTests(paths, { cwd = process.cwd() } = {}) {
  if (!Array.isArray(paths) || paths.length === 0 || paths.some((path) => typeof path !== 'string' || !path)) {
    throw new TypeError('runNodeTests requires one or more test paths');
  }

  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;

  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...paths], {
    cwd,
    env,
    encoding: 'utf8'
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
  return {
    status: result.status ?? 1,
    output,
    stderr: result.stderr ?? '',
    error: result.error ?? null
  };
}
