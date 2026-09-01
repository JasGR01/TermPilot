/**
 * Calculation Utilities for TermPilot Financial Engine
 * Pure mathematical functions for financing costs, runways, and exposure ratios.
 */

/**
 * Safe division helper to prevent NaN or Infinity issues
 * @param {number} numerator 
 * @param {number} denominator 
 * @param {number} fallback 
 * @returns {number}
 */
export const safeDivide = (numerator, denominator, fallback = 0) => {
  const num = Number(numerator);
  const den = Number(denominator);
  if (isNaN(num) || isNaN(den) || den === 0) {
    return fallback;
  }
  return num / den;
};

/**
 * Calculate estimated financing cost for a given payment term in days
 * Formula: dealValue * (annualCostOfCapital / 100) * (days / 365)
 * @param {number} dealValue 
 * @param {number} annualCostOfCapitalPercent (e.g. 14.5)
 * @param {number} days (e.g. 45)
 * @returns {number}
 */
export const calculateFinancingCost = (dealValue, annualCostOfCapitalPercent, days) => {
  const val = Number(dealValue) || 0;
  const rate = (Number(annualCostOfCapitalPercent) || 0) / 100;
  const termDays = Number(days) || 0;

  if (val <= 0 || rate <= 0 || termDays <= 0) {
    return 0;
  }

  return val * rate * (termDays / 365);
};

/**
 * Calculate daily cost of capital for a deal value
 * Formula: dealValue * (annualCostOfCapital / 100) / 365
 * @param {number} dealValue 
 * @param {number} annualCostOfCapitalPercent 
 * @returns {number}
 */
export const calculateDailyCapitalCost = (dealValue, annualCostOfCapitalPercent) => {
  const val = Number(dealValue) || 0;
  const rate = (Number(annualCostOfCapitalPercent) || 0) / 100;

  if (val <= 0 || rate <= 0) {
    return 0;
  }

  return (val * rate) / 365;
};

/**
 * Calculate cash runway in months based on post-obligation cash and monthly OpEx
 * @param {number} postObligationCash 
 * @param {number} monthlyOpEx 
 * @returns {number} (returns Infinity/999 if OpEx is 0 and cash > 0)
 */
export const calculateCashRunway = (postObligationCash, monthlyOpEx) => {
  const cash = Number(postObligationCash) || 0;
  const opex = Number(monthlyOpEx) || 0;

  if (cash <= 0) return 0;
  if (opex <= 0) return 999; // Represents unlimited runway if OpEx is 0

  return cash / opex;
};

/**
 * Calculate exposure ratio as a percentage
 * Formula: (amount / baseCash) * 100
 * @param {number} amount 
 * @param {number} baseCash 
 * @returns {number}
 */
export const calculateExposureRatioPercent = (amount, baseCash) => {
  const amt = Number(amount) || 0;
  const base = Number(baseCash) || 0;

  if (base <= 0) return amt > 0 ? 999 : 0;

  return (amt / base) * 100;
};
