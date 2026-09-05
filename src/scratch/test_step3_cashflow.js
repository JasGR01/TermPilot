import { calculateFinancialMetrics } from '../engine/financialEngine.js';
import { evaluateFinancialDecision } from '../engine/decisionEngine.js';
import { calculateCashFlowMetrics } from '../engine/cashFlowEngine.js';
import { validateDealAnalysisForm } from '../utils/validation.js';

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

console.log('=== STEP 3 FINAL QA & FREEZE TEST SUITE ===\n');

// -------------------------------------------------------------------------
// 1. BENCHMARK SHORTFALL COST TEST
// Fulfillment = 15L, Cash = 12L, Oblig = 4L => Liquidity = 8L, Shortfall = 7L
// Gap = 60 days, CoC = 14.5% => Carrying Cost ≈ ₹16,685, Daily Cost ≈ ₹278/day
// -------------------------------------------------------------------------
console.log('--- 1. Benchmark Shortfall Carrying Cost Test ---');
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

const step2Metrics1 = calculateFinancialMetrics(benchmarkPayload);
const step3Metrics1 = calculateCashFlowMetrics(benchmarkPayload, step2Metrics1);

assert(step3Metrics1.estimatedFulfillmentCost === 1500000, 'Fulfillment requirement = 1,500,000');
assert(step3Metrics1.availableLiquidityAfterObligations === 800000, 'Available liquidity after obligations = 800,000');
assert(step3Metrics1.liquidityShortfall === 700000, 'Liquidity shortfall = 700,000');
assert(step3Metrics1.fundingNeed === 700000, 'Funding need = 700,000');
assert(step3Metrics1.fundingGapDays === 60, 'Funding gap = 60 days');

const expectedBenchmarkCarryingCost = (700000 * 0.145 * 60) / 365; // 16684.931506849315
const expectedBenchmarkDailyCost = (700000 * 0.145) / 365; // 278.0821917808219

assert(Math.abs(step3Metrics1.estimatedFulfillmentCarryingCost - expectedBenchmarkCarryingCost) < 0.001, `Estimated carrying cost equals expected benchmark formula (${step3Metrics1.estimatedFulfillmentCarryingCost.toFixed(2)} = 16684.93)`);
assert(Math.round(step3Metrics1.estimatedFulfillmentCarryingCost) === 16685, 'Rounded carrying cost equals ₹16,685');
assert(Math.round(step3Metrics1.dailyFulfillmentCarryingCost) === 278, 'Rounded daily carrying cost equals ₹278/day');

// -------------------------------------------------------------------------
// 2. EDGE-CASE TESTING (A-K)
// -------------------------------------------------------------------------
console.log('\n--- 2. Edge-Case Scenarios A-K ---');

// A. Fully covered (fulfillment < net liquidity)
const scenarioA = {
  deal: { buyerName: 'Client A', dealValue: 2000000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 1000000, fulfillmentPaymentTimingDays: 0 },
  financialProfile: { availableCash: 2000000, monthlyOperatingExpenses: 500000, upcomingObligations: 300000, existingReceivables: 500000, annualCostOfCapital: 12 }
};
const resA = calculateCashFlowMetrics(scenarioA, calculateFinancialMetrics(scenarioA));
assert(resA.availableLiquidityAfterObligations === 1700000, 'A. Net liquidity = 1,700,000');
assert(resA.fundingNeed === 0, 'A. fundingNeed = 0');
assert(resA.estimatedFulfillmentCarryingCost === 0, 'A. funding cost = 0');
assert(resA.coverageStatus === 'COVERED', 'A. status = COVERED');

