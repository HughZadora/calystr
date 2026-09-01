import { readFile } from 'node:fs/promises';
import { requiredHarnessCapabilities } from '../adapters/pi/runtime-contract.mjs';
import { engineeringConfigurationContract } from './engineering/toolchain.mjs';

const catalogueUrl = new URL('./catalog.json', import.meta.url);

export async function loadStandardCatalogue() {
  return JSON.parse(await readFile(catalogueUrl, 'utf8'));
}

export async function composeStandard({
  id = '@calystr/std-commercial-product',
  version = '1.0.0',
  profile = 'commercial-product',
  changeClass = 'STANDARD'
} = {}) {
  const catalogue = await loadStandardCatalogue();
  const base = catalogue.profiles[profile];
  const change = catalogue.changeClasses[changeClass];
  if (!base) throw new Error(`Unknown standard profile: ${profile}`);
  if (!change) throw new Error(`Unknown change class: ${changeClass}`);

  return Object.freeze({
    identity: { name: id, version },
    profile,
    changeClass,
    requiredOutcomes: [...base.requiredOutcomes],
    requiredQuality: [...base.requiredQuality],
    requiredVerification: [...base.requiredVerification],
    requiredEvidence: [...change.requiredEvidence],
    requiredReview: [...change.requiredReview],
    applicableConstraints: [...base.applicableConstraints],
    engineeringConfiguration: engineeringConfigurationContract(),
    harness: { runtime: 'pi', requiredCapabilities: [...requiredHarnessCapabilities] },
    sourceRefs: [...catalogue.commercialSources]
  });
}
