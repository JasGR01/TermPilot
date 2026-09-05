import { calculateFinancialMetrics } from '../engine/financialEngine.js';
import { evaluateFinancialDecision } from '../engine/decisionEngine.js';
import { calculateCashFlowMetrics } from '../engine/cashFlowEngine.js';
import { evaluatePaymentStrategies } from '../engine/paymentStrategyEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('=== STEP 4 PAYMENT STRATEGY ENGINE TEST SUITE ===\n');

// Standard Benchmark Payload
const benchmarkPayload = {
  deal: {
    buyerName: 'Acme Corp',
    dealValue: 2500000,
    proposedPaymentTermDays: 60,
    expectedOrderDate: '2026-09-15',
    estimatedFulfillmentCost: 1500000,
    fulfillmentPaymentTimingDays: 0
  },
  financialProfile: {
    availableCash: 1200000,
    monthlyOperatingExpenses: 800000,
    upcomingObligations: 400000,
    existingReceivables: 1500000,
    annualCostOfCapital: 14.5
  }
};

const finMetrics = calculateFinancialMetrics(benchmarkPayload);
const decResult = evaluateFinancialDecision(finMetrics);
const cfMetrics = calculateCashFlowMetrics(benchmarkPayload, finMetrics);
const stratResult = evaluatePaymentStrategies(benchmarkPayload, finMetrics, decResult, cfMetrics);

// -------------------------------------------------------------------------
// 1. Current Terms Calculation Test
// -------------------------------------------------------------------------
console.log('--- 1. Current Terms Calculation ---');
const currentStrat = stratResult.strategies.find((s) => s.id === 'current_terms');
assert(currentStrat !== undefined, 'Current terms strategy exists');
assert(currentStrat.upfrontPercentage === 0, 'Current terms upfront % = 0');
assert(currentStrat.paymentTermDays === 60, 'Current terms payment term = 60');
assert(currentStrat.fundingShortfall === 700000, 'Current terms shortfall = 700,000');
assert(currentStrat.fundingGapDays === 60, 'Current terms gap = 60 days');
assert(Math.round(currentStrat.estimatedFundingCost) === 16685, 'Current terms funding cost = ₹16,685');

// -------------------------------------------------------------------------
// 2. Recommended Term Calculation Test
// -------------------------------------------------------------------------
console.log('\n--- 2. Recommended Term Calculation ---');
const recTermStrat = stratResult.strategies.find((s) => s.id === 'recommended_term');
assert(recTermStrat !== undefined, 'Recommended term strategy exists');
assert(recTermStrat.paymentTermDays === 30, 'Recommended term = 30 days');
assert(recTermStrat.fundingShortfall === 700000, 'Recommended term shortfall = 700,000');
assert(recTermStrat.fundingGapDays === 30, 'Recommended term gap = 30 days');
assert(Math.round(recTermStrat.estimatedFundingCost) === 8342, 'Recommended term funding cost = ₹8,342');

// -------------------------------------------------------------------------
// 3. 30% Upfront Calculation Test
// -------------------------------------------------------------------------
console.log('\n--- 3. 30% Upfront Calculations ---');
const upfrontRecStrat = stratResult.strategies.find((s) => s.id === 'upfront30_recommended');
const upfrontCurrStrat = stratResult.strategies.find((s) => s.id === 'upfront30_current');

assert(upfrontRecStrat.upfrontAmount === 750000, '30% of 2.5M deal = 750,000 upfront');
assert(upfrontRecStrat.remainingAmount === 1750000, 'Remaining deal amount = 1,750,000');

// Effective liquidity = 800,000 net cash + 750,000 upfront = 1,550,000
// Shortfall = max(0, 1,500,000 cost - 1,550,000 eff liq) = 0!
assert(upfrontRecStrat.fundingShortfall === 0, '30% upfront eliminates shortfall (shortfall = 0)');
assert(upfrontRecStrat.status === 'COVERED', '30% upfront status = COVERED');
assert(upfrontRecStrat.estimatedFundingCost === 0, '30% upfront funding cost = 0');
assert(upfrontRecStrat.fundingGapDays === 0, '30% upfront gap days = 0');

// -------------------------------------------------------------------------
// 4 & 5. Upfront Reducing & Eliminating Shortfall Test
// -------------------------------------------------------------------------
console.log('\n--- 4 & 5. Upfront Reducing & Eliminating Shortfall ---');
const partialPayload = {
  ...benchmarkPayload,
  deal: { ...benchmarkPayload.deal, estimatedFulfillmentCost: 2000000 } // cost 20L, net cash 8L, 30% upfront 7.5L => eff liq 15.5L => shortfall 4.5L
};
const pFin = calculateFinancialMetrics(partialPayload);
const pDec = evaluateFinancialDecision(pFin);
const pCf = calculateCashFlowMetrics(partialPayload, pFin);
const pStrat = evaluatePaymentStrategies(partialPayload, pFin, pDec, pCf);