// B. Exact coverage boundary (fulfillment = net liquidity)
const scenarioB = {
  deal: { buyerName: 'Client B', dealValue: 2000000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 1000000, fulfillmentPaymentTimingDays: 0 },
  financialProfile: { availableCash: 1300000, monthlyOperatingExpenses: 500000, upcomingObligations: 300000, existingReceivables: 500000, annualCostOfCapital: 12 }
};
const resB = calculateCashFlowMetrics(scenarioB, calculateFinancialMetrics(scenarioB));
assert(resB.availableLiquidityAfterObligations === 1000000, 'B. Net liquidity = 1,000,000');
assert(resB.fundingNeed === 0, 'B. fundingNeed = 0');
assert(resB.estimatedFulfillmentCarryingCost === 0, 'B. funding cost = 0');
assert(resB.coverageStatus === 'COVERED', 'B. status = COVERED');

// C. Partial shortfall (fulfillment > net liquidity, net liquidity > 0)
const scenarioC = {
  deal: { buyerName: 'Client C', dealValue: 2000000, proposedPaymentTermDays: 45, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 1200000, fulfillmentPaymentTimingDays: 0 },
  financialProfile: { availableCash: 800000, monthlyOperatingExpenses: 300000, upcomingObligations: 200000, existingReceivables: 500000, annualCostOfCapital: 14 }
};
const resC = calculateCashFlowMetrics(scenarioC, calculateFinancialMetrics(scenarioC));
assert(resC.availableLiquidityAfterObligations === 600000, 'C. Net liquidity = 600,000');
assert(resC.fundingNeed === 600000, 'C. fundingNeed = 600,000');
assert(resC.coverageStatus === 'PARTIALLY COVERED / SHORTFALL', 'C. status = PARTIALLY COVERED / SHORTFALL');

// D. Zero liquidity (available cash = upcoming obligations => net liquidity = 0)
const scenarioD = {
  deal: { buyerName: 'Client D', dealValue: 1000000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 500000, fulfillmentPaymentTimingDays: 0 },
  financialProfile: { availableCash: 400000, monthlyOperatingExpenses: 200000, upcomingObligations: 400000, existingReceivables: 0, annualCostOfCapital: 10 }
};
const resD = calculateCashFlowMetrics(scenarioD, calculateFinancialMetrics(scenarioD));
assert(resD.availableLiquidityAfterObligations === 0, 'D. Net liquidity = 0');
assert(resD.fundingNeed === 500000, 'D. fundingNeed = full fulfillment cost (500,000)');
assert(resD.coverageStatus === 'HIGH FUNDING PRESSURE', 'D. status = HIGH FUNDING PRESSURE');

// E. Negative liquidity (obligations > cash => fundingNeed non-negative)
const scenarioE = {
  deal: { buyerName: 'Client E', dealValue: 1000000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 500000, fulfillmentPaymentTimingDays: 0 },
  financialProfile: { availableCash: 200000, monthlyOperatingExpenses: 200000, upcomingObligations: 500000, existingReceivables: 0, annualCostOfCapital: 10 }
};
const resE = calculateCashFlowMetrics(scenarioE, calculateFinancialMetrics(scenarioE));
assert(resE.availableLiquidityAfterObligations === -300000, 'E. Net liquidity = -300,000');
assert(resE.fundingNeed === 800000, 'E. fundingNeed = 500,000 - (-300,000) = 800,000 (non-negative)');
assert(resE.coverageStatus === 'HIGH FUNDING PRESSURE', 'E. status = HIGH FUNDING PRESSURE');

// F. Payment term presets (Net 15, Net 30, Net 60, Net 90)
[15, 30, 60, 90].forEach((term) => {
  const p = { ...benchmarkPayload, deal: { ...benchmarkPayload.deal, proposedPaymentTermDays: term } };
  const resF = calculateCashFlowMetrics(p, calculateFinancialMetrics(p));
  assert(resF.fundingGapDays === term, `F. Net ${term}: funding gap = ${term} days`);
});

// G. Fulfillment timing variations
// G1. timing = 0
const resG1 = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, fulfillmentPaymentTimingDays: 0 } }, step2Metrics1);
assert(resG1.fundingGapDays === 60, 'G1. timing = 0 => gap = 60');

