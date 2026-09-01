import { createHash } from 'node:crypto';

export function evidenceDigest(payload) {
  return `sha256:${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`;
}

export function makeEvidence({ kind, claim, source, runner, status = 'PASS', command, exitCode, artifact, scope = {}, details = {} }) {
  if (!kind || !claim || !source || !runner) throw new Error('Evidence requires kind, claim, source and runner');
  if (!['PASS', 'FAIL', 'UNKNOWN'].includes(status)) throw new Error(`Invalid evidence status: ${status}`);
  const timestamp = new Date().toISOString();
  const payload = { kind, claim, source, runner, status, command, exitCode, artifact, scope, details };
  return Object.freeze({ ...payload, digest: evidenceDigest(payload), timestamp });
}
