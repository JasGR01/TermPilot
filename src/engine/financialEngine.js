import {
  calculateFinancingCost,
  calculateDailyCapitalCost,
  calculateCashRunway,
  calculateExposureRatioPercent
} from './calculationUtils';

/**
 * Pure Financial Engine Module for TermPilot
 * Computes transparent financial metrics based on the validated input contract.
 *
 * @param {Object} inputContract - { deal: {...}, financialProfile: {...} }
 * @returns {Object} financialMetrics
 */
export const calculateFinancialMetrics = (inputContract) => {
  if (!inputContract || !inputContract.deal || !inputContract.financialProfile) {
    throw new Error('Invalid input contract provided to financialEngine.');
  }

  const { deal, financialProfile } = inputContract;

  const dealValue = Number(deal.dealValue) || 0;
  const proposedPaymentTermDays = Number(deal.proposedPaymentTermDays) || 0;
  
  const availableCash = Number(financialProfile.availableCash) || 0;
  const monthlyOperatingExpenses = Number(financialProfile.monthlyOperatingExpenses) || 0;
  const upcomingObligations = Number(financialProfile.upcomingObligations) || 0;
  const existingReceivables = Number(financialProfile.existingReceivables) || 0;
  const annualCostOfCapital = Number(financialProfile.annualCostOfCapital) || 0;

  // 1. Post-Obligation Cash
  const postObligationCash = availableCash - upcomingObligations;

  // 2. Cash Runway (Months)
  const cashRunwayMonths = calculateCashRunway(postObligationCash, monthlyOperatingExpenses);

  // 3. Receivable Exposure Ratio (%)
  const receivableExposureRatio = calculateExposureRatioPercent(existingReceivables, availableCash);

  // 4. Deal Exposure Ratio (%)
  const dealExposureRatio = calculateExposureRatioPercent(dealValue, availableCash);

  // 5. Estimated Financing Cost for Proposed Term
  const estimatedFinancingCost = calculateFinancingCost(
    dealValue,
    annualCostOfCapital,
    proposedPaymentTermDays
  );

  // 6. Daily Capital Cost
  const dailyCapitalCost = calculateDailyCapitalCost(
    dealValue,
    annualCostOfCapital
  );

  // 7. Term Cost (Equivalent to financing cost for proposed term)
  const termCost = estimatedFinancingCost;

  return {
    dealValue,
    proposedPaymentTermDays,
    expectedOrderDate: deal.expectedOrderDate,
    buyerName: deal.buyerName,
    availableCash,
    monthlyOperatingExpenses,
    upcomingObligations,
    existingReceivables,
    annualCostOfCapital,
    postObligationCash,
    cashRunwayMonths,
    receivableExposureRatio,
    dealExposureRatio,
    estimatedFinancingCost,
    dailyCapitalCost,
    termCost
  };
};