// G2. timing < payment term (timing 20, term 60 => gap 40)
const resG2 = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, fulfillmentPaymentTimingDays: 20 } }, step2Metrics1);
assert(resG2.fundingGapDays === 40, 'G2. timing = 20 < 60 => gap = 40');

// G3. timing = payment term (timing 60, term 60 => gap 0)
const resG3 = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, fulfillmentPaymentTimingDays: 60 } }, step2Metrics1);
assert(resG3.fundingGapDays === 0, 'G3. timing = 60 = term 60 => gap = 0');

// G4. timing > payment term (timing 75, term 60 => gap 0)
const resG4 = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, fulfillmentPaymentTimingDays: 75 } }, step2Metrics1);
assert(resG4.fundingGapDays === 0, 'G4. timing = 75 > term 60 => gap = 0');

// H. Zero cost of capital
const resH = calculateCashFlowMetrics({ ...benchmarkPayload, financialProfile: { ...benchmarkPayload.financialProfile, annualCostOfCapital: 0 } }, step2Metrics1);
assert(resH.estimatedFulfillmentCarryingCost === 0, 'H. 0% CoC: carrying cost = 0');
assert(resH.dailyFulfillmentCarryingCost === 0, 'H. 0% CoC: daily cost = 0');

// I. High cost of capital (100%)
const resI = calculateCashFlowMetrics({ ...benchmarkPayload, financialProfile: { ...benchmarkPayload.financialProfile, annualCostOfCapital: 100 } }, step2Metrics1);
assert(!isNaN(resI.estimatedFulfillmentCarryingCost), 'I. 100% CoC: carrying cost is not NaN');
assert(isFinite(resI.estimatedFulfillmentCarryingCost), 'I. 100% CoC: carrying cost is finite');
assert(Math.abs(resI.estimatedFulfillmentCarryingCost - (700000 * 1.0 * 60 / 365)) < 0.001, 'I. 100% CoC calculation mathematically accurate');

// J. Large numbers (100 Billion INR)
const scenarioJ = {
  deal: { buyerName: 'Mega Corp', dealValue: 100000000000, proposedPaymentTermDays: 90, expectedOrderDate: '2026-09-15', estimatedFulfillmentCost: 60000000000, fulfillmentPaymentTimingDays: 15 },
  financialProfile: { availableCash: 20000000000, monthlyOperatingExpenses: 5000000000, upcomingObligations: 2000000000, existingReceivables: 10000000000, annualCostOfCapital: 14 }
};
const resJ = calculateCashFlowMetrics(scenarioJ, calculateFinancialMetrics(scenarioJ));
assert(!isNaN(resJ.estimatedFulfillmentCarryingCost), 'J. Large numbers: carrying cost is not NaN');
assert(isFinite(resJ.estimatedFulfillmentCarryingCost), 'J. Large numbers: carrying cost is finite');
assert(resJ.fundingNeed === 42000000000, 'J. Large numbers: fundingNeed = 42 Billion');

// K. Fulfillment cost boundary tests
const resK1 = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, estimatedFulfillmentCost: 1 } }, step2Metrics1);
assert(resK1.estimatedFulfillmentCost === 1, 'K1. fulfillment cost = 1 supported');

const resK2 = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, estimatedFulfillmentCost: 2500000 } }, step2Metrics1);
assert(resK2.estimatedFulfillmentCost === 2500000, 'K2. fulfillment cost = deal value supported');

const valK3 = validateDealAnalysisForm({ ...benchmarkPayload.deal, estimatedFulfillmentCost: 3000000 }, benchmarkPayload.financialProfile);
assert(!valK3.isValid, 'K3. fulfillment cost > deal value is rejected by validation');
assert(valK3.errors.estimatedFulfillmentCost === 'Fulfillment cost cannot exceed total deal value.', 'K3. Validation error message is clear');

