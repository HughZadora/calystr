import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';
import {
  ENGINEERING_CONFIGURATION_SEQUENCE,
  resolveEngineeringConfiguration
} from '../../standard/engineering/toolchain.mjs';

test('compiled standard exposes current toolchain discovery as a core pre-configuration rule', async () => {
  const output = await compileIntent('Customer booking and online payment SaaS');
  assert.deepEqual(output.compiled.engineering.initialization.sequence, ENGINEERING_CONFIGURATION_SEQUENCE);
  assert.equal(output.compiled.engineering.initialization.sourcePolicy, 'official-current-support-first');
  assert.equal(output.compiled.engineering.initialization.versionPolicy, 'no-unverified-template-defaults');
  assert.equal(output.compiled.engineering.initialization.generationPolicy, 'single-pass-after-complete-resolution');
  assert.ok(output.compiled.standard.requiredOutcomes.includes('engineering.current-supported-toolchain-resolved-before-configuration'));
});

test('engineering configuration resolution rejects incomplete discovery', () => {
  assert.throws(
    () =>
      resolveEngineeringConfiguration({
        currentDate: '2026-09-01',
        platform: 'github-actions/ubuntu-24.04',
        officialSupport: { node: '24' },
        runtimeRequirements: { node: '>=24' }
      }),
    /dependencyCompatibility/
  );
});

test('engineering configuration becomes ready only after compatibility is resolved', () => {
  const resolved = resolveEngineeringConfiguration({
    currentDate: '2026-09-01',
    platform: 'github-actions/ubuntu-24.04',
    officialSupport: { node: '24', githubActionsRuntime: 'node24' },
    runtimeRequirements: { node: '>=24' },
    dependencyCompatibility: { piCodingAgent: '0.84.4' }
  });

  assert.equal(resolved.status, 'READY_TO_GENERATE');
  assert.equal(resolved.compatibilityPolicy, 'runtime-and-dependencies-must-resolve-before-generation');
  assert.equal(resolved.commodityGatePolicy, 'mainstream-stack-native-tools-first-no-hand-rolled-gates');
});
