/**
 * TermPilot Data Models
 * Step 1 MVP Input Structure
 */

export const INITIAL_DEAL_STATE = {
  buyerName: '',
  dealValue: '',
  proposedPaymentTermDays: 30, // Default Net 30
  expectedOrderDate: new Date().toISOString().split('T')[0] // Default today's date
};

export const INITIAL_FINANCIAL_PROFILE_STATE = {
  availableCash: '',
  monthlyOperatingExpenses: '',
  upcomingObligations: '',
  existingReceivables: '',
  annualCostOfCapital: ''
};

export const PAYMENT_TERM_PRESETS = [
  { label: 'Net 15', value: 15 },
  { label: 'Net 30', value: 30 },
  { label: 'Net 45', value: 45 },
  { label: 'Net 60', value: 60 },
  { label: 'Net 90', value: 90 }
];
