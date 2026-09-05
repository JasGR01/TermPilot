/**
 * Pure Payment Strategy Engine for TermPilot Step 4
 * Evaluates candidate payment structures (current terms, recommended term, 30% upfront variations)
 * to determine funding shortfalls, gap days, carrying costs, and the single optimal strategy.
 *
 * @param {Object} inputContract - { deal: {...}, financialProfile: {...} }
 * @param {Object} financialMetrics - Step 2 calculated metrics
 * @param {Object} decisionResult - Step 2 decision output
 * @param {Object} cashFlowMetrics - Step 3 calculated metrics
 * @returns {Object} strategyResult
 */
export const evaluatePaymentStrategies = (inputContract, financialMetrics, decisionResult, cashFlowMetrics) => {
  if (!inputContract || !inputContract.deal || !inputContract.financialProfile) {
    throw new Error('Invalid input contract provided to paymentStrategyEngine.');
  }

  const { deal, financialProfile } = inputContract;

  const dealValue = Number(deal.dealValue) || 0;
  const proposedPaymentTermDays = Number(deal.proposedPaymentTermDays) || 0;
  const recommendedTermDays = decisionResult?.recommendedTermDays ?? proposedPaymentTermDays;
  const estimatedFulfillmentCost = Number(deal.estimatedFulfillmentCost) || 0;
  const fulfillmentPaymentTimingDays = Math.max(0, Number(deal.fulfillmentPaymentTimingDays) || 0);

  const availableCash = Number(financialProfile.availableCash) || 0;
  const upcomingObligations = Number(financialProfile.upcomingObligations) || 0;
  const annualCostOfCapital = Number(financialProfile.annualCostOfCapital) || 0;

  const availableLiquidityAfterObligations = availableCash - upcomingObligations;

  // 1. Candidate Strategy Definitions
  const candidates = [
    {
      id: 'current_terms',
      label: 'Current Terms',
      upfrontPercentage: 0,
      paymentTermDays: proposedPaymentTermDays
    },
    {
      id: 'recommended_term',
      label: 'Recommended Term',
      upfrontPercentage: 0,
      paymentTermDays: recommendedTermDays
    },
    {
      id: 'upfront30_recommended',
      label: '30% Upfront + Recommended Term',
      upfrontPercentage: 30,
      paymentTermDays: recommendedTermDays
    },
    {
      id: 'upfront30_current',
      label: '30% Upfront + Current Term',
      upfrontPercentage: 30,
      paymentTermDays: proposedPaymentTermDays
    }
  ];

  // 2. Deduplication Rule:
  // Filter candidates so no two strategies have the exact same (upfrontPercentage, paymentTermDays).
  const uniqueCandidates = [];
  const seenKeys = new Set();

  for (const cand of candidates) {
    const key = `${cand.upfrontPercentage}_${cand.paymentTermDays}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueCandidates.push(cand);
    }
  }

  // 3. Strategy Evaluator
  const evaluatedStrategies = uniqueCandidates.map((cand) => {
    const upfrontAmount = dealValue * (cand.upfrontPercentage / 100);
    const remainingAmount = dealValue - upfrontAmount;
    const effectiveLiquidityForFulfillment = availableLiquidityAfterObligations + upfrontAmount;

    // fundingShortfall = max(0, estimatedFulfillmentCost - effectiveLiquidityForFulfillment)
    const fundingShortfall = Math.max(0, estimatedFulfillmentCost - effectiveLiquidityForFulfillment);

    let fundingGapDays = 0;
    let estimatedFundingCost = 0;
    let status = 'COVERED';

    if (fundingShortfall === 0) {
      fundingGapDays = 0;
      estimatedFundingCost = 0;
      status = 'COVERED';
    } else {
      fundingGapDays = Math.max(0, cand.paymentTermDays - fulfillmentPaymentTimingDays);
      const rate = Math.max(0, annualCostOfCapital) / 100;
      estimatedFundingCost = Math.max(0, fundingShortfall * rate * (fundingGapDays / 365));
      status = 'SHORTFALL';
    }

    return {
      id: cand.id,
      label: cand.label,
      upfrontPercentage: cand.upfrontPercentage,
      upfrontAmount,
      remainingAmount,
      paymentTermDays: cand.paymentTermDays,
      fundingShortfall,
      fundingGapDays,
      estimatedFundingCost,
      status
    };
  });

  // 4. Recommendation Priority Comparator
  // 1. Prefer fundingShortfall === 0
  // 2. Among covered strategies, prefer lower upfrontPercentage
  // 3. If no strategy is covered, prefer lower fundingShortfall
  // 4. If still tied, prefer lower estimatedFundingCost
  // 5. Final tie-breaker: prefer shorter paymentTermDays
  const sortedStrategies = [...evaluatedStrategies].sort((a, b) => {
    const aCovered = a.fundingShortfall === 0;
    const bCovered = b.fundingShortfall === 0;

    if (aCovered && !bCovered) return -1;
    if (!aCovered && bCovered) return 1;

    if (aCovered && bCovered) {
      if (a.upfrontPercentage !== b.upfrontPercentage) {
        return a.upfrontPercentage - b.upfrontPercentage;
      }
      if (a.estimatedFundingCost !== b.estimatedFundingCost) {
        return a.estimatedFundingCost - b.estimatedFundingCost;
      }
      return a.paymentTermDays - b.paymentTermDays;
    }

    if (a.fundingShortfall !== b.fundingShortfall) {
      return a.fundingShortfall - b.fundingShortfall;
    }

    if (a.estimatedFundingCost !== b.estimatedFundingCost) {
      return a.estimatedFundingCost - b.estimatedFundingCost;
    }

    return a.paymentTermDays - b.paymentTermDays;
  });

  const recommendedStrategy = sortedStrategies[0];

  // Attach isRecommended flag
  const strategies = evaluatedStrategies.map((s) => ({
    ...s,
    isRecommended: s.id === recommendedStrategy.id
  }));

  // 5. Deterministic Recommendation Reason Generator
  const reason = generateRecommendationReason(recommendedStrategy, proposedPaymentTermDays);

  return {
    strategies,
    recommendedStrategy,
    recommendationReason: reason
  };
};

function generateRecommendationReason(recommendedStrategy, proposedPaymentTermDays) {
  const { label, upfrontPercentage, paymentTermDays, fundingShortfall } = recommendedStrategy;

  if (fundingShortfall === 0) {
    if (upfrontPercentage > 0 && paymentTermDays === proposedPaymentTermDays) {
      return `${label} removes the funding shortfall without requiring a shorter payment term.`;
    }
    if (upfrontPercentage > 0) {
      return `${label} removes the funding shortfall by securing upfront cash.`;
    }
    if (paymentTermDays < proposedPaymentTermDays) {
      return `${label} eliminates the funding shortfall through a shorter credit window without requiring an advance deposit.`;
    }
    return `Current terms already fully cover order fulfillment with zero cash shortfall.`;
  } else {
    if (upfrontPercentage > 0) {
      return `${label} reduces your cash shortfall to ₹${Math.round(fundingShortfall).toLocaleString('en-IN')} and lowers the financing burden.`;
    }
    return `${label} minimizes your cash shortfall to ₹${Math.round(fundingShortfall).toLocaleString('en-IN')}.`;
  }
}
