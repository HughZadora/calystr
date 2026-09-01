const IMPACT_KEYS = Object.freeze(['schema', 'policy', 'requirements', 'verification', 'advisor', 'mappings', 'skills']);

function assertVersionDescriptor(descriptor) {
  if (!descriptor?.standard || !descriptor?.version || !descriptor?.digest) {
    throw new Error('Standard version descriptor requires standard, version and digest');
  }
  for (const key of IMPACT_KEYS) {
    if (!(key in (descriptor.impact ?? {}))) throw new Error(`Standard version impact is missing ${key}`);
  }
  return descriptor;
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (!match) throw new Error(`Invalid Standard SemVer: ${version}`);
  return match.slice(1).map(Number);
}

export function classifyVersionChange(fromVersion, toVersion) {
  const from = parseSemver(fromVersion);
  const to = parseSemver(toVersion);
  if (to[0] !== from[0]) return 'MAJOR';
  if (to[1] !== from[1]) return 'MINOR';
  if (to[2] !== from[2]) return 'PATCH';
  return 'NONE';
}

export function analyseStandardUpgrade({ lock, candidate }) {
  assertVersionDescriptor(candidate);
  if (!lock?.standard || !lock?.version || !lock?.digest) throw new Error('Upgrade analysis requires an existing Standard lock');
  if (candidate.standard !== lock.standard) throw new Error('Upgrade candidate must target the currently locked Standard');

  const change = classifyVersionChange(lock.version, candidate.version);
  const changedAreas = IMPACT_KEYS.filter((key) => candidate.impact[key] !== 'none');
  return Object.freeze({
    standard: lock.standard,
    from: { version: lock.version, digest: lock.digest },
    to: { version: candidate.version, digest: candidate.digest },
    change,
    impact: { ...candidate.impact },
    changedAreas,
    requiresMajorApproval: change === 'MAJOR',
    requiresReassessment: change !== 'NONE' || candidate.digest !== lock.digest,
    status: change === 'NONE' && candidate.digest === lock.digest ? 'CURRENT' : 'UPDATE_AVAILABLE'
  });
}

export function applyStandardUpgrade({ manifest, lock, candidate, allowMajor = false }) {
  const analysis = analyseStandardUpgrade({ lock, candidate });
  if (analysis.status === 'CURRENT') return { analysis, manifest, lock, changed: false };
  if (analysis.requiresMajorApproval && !allowMajor) {
    throw new Error('Major Standard upgrade requires explicit --major approval');
  }

  const nextManifest = Object.freeze({
    ...manifest,
    standard: candidate.standard,
    version: candidate.version,
    digest: candidate.digest
  });
  const nextLock = Object.freeze({ standard: candidate.standard, version: candidate.version, digest: candidate.digest });
  return Object.freeze({ analysis, manifest: nextManifest, lock: nextLock, changed: true });
}

export const STANDARD_IMPACT_KEYS = IMPACT_KEYS;
