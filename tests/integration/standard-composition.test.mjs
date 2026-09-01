import test from 'node:test';
import assert from 'node:assert/strict';
import { composeStandard } from '../../standard/index.mjs';

test('commercial standard is Pi-only and carries frozen invariants', async () => {
  const standard = await composeStandard();
  assert.equal(standard.harness.runtime, 'pi');
  assert.ok(standard.applicableConstraints.includes('requirement-derived-coverage'));
  assert.ok(standard.applicableConstraints.includes('unknown-never-pass'));
});

test('critical change class increases evidence and review requirements', async () => {
  const standard = await composeStandard({ changeClass: 'CRITICAL' });
  assert.ok(standard.requiredEvidence.includes('release-provenance'));
  assert.ok(standard.requiredReview.includes('human'));
});
