import { readFile } from 'node:fs/promises';

const catalogueUrl = new URL('./catalog.json', import.meta.url);

export async function loadMappings() {
  const mappings = JSON.parse(await readFile(catalogueUrl, 'utf8'));
  validateMappings(mappings);
  return mappings;
}

export function validateMappings(mappings) {
  const ids = new Set();
  for (const mapping of mappings) {
    for (const key of ['id', 'source', 'sourceLayer', 'concept', 'target', 'meaning']) {
      if (!mapping[key]) throw new Error(`Mapping missing ${key}`);
    }
    if (ids.has(mapping.id)) throw new Error(`Duplicate mapping id: ${mapping.id}`);
    ids.add(mapping.id);
    if (!Array.isArray(mapping.outputs) || mapping.outputs.length === 0) throw new Error(`Mapping ${mapping.id} must declare outputs`);
  }
}

export async function mappingsForTarget(target) {
  return (await loadMappings()).filter((mapping) => mapping.target === target);
}
