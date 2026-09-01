import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadSourceCatalogue } from '../../sources/index.mjs';
import { loadMappings } from '../../mappings/index.mjs';

test('every initial mapping resolves to registered source provenance', async () => {
  const sourceIds = new Set((await loadSourceCatalogue()).map((source) => source.id));
  const agentAndDesign = await loadMappings();
  const commercial = JSON.parse(await readFile(new URL('../../mappings/commercial/catalog.json', import.meta.url), 'utf8'));
  for (const mapping of [...agentAndDesign, ...commercial]) {
    assert.ok(sourceIds.has(mapping.source), `unregistered mapping source: ${mapping.source}`);
  }
});

test('restricted standards are reference-and-mapping only', async () => {
  const sources = await loadSourceCatalogue();
  const restricted = sources.filter((source) => source.licenceStatus === 'restricted-standard');
  assert.ok(restricted.length > 0);
  assert.ok(restricted.every((source) => source.reuse === 'reference-and-mapping-only'));
});
