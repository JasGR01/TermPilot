import React from 'react';
import { Wallet, Landmark, TrendingUp, AlertCircle, Percent, ArrowUpRight, Coins } from 'lucide-react';

export const FinancialProfileSection = ({ profile, errors, onChange }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
          <Landmark size={20} />
        </div>
        <div>
          <h2 className="section-title">Section 2 — Business Financial Profile</h2>
          <p className="section-desc">Current liquidity, obligations & hurdle rate</p>
        </div>
      </div>

      {/* Available Cash */}
      <div className="form-group">
        <label htmlFor="availableCash" className="form-label">
          <Wallet size={16} color="var(--text-muted)" />
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
            <AlertCircle size={14} /> {errors.availableCash}
          </span>
        ) : (
          <span className="form-helper">Liquid cash & bank balances immediately available for working capital.</span>
        )}
      </div>

      {/* Monthly Operating Expenses */}
      <div className="form-group">
        <label htmlFor="monthlyOperatingExpenses" className="form-label">
          <Coins size={16} color="var(--text-muted)" />
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
            <AlertCircle size={14} /> {errors.monthlyOperatingExpenses}
          </span>
        ) : (
          <span className="form-helper">Average monthly fixed expenses (payroll, rent, utilities, vendor run-rate).</span>
        )}
      </div>

      {/* Upcoming Obligations */}
      <div className="form-group">
        <label htmlFor="upcomingObligations" className="form-label">
          <AlertCircle size={16} color="var(--text-muted)" />
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
            <AlertCircle size={14} /> {errors.upcomingObligations}
          </span>
        ) : (
          <span className="form-helper">Known debt servicing, tax payouts, or supplier dues due in next 30 days.</span>
        )}
      </div>

      {/* Existing Receivables */}
      <div className="form-group">
        <label htmlFor="existingReceivables" className="form-label">
          <ArrowUpRight size={16} color="var(--text-muted)" />
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
            <AlertCircle size={14} /> {errors.existingReceivables}
          </span>
        ) : (
          <span className="form-helper">Total outstanding invoices pending collection from other clients.</span>
        )}
      </div>

      {/* Annual Cost of Capital */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label htmlFor="annualCostOfCapital" className="form-label">
          <Percent size={16} color="var(--text-muted)" />
          Annual Borrowing / Cost-of-Capital Rate (%)
        </label>
        <div className="input-wrapper">
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
            <AlertCircle size={14} /> {errors.annualCostOfCapital}
          </span>
        ) : (
          <span className="form-helper">Annual interest rate of bank credit lines / working capital loans (0-100%).</span>
        )}
      </div>
    </div>
  );
};
