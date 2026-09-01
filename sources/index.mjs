import { readFile } from 'node:fs/promises';

const catalogueUrl = new URL('./catalog.json', import.meta.url);
const allowedLayers = new Set(['agent', 'design', 'commercial', 'verification']);

export async function loadSourceCatalogue() {
  const sources = JSON.parse(await readFile(catalogueUrl, 'utf8'));
  validateSources(sources);
  return sources;
}

export function validateSources(sources) {
  const ids = new Set();
  for (const source of sources) {
    for (const field of ['id', 'layer', 'reference', 'provenance', 'reuse', 'version', 'licenceStatus']) {
      if (!source[field]) throw new Error(`Source metadata missing ${field}`);
    }
    if (!allowedLayers.has(source.layer)) throw new Error(`Invalid source layer: ${source.layer}`);
    if (ids.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    ids.add(source.id);
  }
  return sources;
}

export async function sourceById(id) {
  return (await loadSourceCatalogue()).find((source) => source.id === id) ?? null;
}
