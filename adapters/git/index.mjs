import { spawnSync } from 'node:child_process';
import { makeEvidence } from '../evidence.mjs';

function git(args, cwd) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (run.error || run.status !== 0) throw new Error(run.error?.message || run.stderr.trim());
  return run.stdout.trim();
}

export function collectGitEvidence({ cwd = process.cwd() } = {}) {
  const commit = git(['rev-parse', 'HEAD'], cwd);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  const dirty = git(['status', '--porcelain'], cwd).length > 0;
  return makeEvidence({
    kind: 'git',
    claim: 'repository-revision-observed',
    source: 'git',
    runner: 'git',
    command: 'git rev-parse HEAD',
    exitCode: 0,
    scope: { commit },
    status: 'PASS',
    details: { branch, dirty }
  });
}
