import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMappings, mappingsForTarget, validateMappings } from '../../mappings/index.mjs';

test('initial mapping catalogue is valid and covers agent/design sources', async () => {
  const mappings = await loadMappings();
  assert.ok(mappings.length >= 8);
  assert.ok(mappings.some((item) => item.source === 'grill-me'));
  assert.ok(mappings.some((item) => item.source === 'impeccable'));
});

test('target lookup returns only requested mappings', async () => {
  const items = await mappingsForTarget('runtime-contract');
  assert.ok(items.length >= 1);
  assert.ok(items.every((item) => item.target === 'runtime-contract'));
});

test('duplicate mapping ids fail validation', () => {
  assert.throws(() => validateMappings([
    { id: 'X', source: 'a', sourceLayer: 'agent', concept: 'c', target: 't', meaning: 'm', outputs: ['o'] },
    { id: 'X', source: 'b', sourceLayer: 'agent', concept: 'c', target: 't', meaning: 'm', outputs: ['o'] }
  ]));
});
