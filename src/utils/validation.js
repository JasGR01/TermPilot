/**
 * Form Validation Logic for TermPilot Deal Analysis Input
 */

export const validateDealAnalysisForm = (deal, financialProfile) => {
  const errors = {};

  // SECTION 1: PROPOSED DEAL VALIDATION
  // buyerName: required, string >= 2 chars
  if (!deal.buyerName || !deal.buyerName.trim()) {
    errors.buyerName = 'Buyer name is required.';
  } else if (deal.buyerName.trim().length < 2) {
    errors.buyerName = 'Buyer name must be at least 2 characters.';
  }

  // dealValue: number > 0
  const dealValNum = Number(deal.dealValue);
  if (deal.dealValue === '' || deal.dealValue === null || deal.dealValue === undefined) {
    errors.dealValue = 'Deal value is required.';
  } else if (isNaN(dealValNum) || dealValNum <= 0) {
    errors.dealValue = 'Deal value must be a positive number greater than 0.';
  }

  // proposedPaymentTermDays: positive integer > 0
  const termStr = String(deal.proposedPaymentTermDays ?? '').trim();
  const termNum = Number(termStr);
  if (termStr === '') {
    errors.proposedPaymentTermDays = 'Proposed payment term is required.';
  } else if (isNaN(termNum) || !Number.isInteger(termNum) || termNum <= 0) {
    errors.proposedPaymentTermDays = 'Proposed payment term must be a positive integer number of days (e.g. 30).';
  }

  // expectedOrderDate: valid date
  if (!deal.expectedOrderDate) {
    errors.expectedOrderDate = 'Expected order date is required.';
  } else if (isNaN(Date.parse(deal.expectedOrderDate))) {
    errors.expectedOrderDate = 'Expected order date must be a valid date.';
  }

  // SECTION 2: BUSINESS FINANCIAL PROFILE VALIDATION
  // availableCash: number >= 0
  const cashNum = Number(financialProfile.availableCash);
  if (financialProfile.availableCash === '' || financialProfile.availableCash === null || financialProfile.availableCash === undefined) {
    errors.availableCash = 'Available cash is required.';
  } else if (isNaN(cashNum) || cashNum < 0) {
    errors.availableCash = 'Available cash cannot be negative.';
  }

  // monthlyOperatingExpenses: number >= 0
  const opexNum = Number(financialProfile.monthlyOperatingExpenses);
  if (financialProfile.monthlyOperatingExpenses === '' || financialProfile.monthlyOperatingExpenses === null || financialProfile.monthlyOperatingExpenses === undefined) {
    errors.monthlyOperatingExpenses = 'Monthly operating expenses are required.';
  } else if (isNaN(opexNum) || opexNum < 0) {
    errors.monthlyOperatingExpenses = 'Monthly operating expenses cannot be negative.';
  }

  // upcomingObligations: number >= 0
  const obligNum = Number(financialProfile.upcomingObligations);
  if (financialProfile.upcomingObligations === '' || financialProfile.upcomingObligations === null || financialProfile.upcomingObligations === undefined) {
    errors.upcomingObligations = 'Upcoming obligations amount is required.';
  } else if (isNaN(obligNum) || obligNum < 0) {
    errors.upcomingObligations = 'Upcoming obligations cannot be negative.';
  }

  // existingReceivables: number >= 0
  const recvNum = Number(financialProfile.existingReceivables);
  if (financialProfile.existingReceivables === '' || financialProfile.existingReceivables === null || financialProfile.existingReceivables === undefined) {
    errors.existingReceivables = 'Existing receivables amount is required.';
  } else if (isNaN(recvNum) || recvNum < 0) {
    errors.existingReceivables = 'Existing receivables cannot be negative.';
  }

  // annualCostOfCapital: number between 0 and 100
  const cocNum = Number(financialProfile.annualCostOfCapital);
  if (financialProfile.annualCostOfCapital === '' || financialProfile.annualCostOfCapital === null || financialProfile.annualCostOfCapital === undefined) {
    errors.annualCostOfCapital = 'Cost of capital is required.';
  } else if (isNaN(cocNum) || cocNum < 0 || cocNum > 100) {
    errors.annualCostOfCapital = 'Cost of capital rate must be between 0 and 100%.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
