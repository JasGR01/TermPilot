import { calculateFinancialMetrics } from '../engine/financialEngine.js';
import { evaluateFinancialDecision } from '../engine/decisionEngine.js';
import { validateDealAnalysisForm } from '../utils/validation.js';
import { formatINR, formatPercent, formatDate } from '../utils/formatters.js';
import { safeDivide, calculateFinancingCost, calculateDailyCapitalCost, calculateCashRunway, calculateExposureRatioPercent } from '../engine/calculationUtils.js';

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

console.log('--- RUNNING DETERMINISTIC FINANCIAL TEST SUITE ---');

// 1. Standard Realistic Scenario (Baseline)
const baselinePayload = {
  deal: {
    buyerName: 'Acme Corp',
    dealValue: 2500000,
    proposedPaymentTermDays: 60,
    expectedOrderDate: '2026-09-15'
  },
  financialProfile: {
    availableCash: 1200000,
    monthlyOperatingExpenses: 800000,
    upcomingObligations: 400000,
    existingReceivables: 1500000,
    annualCostOfCapital: 14.5
  }
};

const baselineMetrics = calculateFinancialMetrics(baselinePayload);
assert(baselineMetrics.postObligationCash === 800000, 'Post obligation cash = 800,000');
assert(Math.abs(baselineMetrics.cashRunwayMonths - 1.0) < 0.001, 'Cash runway = 1.0 month');
assert(Math.abs(baselineMetrics.dealExposureRatio - 208.333) < 0.1, 'Deal exposure ratio ~ 208.3%');
assert(Math.abs(baselineMetrics.receivableExposureRatio - 125.0) < 0.1, 'Receivable exposure ratio = 125.0%');

const baselineDecision = evaluateFinancialDecision(baselineMetrics);
assert(baselineDecision.riskLevel === 'MODERATE', `Baseline risk level = MODERATE (got ${baselineDecision.riskLevel})`);
assert(baselineDecision.decision === 'NEGOTIATE', `Baseline decision = NEGOTIATE (got ${baselineDecision.decision})`);
assert(baselineDecision.recommendedTermDays === 30, 'Recommended negotiation target = Net 30');
assert(baselineDecision.financialPressureScore === 52, `Financial pressure score = 52 (got ${baselineDecision.financialPressureScore})`);

