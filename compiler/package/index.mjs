import { createHash } from 'node:crypto';

export function packageCompiledProduct(compiled) {
  const serialised = JSON.stringify(compiled);
  const digest = `sha256:${createHash('sha256').update(serialised).digest('hex')}`;
  return {
    manifest: {
      standard: compiled.standard.identity.name,
      version: compiled.standard.identity.version,
      digest,
      projectType: compiled.requirement.context.projectType,
      schemaVersion: compiled.schemaVersion,
      compilerVersion: compiled.compilerVersion,
      harness: 'pi'
    },
    compiled
  };
}
