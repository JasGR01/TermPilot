import { formatDate } from '../utils/formatters.js';

/**
 * Pure Cash-Flow & Funding Gap Engine for TermPilot Step 3
 * Computes fulfillment cash-out timing, funding gap duration, liquidity shortfall,
 * shortfall funding carrying costs, and coverage status.
 *
 * @param {Object} inputContract - { deal: {...}, financialProfile: {...} }
 * @param {Object} financialMetrics - Step 2 calculated metrics
 * @returns {Object} cashFlowMetrics
 */
export const calculateCashFlowMetrics = (inputContract, financialMetrics) => {
  if (!inputContract || !inputContract.deal || !inputContract.financialProfile) {
    throw new Error('Invalid input contract provided to cashFlowEngine.');
  }

  const { deal, financialProfile } = inputContract;

  const dealValue = Number(deal.dealValue) || 0;
  const proposedPaymentTermDays = Number(deal.proposedPaymentTermDays) || 0;
  const expectedOrderDateStr = deal.expectedOrderDate;
  const estimatedFulfillmentCost = Number(deal.estimatedFulfillmentCost) || 0;
  const fulfillmentPaymentTimingDays = Math.max(0, Number(deal.fulfillmentPaymentTimingDays) || 0);

  const availableCash = Number(financialProfile.availableCash) || 0;
  const upcomingObligations = Number(financialProfile.upcomingObligations) || 0;
  const monthlyOperatingExpenses = Number(financialProfile.monthlyOperatingExpenses) || 0;
  const annualCostOfCapital = Number(financialProfile.annualCostOfCapital) || 0;

  // A. Customer Payment Date (Date Object & Formatted String)
  const orderDateObj = new Date(expectedOrderDateStr);
  const isValidOrderDate = !isNaN(orderDateObj.getTime());
  
  let customerPaymentDateObj = null;
  let customerPaymentDateStr = expectedOrderDateStr;
  if (isValidOrderDate) {
    customerPaymentDateObj = new Date(orderDateObj);
    customerPaymentDateObj.setDate(customerPaymentDateObj.getDate() + proposedPaymentTermDays);
    customerPaymentDateStr = customerPaymentDateObj.toISOString().split('T')[0];
  }

  // B. Fulfillment Cash-Out Date (Date Object & Formatted String)
  let fulfillmentCashOutDateObj = null;
  let fulfillmentCashOutDateStr = expectedOrderDateStr;
  if (isValidOrderDate) {
    fulfillmentCashOutDateObj = new Date(orderDateObj);
    fulfillmentCashOutDateObj.setDate(fulfillmentCashOutDateObj.getDate() + fulfillmentPaymentTimingDays);
    fulfillmentCashOutDateStr = fulfillmentCashOutDateObj.toISOString().split('T')[0];
  }

  // C. Funding Gap Duration (Days)
  // Rule: max(0, proposedPaymentTermDays - fulfillmentPaymentTimingDays)
  const rawGapDays = proposedPaymentTermDays - fulfillmentPaymentTimingDays;
  const fundingGapDays = Math.max(0, rawGapDays);

  // D. Estimated Fulfillment Requirement
  const estimatedFundingRequirement = estimatedFulfillmentCost;

  // E. Available Liquidity After Existing Obligations
  const availableLiquidityAfterObligations = availableCash - upcomingObligations;

  // F. Liquidity Shortfall / Funding Need
  // max(0, estimatedFulfillmentCost - availableLiquidityAfterObligations)
  const liquidityShortfall = Math.max(0, estimatedFulfillmentCost - availableLiquidityAfterObligations);
  const fundingNeed = liquidityShortfall;

  // G. Estimated Cost of Funding Shortfall
  // Model Correction: Calculated strictly on UNFUNDED SHORTFALL (fundingNeed), NOT full fulfillment cost.
  // Formula: fundingNeed * (annualCostOfCapital / 100) * (fundingGapDays / 365)
  const rate = Math.max(0, annualCostOfCapital) / 100;
  const estimatedFulfillmentCarryingCost = Math.max(0, fundingNeed * rate * (fundingGapDays / 365));
  const dailyFulfillmentCarryingCost = Math.max(0, (fundingNeed * rate) / 365);

  // H. Coverage Status Classification
  // Deterministic Thresholds:
  // - COVERED: liquidityShortfall === 0 AND availableLiquidityAfterObligations > 0
  // - PARTIALLY COVERED / SHORTFALL: liquidityShortfall > 0 AND availableLiquidityAfterObligations > 0
  // - HIGH FUNDING PRESSURE: availableLiquidityAfterObligations <= 0 OR liquidityShortfall >= estimatedFulfillmentCost
  let coverageStatus = 'COVERED';
  let coverageStatusLabel = 'COVERED BY INTERNAL LIQUIDITY';

  if (availableLiquidityAfterObligations <= 0 || liquidityShortfall >= estimatedFulfillmentCost) {
    coverageStatus = 'HIGH FUNDING PRESSURE';
    coverageStatusLabel = 'HIGH FUNDING PRESSURE';
  } else if (liquidityShortfall > 0) {
    coverageStatus = 'PARTIALLY COVERED / SHORTFALL';
    coverageStatusLabel = 'PARTIALLY COVERED / SHORTFALL';
  } else {
    coverageStatus = 'COVERED';
    coverageStatusLabel = 'COVERED BY INTERNAL LIQUIDITY';
  }

  // Deterministic Explanation Generator
  const explanations = generateCashFlowExplanations({
    dealValue,
    estimatedFulfillmentCost,
    fulfillmentPaymentTimingDays,
    proposedPaymentTermDays,
    fundingGapDays,
    availableCash,
    upcomingObligations,
    availableLiquidityAfterObligations,
    liquidityShortfall,
    fundingNeed,
    annualCostOfCapital,
    estimatedFulfillmentCarryingCost,
    dailyFulfillmentCarryingCost,
    coverageStatus,
    expectedOrderDateStr,
    fulfillmentCashOutDateStr,
    customerPaymentDateStr
  });

  return {
    expectedOrderDate: expectedOrderDateStr,
    fulfillmentPaymentTimingDays,
    proposedPaymentTermDays,
    fulfillmentCashOutDate: fulfillmentCashOutDateStr,
    customerPaymentDate: customerPaymentDateStr,
    fundingGapDays,
    estimatedFulfillmentCost,
    estimatedFundingRequirement,
    availableCash,
    upcomingObligations,
    availableLiquidityAfterObligations,
    liquidityShortfall,
    fundingNeed,
    annualCostOfCapital,
    estimatedFulfillmentCarryingCost,
    dailyFulfillmentCarryingCost,
    coverageStatus,
    coverageStatusLabel,
    explanations
  };
};