// 2. Edge Case: Zero Available Cash
const zeroCashPayload = {
  deal: { buyerName: 'Test Buyer', dealValue: 500000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15' },
  financialProfile: { availableCash: 0, monthlyOperatingExpenses: 500000, upcomingObligations: 0, existingReceivables: 0, annualCostOfCapital: 12 }
};
const zeroCashMetrics = calculateFinancialMetrics(zeroCashPayload);
assert(zeroCashMetrics.postObligationCash === 0, 'Zero cash: postObligationCash = 0');
assert(zeroCashMetrics.cashRunwayMonths === 0, 'Zero cash: cashRunwayMonths = 0');
const zeroCashDecision = evaluateFinancialDecision(zeroCashMetrics);
assert(!isNaN(zeroCashDecision.financialPressureScore), 'Zero cash: pressure score is not NaN');
assert(isFinite(zeroCashDecision.financialPressureScore), 'Zero cash: pressure score is finite');
assert(zeroCashDecision.decision !== 'ACCEPT', 'Zero cash: decision is not ACCEPT');

// 3. Edge Case: Zero OpEx (Unlimited Runway)
const zeroOpexPayload = {
  deal: { buyerName: 'Test Buyer', dealValue: 500000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15' },
  financialProfile: { availableCash: 1000000, monthlyOperatingExpenses: 0, upcomingObligations: 200000, existingReceivables: 100000, annualCostOfCapital: 10 }
};
const zeroOpexMetrics = calculateFinancialMetrics(zeroOpexPayload);
assert(zeroOpexMetrics.cashRunwayMonths === 999, 'Zero OpEx: cashRunwayMonths = 999 (Unlimited)');
const zeroOpexDecision = evaluateFinancialDecision(zeroOpexMetrics);
assert(!isNaN(zeroOpexDecision.financialPressureScore), 'Zero OpEx: pressure score is not NaN');

// 4. Edge Case: Obligations > Cash (Negative Post-Obligation Cash)
const deficitPayload = {
  deal: { buyerName: 'Test Buyer', dealValue: 1000000, proposedPaymentTermDays: 30, expectedOrderDate: '2026-09-15' },
  financialProfile: { availableCash: 500000, monthlyOperatingExpenses: 400000, upcomingObligations: 800000, existingReceivables: 200000, annualCostOfCapital: 15 }
};
const deficitMetrics = calculateFinancialMetrics(deficitPayload);
assert(deficitMetrics.postObligationCash === -300000, 'Obligations > Cash: postObligationCash = -300,000');
assert(deficitMetrics.cashRunwayMonths === 0, 'Obligations > Cash: cashRunwayMonths = 0');
const deficitDecision = evaluateFinancialDecision(deficitMetrics);
assert(deficitDecision.decision !== 'ACCEPT', 'Obligations > Cash: decision cannot be ACCEPT');

// 5. Edge Case: Zero Cost of Capital (0%)
const zeroCocPayload = {
  deal: { buyerName: 'Test Buyer', dealValue: 1000000, proposedPaymentTermDays: 45, expectedOrderDate: '2026-09-15' },
  financialProfile: { availableCash: 2000000, monthlyOperatingExpenses: 300000, upcomingObligations: 100000, existingReceivables: 500000, annualCostOfCapital: 0 }
};
const zeroCocMetrics = calculateFinancialMetrics(zeroCocPayload);
assert(zeroCocMetrics.estimatedFinancingCost === 0, '0% CoC: estimatedFinancingCost = 0');
assert(zeroCocMetrics.dailyCapitalCost === 0, '0% CoC: dailyCapitalCost = 0');

// 6. Edge Case: 100% Cost of Capital
const highCocPayload = {
  deal: { buyerName: 'Test Buyer', dealValue: 1000000, proposedPaymentTermDays: 365, expectedOrderDate: '2026-09-15' },
  financialProfile: { availableCash: 5000000, monthlyOperatingExpenses: 500000, upcomingObligations: 0, existingReceivables: 0, annualCostOfCapital: 100 }
};
const highCocMetrics = calculateFinancialMetrics(highCocPayload);
assert(Math.abs(highCocMetrics.estimatedFinancingCost - 1000000) < 0.01, '100% CoC for 365 days = dealValue (1,000,000)');

// 7. Edge Case: Extremely Large Numbers (e.g. 100 Billion INR)
const hugePayload = {
  deal: { buyerName: 'Mega Corp', dealValue: 100000000000, proposedPaymentTermDays: 90, expectedOrderDate: '2026-09-15' },
  financialProfile: { availableCash: 50000000000, monthlyOperatingExpenses: 10000000000, upcomingObligations: 5000000000, existingReceivables: 20000000000, annualCostOfCapital: 15 }
};
const hugeMetrics = calculateFinancialMetrics(hugePayload);
assert(!isNaN(hugeMetrics.estimatedFinancingCost), 'Huge numbers: estimatedFinancingCost is not NaN');
assert(isFinite(hugeMetrics.estimatedFinancingCost), 'Huge numbers: estimatedFinancingCost is finite');
const hugeDecision = evaluateFinancialDecision(hugeMetrics);
assert(!isNaN(hugeDecision.financialPressureScore), 'Huge numbers: pressure score is not NaN');

// 8. Validation Edge Cases
const validCheck1 = validateDealAnalysisForm({ buyerName: '', dealValue: 0, proposedPaymentTermDays: 0, expectedOrderDate: '' }, { availableCash: -1, monthlyOperatingExpenses: -1, upcomingObligations: -1, existingReceivables: -1, annualCostOfCapital: 105 });
assert(!validCheck1.isValid, 'Validation rejects empty/invalid inputs');
assert(Object.keys(validCheck1.errors).length === 11, `Validation catches all 11 invalid fields (got ${Object.keys(validCheck1.errors).length})`);

const validCheck2 = validateDealAnalysisForm({ buyerName: 'A', dealValue: -500, proposedPaymentTermDays: 30.5, expectedOrderDate: 'invalid-date' }, { availableCash: 'abc', monthlyOperatingExpenses: 0, upcomingObligations: 0, existingReceivables: 0, annualCostOfCapital: -5 });
assert(!validCheck2.isValid, 'Validation rejects short buyer, negative deal, float term, invalid date, non-numeric cash, negative CoC');

console.log(`\nTEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
if (failed > 0) process.exit(1);