// -------------------------------------------------------------------------
// 3. DATE CALCULATION TESTING
// -------------------------------------------------------------------------
console.log('\n--- 3. Date Calculation Tests Across Boundaries ---');

// Month Boundary Test (2026-09-15 + 60 days -> 2026-11-14)
const dateMonthBoundary = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, expectedOrderDate: '2026-09-15', proposedPaymentTermDays: 60, fulfillmentPaymentTimingDays: 15 } }, step2Metrics1);
assert(dateMonthBoundary.customerPaymentDate === '2026-11-14', 'Date Month: 2026-09-15 + 60d = 2026-11-14');
assert(dateMonthBoundary.fulfillmentCashOutDate === '2026-09-30', 'Date Month: 2026-09-15 + 15d = 2026-09-30');
assert(dateMonthBoundary.fundingGapDays === 45, 'Date Month: gap = 45 days');

// Year Boundary Test (2026-12-15 + 30 days -> 2027-01-14)
const dateYearBoundary = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, expectedOrderDate: '2026-12-15', proposedPaymentTermDays: 30, fulfillmentPaymentTimingDays: 0 } }, step2Metrics1);
assert(dateYearBoundary.customerPaymentDate === '2027-01-14', 'Date Year: 2026-12-15 + 30d = 2027-01-14');
assert(dateYearBoundary.fulfillmentCashOutDate === '2026-12-15', 'Date Year: 2026-12-15 + 0d = 2026-12-15');

// February Non-Leap Year Test (2027-01-30 + 30 days -> 2027-03-01)
const dateFebNonLeap = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, expectedOrderDate: '2027-01-30', proposedPaymentTermDays: 30, fulfillmentPaymentTimingDays: 0 } }, step2Metrics1);
assert(dateFebNonLeap.customerPaymentDate === '2027-03-01', 'Date Feb Non-Leap: 2027-01-30 + 30d = 2027-03-01');

// February Leap Year Test (2028-01-30 + 30 days -> 2028-02-29)
const dateFebLeap = calculateCashFlowMetrics({ ...benchmarkPayload, deal: { ...benchmarkPayload.deal, expectedOrderDate: '2028-01-30', proposedPaymentTermDays: 30, fulfillmentPaymentTimingDays: 0 } }, step2Metrics1);
assert(dateFebLeap.customerPaymentDate === '2028-02-29', 'Date Feb Leap Year: 2028-01-30 + 30d = 2028-02-29');

// -------------------------------------------------------------------------
// 4. IMPORTANT CARRYING-COST INVARIANTS
// -------------------------------------------------------------------------
console.log('\n--- 4. Carrying-Cost Invariants ---');
assert(resA.estimatedFulfillmentCarryingCost === 0, 'Invariant 1: fundingNeed = 0 => funding cost = 0');
assert(resG3.estimatedFulfillmentCarryingCost === 0, 'Invariant 2: fundingGapDays = 0 => funding cost = 0');
assert(resH.estimatedFulfillmentCarryingCost === 0, 'Invariant 3: CoC = 0 => funding cost = 0');
assert(step3Metrics1.estimatedFulfillmentCarryingCost >= 0, 'Invariant 4: funding cost >= 0');
assert(step3Metrics1.dailyFulfillmentCarryingCost >= 0, 'Invariant 5: daily funding cost >= 0');
assert(isFinite(step3Metrics1.estimatedFulfillmentCarryingCost), 'Invariant 6: funding cost is finite');
assert(isFinite(step3Metrics1.dailyFulfillmentCarryingCost), 'Invariant 7: daily funding cost is finite');
assert(step3Metrics1.estimatedFulfillmentCarryingCost < (1500000 * 0.145 * 60 / 365), 'Invariant 8: cost based on SHORTFALL (₹16,685), not full fulfillment cost (₹35,753)');

console.log(`\nTEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
if (failed > 0) process.exit(1);