const p30Curr = pStrat.strategies.find((s) => s.id === 'upfront30_current');
assert(p30Curr.fundingShortfall === 450000, '30% upfront reduces 12L shortfall to 4.5L');
assert(p30Curr.status === 'SHORTFALL', 'Status = SHORTFALL when partial shortfall remains');

// -------------------------------------------------------------------------
// 6. No Shortfall From the Beginning Test
// -------------------------------------------------------------------------
console.log('\n--- 6. No Shortfall From Beginning ---');
const coveredPayload = {
  deal: { buyerName: 'Client A', dealValue: 2000000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 1000000, fulfillmentPaymentTimingDays: 0 },
  financialProfile: { availableCash: 2000000, monthlyOperatingExpenses: 500000, upcomingObligations: 300000, existingReceivables: 500000, annualCostOfCapital: 12 }
};
const cFin = calculateFinancialMetrics(coveredPayload);
const cDec = evaluateFinancialDecision(cFin);
const cCf = calculateCashFlowMetrics(coveredPayload, cFin);
const cStrat = evaluatePaymentStrategies(coveredPayload, cFin, cDec, cCf);

assert(cStrat.recommendedStrategy.id === 'current_terms', 'Recommends Current Terms when 0% upfront already covers fulfillment');
assert(cStrat.recommendedStrategy.fundingShortfall === 0, 'Shortfall = 0');
assert(cStrat.recommendationReason.includes('fully cover order fulfillment'), 'Rationale reflects initial zero shortfall');

// -------------------------------------------------------------------------
// 7, 8, 9, 10. Recommendation Logic Priority Tests
// -------------------------------------------------------------------------
console.log('\n--- 7, 8, 9, 10. Recommendation Priority Tests ---');

// In benchmark payload, both 30% upfront options eliminate shortfall (0% shortfall).
// Priority 1 rule: Prefer shortfall 0 (30% upfront options over 0% upfront options).
// Priority 2 rule: Both options use 30% upfront (tied).
// Priority 3 & 4 rules: Both have shortfall = 0 and funding cost = 0 (tied).
// Rule 5 tie-breaker: Selects shorter paymentTermDays (Net 30 over Net 60).
assert(stratResult.recommendedStrategy.fundingShortfall === 0, 'Recommended strategy has shortfall = 0');
assert(stratResult.recommendedStrategy.upfrontPercentage === 30, 'Recommended strategy uses 30% upfront');
assert(stratResult.recommendedStrategy.id === 'upfront30_recommended', 'Rule 5 tie-breaker selects 30% Upfront + Net 30 over Net 60');
assert(stratResult.recommendedStrategy.paymentTermDays === 30, 'Recommended strategy payment term = Net 30');
assert(stratResult.recommendationReason.length > 0, 'Recommendation reason generated');

// -------------------------------------------------------------------------
// 11. Deduplication Rule Test (Current Term = Recommended Term)
// -------------------------------------------------------------------------
console.log('\n--- 11. Deduplication Rule Test ---');
const sameTermPayload = {
  ...benchmarkPayload,
  deal: { ...benchmarkPayload.deal, proposedPaymentTermDays: 30 }
};
const sFin = calculateFinancialMetrics(sameTermPayload);
const sDec = { recommendedTermDays: 30 }; // force recommended term = proposed term = 30
const sCf = calculateCashFlowMetrics(sameTermPayload, sFin);
const sStrat = evaluatePaymentStrategies(sameTermPayload, sFin, sDec, sCf);

// Unique candidate keys: (0%, 30d) and (30%, 30d). Should produce exactly 2 strategies!
assert(sStrat.strategies.length === 2, `Deduplication reduces 4 candidates to 2 unique strategies (got ${sStrat.strategies.length})`);

// -------------------------------------------------------------------------
// 12. Zero Cost of Capital Test
// -------------------------------------------------------------------------
console.log('\n--- 12. Zero Cost of Capital Test ---');
const zeroCocPayload = {
  ...benchmarkPayload,
  financialProfile: { ...benchmarkPayload.financialProfile, annualCostOfCapital: 0 }
};
const zFin = calculateFinancialMetrics(zeroCocPayload);
const zDec = evaluateFinancialDecision(zFin);
const zCf = calculateCashFlowMetrics(zeroCocPayload, zFin);
const zStrat = evaluatePaymentStrategies(zeroCocPayload, zFin, zDec, zCf);

zStrat.strategies.forEach((s) => {
  assert(s.estimatedFundingCost === 0, `0% CoC: strategy ${s.id} funding cost = 0`);
});

// -------------------------------------------------------------------------
// 13. Zero Funding Gap Test
// -------------------------------------------------------------------------
console.log('\n--- 13. Zero Funding Gap Test ---');
const zeroGapPayload = {
  ...benchmarkPayload,
  deal: { ...benchmarkPayload.deal, fulfillmentPaymentTimingDays: 60 } // timing 60 >= term 60
};
const zgFin = calculateFinancialMetrics(zeroGapPayload);
const zgDec = evaluateFinancialDecision(zgFin);
const zgCf = calculateCashFlowMetrics(zeroGapPayload, zgFin);
const zgStrat = evaluatePaymentStrategies(zeroGapPayload, zgFin, zgDec, zgCf);

