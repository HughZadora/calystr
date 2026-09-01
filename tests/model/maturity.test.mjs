import test from 'node:test';
import assert from 'node:assert/strict';
import {
  commercialMaturityDimensions,
  commercialMaturityProfile,
  maturityLevels
} from '../../standard/commercial/maturity.mjs';

test('commercial maturity keeps eight independent dimensions and no aggregate-score authority', () => {
  const profile = commercialMaturityProfile({ projectType: 'saas', changeClass: 'STANDARD' });
  assert.deepEqual(profile.dimensions, commercialMaturityDimensions);
  assert.equal(profile.dimensions.length, 8);
  assert.deepEqual(profile.levels, maturityLevels);
  assert.equal(profile.aggregateScoreAuthority, false);
  assert.equal(profile.decisionAuthority, 'opa');
  assert.ok(profile.dimensions.every((dimension) => profile.targets[dimension] === 'COMMERCIAL'));
});

test('critical changes raise security, reliability and operability maturity targets without hiding other dimensions', () => {
  const profile = commercialMaturityProfile({ projectType: 'saas', changeClass: 'CRITICAL' });
  assert.equal(profile.targets.security, 'CRITICAL');
  assert.equal(profile.targets.reliability, 'CRITICAL');
  assert.equal(profile.targets.operability, 'CRITICAL');
  assert.equal(profile.targets.functional, 'COMMERCIAL');
  assert.equal(Object.keys(profile.weights).length, 8);
});
