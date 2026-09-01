import React from 'react';
import { Briefcase, Building2, IndianRupee, Calendar, Clock, AlertCircle } from 'lucide-react';
import { PAYMENT_TERM_PRESETS } from '../models/dealModel';

export const DealSection = ({ deal, errors, onChange }) => {
  const handlePresetClick = (days) => {
    onChange('proposedPaymentTermDays', days);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="section-header">
        <div className="section-icon">
          <Briefcase size={20} />
        </div>
        <div>
          <h2 className="section-title">Section 1 — Proposed Deal</h2>
          <p className="section-desc">Enter details of the proposed B2B order & terms</p>
        </div>
      </div>

      {/* Buyer Name */}
      <div className="form-group">
        <label htmlFor="buyerName" className="form-label">
          <Building2 size={16} color="var(--text-muted)" />
          Buyer / Client Name
        </label>
        <input
          id="buyerName"
          type="text"
          className={`form-input ${errors.buyerName ? 'has-error' : ''}`}
          placeholder="e.g. Acme Industrial Solutions Pvt Ltd"
          value={deal.buyerName}
          onChange={(e) => onChange('buyerName', e.target.value)}
        />
        {errors.buyerName ? (
          <span className="error-text">
            <AlertCircle size={14} /> {errors.buyerName}
          </span>
        ) : (
          <span className="form-helper">The enterprise or business buying your goods/services.</span>
        )}
      </div>

      {/* Deal Value */}
      <div className="form-group">
        <label htmlFor="dealValue" className="form-label">
          <IndianRupee size={16} color="var(--text-muted)" />
          Total Deal Value (INR)
        </label>
        <div className="input-wrapper">
          <span className="input-prefix">₹</span>
          <input
            id="dealValue"
            type="number"
            min="1"
            step="any"
            className={`form-input has-prefix ${errors.dealValue ? 'has-error' : ''}`}
            placeholder="e.g. 2500000"
            value={deal.dealValue}
            onChange={(e) => onChange('dealValue', e.target.value)}
          />
        </div>
        {errors.dealValue ? (
          <span className="error-text">
            <AlertCircle size={14} /> {errors.dealValue}
          </span>
        ) : (
          <span className="form-helper">Gross contract or invoice value excluding taxes.</span>
        )}
      </div>

      {/* Proposed Payment Term Days */}
      <div className="form-group">
        <label htmlFor="proposedPaymentTermDays" className="form-label">
          <Clock size={16} color="var(--text-muted)" />
          Proposed Payment Terms (Days)
        </label>
        <div className="input-wrapper">
          <input
            id="proposedPaymentTermDays"
            type="number"
            min="1"
            className={`form-input has-suffix ${errors.proposedPaymentTermDays ? 'has-error' : ''}`}
            placeholder="e.g. 30"
            value={deal.proposedPaymentTermDays}
            onChange={(e) => onChange('proposedPaymentTermDays', e.target.value)}
          />
          <span className="input-suffix">Days</span>
        </div>

        {/* Quick select presets */}
        <div className="pill-group">
          {PAYMENT_TERM_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`pill-btn ${Number(deal.proposedPaymentTermDays) === preset.value ? 'active' : ''}`}
              onClick={() => handlePresetClick(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {errors.proposedPaymentTermDays ? (
          <span className="error-text">
            <AlertCircle size={14} /> {errors.proposedPaymentTermDays}
          </span>
        ) : (
          <span className="form-helper">Number of credit days requested by the buyer (e.g. Net 30 = 30 days credit).</span>
        )}
      </div>

      {/* Expected Order Date */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label htmlFor="expectedOrderDate" className="form-label">
          <Calendar size={16} color="var(--text-muted)" />
          Expected Order Date
        </label>
        <input
          id="expectedOrderDate"
          type="date"
          className={`form-input ${errors.expectedOrderDate ? 'has-error' : ''}`}
          value={deal.expectedOrderDate}
          onChange={(e) => onChange('expectedOrderDate', e.target.value)}
        />
        {errors.expectedOrderDate ? (
          <span className="error-text">
            <AlertCircle size={14} /> {errors.expectedOrderDate}
          </span>
        ) : (
          <span className="form-helper">Anticipated date of order confirmation / PO issuance.</span>
        )}
      </div>
    </div>
  );
};
