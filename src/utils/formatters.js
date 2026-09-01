/**
 * Currency & Formatting Utilities for B2B Financial Terms
 */

/**
 * Format numeric value into Indian Rupee (₹) currency string
 * e.g. 1500000 -> ₹15,00,000
 */
export const formatINR = (value) => {
  if (value === null || value === undefined || value === '') return '₹0';
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

/**
 * Format percentage value
 * e.g. 14.5 -> 14.5%
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '0%';
  const num = Number(value);
  if (isNaN(num)) return '0%';
  return `${num}%`;
};

/**
 * Format date string into human readable B2B format
 * e.g. '2026-09-15' -> '15 Sep 2026'
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);
};