zgStrat.strategies.forEach((s) => {
  assert(s.fundingGapDays === 0, `Timing = 60: strategy ${s.id} gap days = 0`);
  assert(s.estimatedFundingCost === 0, `Timing = 60: strategy ${s.id} funding cost = 0`);
});

// -------------------------------------------------------------------------
// 14. Fulfillment Timing > Payment Term Test
// -------------------------------------------------------------------------
console.log('\n--- 14. Fulfillment Timing > Payment Term ---');
const lateTimingPayload = {
  ...benchmarkPayload,
  deal: { ...benchmarkPayload.deal, fulfillmentPaymentTimingDays: 90 } // timing 90 > term 60
};
const ltFin = calculateFinancialMetrics(lateTimingPayload);
const ltDec = evaluateFinancialDecision(ltFin);
const ltCf = calculateCashFlowMetrics(lateTimingPayload, ltFin);
const ltStrat = evaluatePaymentStrategies(lateTimingPayload, ltFin, ltDec, ltCf);

ltStrat.strategies.forEach((s) => {
  assert(s.fundingGapDays === 0, `Timing > term: strategy ${s.id} gap days = 0`);
  assert(s.estimatedFundingCost === 0, `Timing > term: strategy ${s.id} funding cost = 0`);
});

// -------------------------------------------------------------------------
// 15. Large Numbers Safety Test
// -------------------------------------------------------------------------
console.log('\n--- 15. Large Numbers Test ---');
const hugePayload = {
  deal: { buyerName: 'Mega Corp', dealValue: 100000000000, proposedPaymentTermDays: 90, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 60000000000, fulfillmentPaymentTimingDays: 15 },
  financialProfile: { availableCash: 20000000000, monthlyOperatingExpenses: 5000000000, upcomingObligations: 2000000000, existingReceivables: 10000000000, annualCostOfCapital: 14 }
};
const hFin = calculateFinancialMetrics(hugePayload);
const hDec = evaluateFinancialDecision(hFin);
const hCf = calculateCashFlowMetrics(hugePayload, hFin);
const hStrat = evaluatePaymentStrategies(hugePayload, hFin, hDec, hCf);

hStrat.strategies.forEach((s) => {
  assert(!isNaN(s.fundingShortfall), `Huge: ${s.id} shortfall is not NaN`);
  assert(isFinite(s.fundingShortfall), `Huge: ${s.id} shortfall is finite`);
  assert(!isNaN(s.estimatedFundingCost), `Huge: ${s.id} cost is not NaN`);
  assert(isFinite(s.estimatedFundingCost), `Huge: ${s.id} cost is finite`);
});

// -------------------------------------------------------------------------
// 16. STEP 2 REGRESSION SUITE EXECUTION
// -------------------------------------------------------------------------
console.log('\n=== STEP 2 REGRESSION TESTS ===');
assert(finMetrics.postObligationCash === 800000, 'Step 2 Reg: postObligationCash = 800,000');
assert(Math.abs(finMetrics.cashRunwayMonths - 1.0) < 0.001, 'Step 2 Reg: cashRunwayMonths = 1.0');
assert(Math.abs(finMetrics.dealExposureRatio - 208.333) < 0.1, 'Step 2 Reg: dealExposureRatio ~ 208.3%');
assert(decResult.financialPressureScore === 52, 'Step 2 Reg: financialPressureScore = 52');
assert(decResult.riskLevel === 'MODERATE', 'Step 2 Reg: riskLevel = MODERATE');
assert(decResult.decision === 'NEGOTIATE', 'Step 2 Reg: decision = NEGOTIATE');
assert(decResult.recommendedTermDays === 30, 'Step 2 Reg: recommendedTermDays = 30');

// -------------------------------------------------------------------------
// 17. STEP 3 REGRESSION SUITE EXECUTION
// -------------------------------------------------------------------------
console.log('\n=== STEP 3 REGRESSION TESTS ===');
assert(cfMetrics.estimatedFulfillmentCost === 1500000, 'Step 3 Reg: estimatedFulfillmentCost = 1,500,000');
assert(cfMetrics.availableLiquidityAfterObligations === 800000, 'Step 3 Reg: availableLiquidityAfterObligations = 800,000');
assert(cfMetrics.liquidityShortfall === 700000, 'Step 3 Reg: liquidityShortfall = 700,000');
assert(cfMetrics.fundingGapDays === 60, 'Step 3 Reg: fundingGapDays = 60');
assert(Math.round(cfMetrics.estimatedFulfillmentCarryingCost) === 16685, 'Step 3 Reg: carryingCost = ₹16,685');

console.log(`\nTEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
if (failed > 0) process.exit(1);
