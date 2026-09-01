import { makeEvidence } from '../evidence.mjs';

export function cyclonedxToEvidence(input, { commit, artifact = 'bom.json' } = {}) {
  const bom = typeof input === 'string' ? JSON.parse(input) : input;
  if (bom.bomFormat !== 'CycloneDX') throw new Error('Invalid CycloneDX BOM');
  const components = Array.isArray(bom.components) ? bom.components : [];
  return makeEvidence({
    kind: 'sbom',
    claim: 'software-bill-of-materials',
    source: 'cyclonedx',
    runner: 'cyclonedx-adapter',
    artifact,
    scope: { commit },
    status: 'PASS',
    details: { specVersion: bom.specVersion, components: components.length }
  });
}
