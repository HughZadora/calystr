const capabilityRules = [
  [/预约|booking|appointment|reservation/i, 'booking'],
  [/支付|付款|payment|pay\b|checkout/i, 'payments'],
  [/登录|账户|account|authentication|auth\b|sign[ -]?in/i, 'authentication'],
  [/后台|admin|administration/i, 'admin'],
  [/通知|notification|email|message/i, 'notifications'],
  [/saas|software as a service/i, 'relational-storage']
];

export function inferCapabilities(intent) {
  const capabilities = capabilityRules.filter(([pattern]) => pattern.test(intent)).map(([, capability]) => capability);
  if (capabilities.includes('booking') && !capabilities.includes('relational-storage')) capabilities.push('relational-storage');
  return [...new Set(capabilities)].sort();
}

export function parseIntent(intent, options = {}) {
  const { projectType = 'saas' } = options;
  if (typeof intent !== 'string' || !intent.trim()) throw new Error('A non-empty user intent is required');
  const capabilities = inferCapabilities(intent);
  const changeClass = options.changeClass ?? (capabilities.includes('payments') ? 'HIGH_RISK' : 'STANDARD');
  const unknowns = [];
  if (capabilities.includes('booking')) {
    unknowns.push('business:booking-cancellation-policy');
    unknowns.push('business:multiple-service-providers');
  }
  return {
    id: 'REQ-001',
    intent: intent.trim(),
    context: { source: 'user-intent', projectType },
    capabilities,
    constraints: ['pi-only-v1', 'mature-solutions-first', 'unknown-never-pass'],
    acceptance: capabilities.map((capability) => `capability:${capability}:verified`),
    risk: capabilities.includes('payments') ? ['financial-transaction'] : [],
    changeClass,
    unknowns
  };
}
