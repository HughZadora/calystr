const businessDecisions = {
  'business:booking-cancellation-policy': {
    id: 'DEC-BOOKING-CANCELLATION',
    question: 'Should customers be allowed to cancel bookings?',
    options: [
      { id: 'allow', label: 'Allow cancellation', tradeOffs: ['better customer control', 'requires cancellation/refund policy'] },
      { id: 'restrict', label: 'Restrict cancellation', tradeOffs: ['simpler fulfilment rules', 'higher support and customer-friction risk'] },
      { id: 'windowed', label: 'Allow cancellation within a defined window', tradeOffs: ['balances customer agency and provider certainty', 'requires time-window rules'] }
    ],
    recommendation: 'windowed',
    reason: 'A defined cancellation window preserves user agency while protecting provider capacity and payment operations.'
  },
  'business:multiple-service-providers': {
    id: 'DEC-MULTI-PROVIDER',
    question: 'Should the product support more than one consultant or service provider?',
    options: [
      { id: 'single', label: 'Single provider', tradeOffs: ['simpler scheduling', 'limits commercial expansion'] },
      { id: 'multiple', label: 'Multiple providers', tradeOffs: ['supports team-based businesses', 'requires provider availability and assignment rules'] }
    ],
    recommendation: 'multiple',
    reason: 'A commercial consultancy SaaS is more reusable when provider identity and availability are modelled from the start.'
  }
};

export function adviseUnknowns(unknowns = []) {
  return unknowns.map((unknown) => {
    const decision = businessDecisions[unknown];
    if (!decision) return { unknown, type: 'business', question: unknown, options: [], recommendation: null, reason: 'Business judgement is required.' };
    return { unknown, type: 'business', ...decision };
  });
}

export function assertBusinessOnlyQuestions(advice) {
  const invalid = advice.filter((item) => item.type !== 'business');
  if (invalid.length) throw new Error('Advisor may only surface business judgement to the user');
  return advice;
}