/**
 * Deterministic Explanation Builder for Step 3 (Updated Rationale Model)
 */
function generateCashFlowExplanations(params) {
  const {
    estimatedFulfillmentCost,
    fulfillmentPaymentTimingDays,
    proposedPaymentTermDays,
    fundingGapDays,
    availableLiquidityAfterObligations,
    liquidityShortfall,
    fundingNeed,
    annualCostOfCapital,
    estimatedFulfillmentCarryingCost,
    coverageStatus,
    fulfillmentCashOutDateStr,
    customerPaymentDateStr
  } = params;

  const costFormatted = `₹${Math.round(estimatedFulfillmentCost).toLocaleString('en-IN')}`;
  const liquidityFormatted = `₹${Math.round(availableLiquidityAfterObligations).toLocaleString('en-IN')}`;
  const shortfallFormatted = `₹${Math.round(liquidityShortfall).toLocaleString('en-IN')}`;
  const carryingCostFormatted = `₹${Math.round(estimatedFulfillmentCarryingCost).toLocaleString('en-IN')}`;

  const bullets = [];

  // Bullet 1: Order fulfillment requirement
  bullets.push(
    `Order fulfillment requires an estimated ${costFormatted} in cash.`
  );

  // Bullet 2: Liquidity availability after obligations
  bullets.push(
    `Net liquidity available after obligations is ${liquidityFormatted}.`
  );

  // Bullet 3: Shortfall / funding need
  if (liquidityShortfall > 0) {
    bullets.push(
      `Therefore, approximately ${shortfallFormatted} of the fulfillment requirement remains unfunded by internal liquidity.`
    );
  } else {
    bullets.push(
      `Available liquidity after obligations fully covers the ${costFormatted} fulfillment requirement without an internal cash shortfall.`
    );
  }

  // Bullet 4: Timeline gap
  if (fundingGapDays > 0) {
    bullets.push(
      `The buyer pays after ${proposedPaymentTermDays} days (${formatDate(customerPaymentDateStr)}) while fulfillment cash is required on Day ${fulfillmentPaymentTimingDays} (${formatDate(fulfillmentCashOutDateStr)}), creating a ${fundingGapDays}-day funding gap.`
    );
  } else {
    bullets.push(
      `Fulfillment cash outflow occurs on or after customer payment date, resulting in zero funding gap days.`
    );
  }

  // Bullet 5: Shortfall funding cost calculation
  if (fundingGapDays > 0 && liquidityShortfall > 0 && annualCostOfCapital > 0) {
    bullets.push(
      `Funding the ${shortfallFormatted} shortfall for ${fundingGapDays} days at the stated ${annualCostOfCapital}% annual cost of capital produces an estimated funding cost of approximately ${carryingCostFormatted}.`
    );
  } else if (liquidityShortfall === 0) {
    bullets.push(
      `Because internal liquidity covers fulfillment, the estimated cost of funding a shortfall is ₹0.`
    );
  } else if (fundingGapDays === 0) {
    bullets.push(
      `Because customer payment precedes or aligns with fulfillment cash-out, the funding gap is 0 days, resulting in an estimated funding cost of ₹0.`
    );
  } else {
    bullets.push(
      `At a 0% cost of capital, the estimated cost of funding the shortfall is ₹0.`
    );
  }

  // Bullet 6: Guidance / No prescription
  bullets.push(
    `TermPilot provides decision support and does not prescribe a specific financing product.`
  );

  return bullets;
}
