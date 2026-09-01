import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compileIntent } from '../../compiler/index.mjs';
import { initialiseExistingProject } from '../../compiler/package/existing.mjs';

test('project binding locks the exact Standard version and Standard digest', async () => {
  const output = await compileIntent('Customer booking and online payment SaaS');
  assert.deepEqual(Object.keys(output.manifest).sort(), ['digest', 'projectType', 'standard', 'version']);
  assert.deepEqual(Object.keys(output.lock).sort(), ['digest', 'standard', 'version']);
  assert.equal(output.lock.standard, output.manifest.standard);
  assert.equal(output.lock.version, output.manifest.version);
  assert.equal(output.lock.digest, output.manifest.digest);
  assert.match(output.manifest.digest, /^sha256:[a-f0-9]{64}$/);
  assert.match(output.artifactDigest, /^sha256:[a-f0-9]{64}$/);
  assert.notEqual(output.artifactDigest, output.manifest.digest);
});

test('existing project initialization detects repository facts before recommending a Standard', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'calystr-existing-'));
  try {
    await writeFile(
      join(cwd, 'package.json'),
      JSON.stringify({
        name: 'booking-app',
        description: 'Existing booking application',
        dependencies: {
          next: '1.0.0',
          stripe: '1.0.0',
          pg: '1.0.0',
          'next-auth': '1.0.0'
        }
      })
    );
    await writeFile(join(cwd, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');

    const gitEvidence = {
      kind: 'git',
      claim: 'repository-revision-observed',
      source: 'git',
      runner: 'git',
      status: 'PASS',
      scope: { commit: 'abc123' }
    };
    const result = await initialiseExistingProject({
      cwd,
      collectGit: () => gitEvidence,
      assess: async (input) => ({ verdict: 'UNKNOWN', targetRevision: input.targetRevision })
    });

    assert.equal(result.inspection.project.projectType, 'web');
    assert.equal(result.inspection.project.packageManager, 'pnpm');
    assert.ok(result.inspection.capabilities.includes('payments'));
    assert.ok(result.inspection.capabilities.includes('authentication'));
    assert.ok(result.inspection.capabilities.includes('relational-storage'));
    assert.ok(result.inspection.capabilities.includes('api'));
    assert.equal(result.standardRecommendation.changeClass, 'HIGH_RISK');
    assert.equal(result.initialAssessment.verdict, 'UNKNOWN');
    assert.equal(result.binding.manifest.projectType, 'web');
    assert.deepEqual(result.existingEvidence, [gitEvidence]);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
