import { createHash } from 'node:crypto';
import { createProjectBinding } from './binding.mjs';

export function packageCompiledProduct(compiled) {
  const serialised = JSON.stringify(compiled);
  const artifactDigest = `sha256:${createHash('sha256').update(serialised).digest('hex')}`;
  const binding = createProjectBinding({
    standard: compiled.standard,
    projectType: compiled.requirement.context.projectType
  });
  return {
    manifest: binding.manifest,
    lock: binding.lock,
    artifactDigest,
    compiled
  };
}
