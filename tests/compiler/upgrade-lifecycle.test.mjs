import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyseStandardUpgrade, applyStandardUpgrade } from '../../standard/versioning.mjs';
import { checkProjectUpgrade, upgradeProject } from '../../compiler/package/upgrade.mjs';

const impact = Object.freeze({
  schema: 'none',
  policy: 'changed',
  requirements: 'none',
  verification: 'changed',
  advisor: 'none',
  mappings: 'none',
  skills: 'none'
});

function candidate(version = '1.1.0') {
  return {
    standard: '@calystr/std-commercial-product',
    version,
    digest: `sha256:${version.replaceAll('.', '').padEnd(64, '0')}`,
    impact,
    standardDefinition: {
      identity: { name: '@calystr/std-commercial-product', version },
      requiredEvidence: ['git', 'tests', 'security']
    }
  };
}

test('upgrade analysis reports semantic version change and affected Standard areas', () => {
  const analysis = analyseStandardUpgrade({
    lock: { standard: '@calystr/std-commercial-product', version: '1.0.0', digest: 'sha256:old' },
    candidate: candidate('1.1.0')
  });
  assert.equal(analysis.change, 'MINOR');
  assert.equal(analysis.status, 'UPDATE_AVAILABLE');
  assert.deepEqual(analysis.changedAreas, ['policy', 'verification']);
  assert.equal(analysis.requiresMajorApproval, false);
  assert.equal(analysis.requiresReassessment, true);
});

test('major Standard upgrades require explicit approval', () => {
  const manifest = {
    standard: '@calystr/std-commercial-product',
    version: '1.0.0',
    digest: 'sha256:old',
    projectType: 'web'
  };
  const lock = { standard: manifest.standard, version: manifest.version, digest: manifest.digest };
  assert.throws(() => applyStandardUpgrade({ manifest, lock, candidate: candidate('2.0.0') }), /--major/);
  const approved = applyStandardUpgrade({ manifest, lock, candidate: candidate('2.0.0'), allowMajor: true });
  assert.equal(approved.manifest.version, '2.0.0');
  assert.equal(approved.lock.version, '2.0.0');
});

test('check-upgrades is read-only and upgrade rewrites only binding before reassessment', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'calystr-upgrade-'));
  try {
    await mkdir(join(cwd, '.calystr'));
    const manifest = {
      standard: '@calystr/std-commercial-product',
      version: '1.0.0',
      digest: 'sha256:old',
      projectType: 'web'
    };
    const lock = { standard: manifest.standard, version: manifest.version, digest: manifest.digest };
    await writeFile(join(cwd, '.calystr/manifest.json'), JSON.stringify(manifest));
    await writeFile(join(cwd, '.calystr/lock.json'), JSON.stringify(lock));
    const candidatePath = join(cwd, 'candidate.json');
    await writeFile(candidatePath, JSON.stringify(candidate('1.1.0')));

    const checked = await checkProjectUpgrade({ cwd, candidatePath });
    assert.equal(checked.analysis.change, 'MINOR');
    assert.equal(JSON.parse(await readFile(join(cwd, '.calystr/lock.json'), 'utf8')).version, '1.0.0');

    const result = await upgradeProject({
      cwd,
      candidatePath,
      collectGit: () => ({ scope: { commit: 'abc123' } }),
      assess: async (input) => ({ verdict: 'UNKNOWN', targetRevision: input.targetRevision })
    });
    assert.equal(result.changed, true);
    assert.equal(result.reassessment.verdict, 'UNKNOWN');
    assert.equal(result.migration.required, true);
    assert.equal(JSON.parse(await readFile(join(cwd, '.calystr/manifest.json'), 'utf8')).version, '1.1.0');
    assert.equal(JSON.parse(await readFile(join(cwd, '.calystr/lock.json'), 'utf8')).version, '1.1.0');
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
