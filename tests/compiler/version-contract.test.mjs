import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';

test('compiled product exposes independent schema, standard, compiler, source and harness versions', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  const { compiled } = output;

  assert.equal(compiled.versions.schema, compiled.schemaVersion);
  assert.equal(compiled.versions.standard, compiled.standard.identity.version);
  assert.equal(compiled.versions.compiler, compiled.compilerVersion);
  assert.equal(compiled.versions.harnessCompatibility, 'pi-v1');
  assert.ok(Object.keys(compiled.versions.sources).length > 0);
  assert.ok(Object.values(compiled.versions.sources).every((version) => version && version !== 'UNKNOWN'));

  for (const key of ['schema', 'policy', 'requirements', 'verification', 'advisor', 'mappings', 'skills']) {
    assert.ok(key in compiled.standard.impact, `missing standard impact key ${key}`);
  }
});
