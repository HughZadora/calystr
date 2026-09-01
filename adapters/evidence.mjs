import { createHash } from 'node:crypto';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, canonical(value[key])]));
  }
  return value;
}

export function evidenceDigest(payload) {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonical(payload))).digest('hex')}`;
}

export function makeEvidence({ kind, claim, source, runner, status = 'PASS', command, exitCode, artifact, scope = {}, details = {}, timestamp = new Date().toISOString() }) {
  if (!kind || !claim || !source || !runner) throw new Error('Evidence requires kind, claim, source and runner');
  if (!['PASS', 'FAIL', 'UNKNOWN'].includes(status)) throw new Error(`Invalid evidence status: ${status}`);
  const payload = { kind, claim, source, runner, status, command, exitCode, artifact, scope, details, timestamp };
  return Object.freeze({ ...payload, digest: evidenceDigest(payload) });
}

export function verifyEvidenceIntegrity(evidence) {
  if (!evidence?.digest) return false;
  const { digest, ...payload } = evidence;
  return digest === evidenceDigest(payload);
}

const trustedProviders = Object.freeze({
  git: [['git', 'git']],
  tests: [['junit', 'junit-adapter']],
  security: [['sarif', 'sarif-adapter']],
  sbom: [['cyclonedx', 'cyclonedx-adapter']],
  operations: [['operations-verification', 'calystr-operations-verifier']]
});

export function isTrustedEvidence(evidence) {
  const providers = trustedProviders[evidence?.kind] ?? [];
  return providers.some(([source, runner]) => evidence.source === source && evidence.runner === runner);
}

export function annotateEvidenceForAssessment(evidence) {
  return { ...evidence, integrityValid: verifyEvidenceIntegrity(evidence), trusted: isTrustedEvidence(evidence) };
}
