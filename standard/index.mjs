import { readFile } from 'node:fs/promises';
import { requiredHarnessCapabilities } from '../adapters/pi/runtime-contract.mjs';
import { engineeringConfigurationContract } from './engineering/toolchain.mjs';
import { commercialMaturityProfile } from './commercial/maturity.mjs';

const catalogueUrl = new URL('./catalog.json', import.meta.url);
const initialImpact = Object.freeze({
  schema: 'initial',
  policy: 'initial',
  requirements: 'initial',
  verification: 'initial',
  advisor: 'initial',
  mappings: 'initial',
  skills: 'initial'
});

function contextualEvidence(projectType) {
  return ['web', 'saas'].includes(projectType) ? ['design'] : [];
}

export async function loadStandardCatalogue() {
  return JSON.parse(await readFile(catalogueUrl, 'utf8'));
}

export async function composeStandard({
  id = '@calystr/std-commercial-product',
  version = '1.0.0',
  profile = 'commercial-product',
  changeClass = 'STANDARD',
  projectType = 'saas',
  impact = initialImpact
} = {}) {
  const catalogue = await loadStandardCatalogue();
  const base = catalogue.profiles[profile];
  const change = catalogue.changeClasses[changeClass];
  if (!base) throw new Error(`Unknown standard profile: ${profile}`);
  if (!change) throw new Error(`Unknown change class: ${changeClass}`);

  return Object.freeze({
    identity: { name: id, version },
    impact: { ...impact },
    profile,
    projectType,
    changeClass,
    requiredOutcomes: [...base.requiredOutcomes],
    requiredQuality: [...base.requiredQuality],
    requiredVerification: [...base.requiredVerification],
    requiredEvidence: [...new Set([...change.requiredEvidence, ...contextualEvidence(projectType)])],
    requiredReview: [...change.requiredReview],
    applicableConstraints: [...base.applicableConstraints],
    maturity: commercialMaturityProfile({ projectType, changeClass }),
    engineeringConfiguration: engineeringConfigurationContract(),
    harness: { runtime: 'pi', compatibility: 'pi-v1', requiredCapabilities: [...requiredHarnessCapabilities] },
    sourceRefs: [...catalogue.commercialSources]
  });
}
