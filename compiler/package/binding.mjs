import { createHash } from 'node:crypto';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, canonical(value[key])])
    );
  }
  return value;
}

export function digestStandard(standard) {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonical(standard))).digest('hex')}`;
}

export function validateProjectBinding({ manifest, lock }) {
  for (const field of ['standard', 'version', 'digest']) {
    if (!manifest?.[field] || !lock?.[field]) throw new Error(`Project binding requires ${field}`);
    if (manifest[field] !== lock[field]) throw new Error(`Project manifest/lock mismatch for ${field}`);
  }
  if (!manifest.projectType) throw new Error('Project manifest requires projectType');
  return Object.freeze({ manifest, lock });
}

export function createProjectBinding({ standard, projectType }) {
  if (!standard?.identity?.name || !standard?.identity?.version) {
    throw new Error('Project binding requires a versioned Standard');
  }
  if (!projectType) throw new Error('Project binding requires projectType');

  const digest = digestStandard(standard);
  const manifest = Object.freeze({
    standard: standard.identity.name,
    version: standard.identity.version,
    digest,
    projectType
  });
  const lock = Object.freeze({ standard: manifest.standard, version: manifest.version, digest: manifest.digest });
  return validateProjectBinding({ manifest, lock });
}
