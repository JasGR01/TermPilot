import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, TrendingUp, AlertCircle, Percent, ArrowUpRight, Coins, ChevronDown, ChevronUp } from 'lucide-react';

export const FinancialProfileSection = ({ profile, errors, onChange }) => {
  // Check if any profile error exists to auto-expand
  const hasProfileError = Boolean(
    errors.availableCash ||
    errors.monthlyOperatingExpenses ||
    errors.upcomingObligations ||
    errors.existingReceivables ||
    errors.annualCostOfCapital
  );

  const [isOpen, setIsOpen] = useState(false);

  // Auto-expand if validation error triggers in financial profile
  useEffect(() => {
    if (hasProfileError) {
      setIsOpen(true);
    }
  }, [hasProfileError]);

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem' }}>
      {/* Collapsible Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="section-icon" style={{ background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)' }}>
            <Landmark size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Financial Details & Cash Position</span>
              <span style={{
                fontSize: '0.725rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-main)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)'
              }}>
                5 fields
              </span>
            </h2>
            <p className="section-desc">Liquidity, monthly operating expenses, short-term obligations & hurdle rate</p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: 'var(--accent-blue)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <span>{isOpen ? 'Hide details' : 'Edit details'}</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Collapsible Fields Area */}
      {isOpen && (
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {/* Available Cash */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="availableCash" className="form-label">
              <Wallet size={15} color="var(--text-muted)" />
              Available Cash Reserves (INR)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="availableCash"
                type="number"
                min="0"
                step="any"
                className={`form-input has-prefix ${errors.availableCash ? 'has-error' : ''}`}
                placeholder="e.g. 1200000"
                value={profile.availableCash}
                onChange={(e) => onChange('availableCash', e.target.value)}
              />
            </div>
            {errors.availableCash ? (
              <span className="error-text">
                <AlertCircle size={13} /> {errors.availableCash}
              </span>
            ) : (
              <span className="form-helper">Liquid cash & bank balances immediately available.</span>
            )}
          </div>

          {/* Monthly Operating Expenses */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="monthlyOperatingExpenses" className="form-label">
              <Coins size={15} color="var(--text-muted)" />
              Monthly Operating Expenses (OpEx)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="monthlyOperatingExpenses"
                type="number"
                min="0"
                step="any"
                className={`form-input has-prefix ${errors.monthlyOperatingExpenses ? 'has-error' : ''}`}
                placeholder="e.g. 800000"
                value={profile.monthlyOperatingExpenses}
                onChange={(e) => onChange('monthlyOperatingExpenses', e.target.value)}
              />
            </div>
            {errors.monthlyOperatingExpenses ? (
              <span className="error-text">
                <AlertCircle size={13} /> {errors.monthlyOperatingExpenses}
              </span>
            ) : (
              <span className="form-helper">Average monthly fixed costs (payroll, rent, overhead).</span>
            )}
          </div>

          {/* Upcoming Obligations */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="upcomingObligations" className="form-label">
              <AlertCircle size={15} color="var(--text-muted)" />
              Upcoming Short-Term Obligations
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="upcomingObligations"
                type="number"
                min="0"
                step="any"
                className={`form-input has-prefix ${errors.upcomingObligations ? 'has-error' : ''}`}
                placeholder="e.g. 400000"
                value={profile.upcomingObligations}
                onChange={(e) => onChange('upcomingObligations', e.target.value)}
              />
            </div>
            {errors.upcomingObligations ? (
              <span className="error-text">
                <AlertCircle size={13} /> {errors.upcomingObligations}
              </span>
            ) : (
              <span className="form-helper">Known debt payouts or supplier dues in next 30 days.</span>
            )}
          </div>

          {/* Existing Receivables */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="existingReceivables" className="form-label">
              <ArrowUpRight size={15} color="var(--text-muted)" />
              Existing Accounts Receivable
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                id="existingReceivables"
                type="number"
                min="0"
                step="any"
                className={`form-input has-prefix ${errors.existingReceivables ? 'has-error' : ''}`}
                placeholder="e.g. 1500000"
                value={profile.existingReceivables}
                onChange={(e) => onChange('existingReceivables', e.target.value)}
              />
            </div>
            {errors.existingReceivables ? (
              <span className="error-text">
                <AlertCircle size={13} /> {errors.existingReceivables}
              </span>
            ) : (
              <span className="form-helper">Outstanding invoices pending collection from other buyers.</span>
            )}
          </div>

          {/* Annual Cost of Capital */}
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
            <label htmlFor="annualCostOfCapital" className="form-label">
              <Percent size={15} color="var(--text-muted)" />
              Annual Cost of Capital / Borrowing Rate (%)
            </label>
            <div className="input-wrapper" style={{ maxWidth: '320px' }}>
              <input
                id="annualCostOfCapital"
                type="number"
                min="0"
                max="100"
                step="0.1"
                className={`form-input has-suffix ${errors.annualCostOfCapital ? 'has-error' : ''}`}
                placeholder="e.g. 14.5"
                value={profile.annualCostOfCapital}
                onChange={(e) => onChange('annualCostOfCapital', e.target.value)}
              />
              <span className="input-suffix">% per annum</span>
            </div>
            {errors.annualCostOfCapital ? (
              <span className="error-text">
                <AlertCircle size={13} /> {errors.annualCostOfCapital}
              </span>
            ) : (
              <span className="form-helper">Annual interest rate of bank working capital lines or credit (0-100%).</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
