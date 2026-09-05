import React from 'react';
import { Briefcase, Building2, IndianRupee, Calendar, Clock, AlertCircle, Coins, Hourglass } from 'lucide-react';
import { PAYMENT_TERM_PRESETS } from '../models/dealModel';

export const DealSection = ({ deal, errors, onChange }) => {
  const handlePresetClick = (days) => {
    onChange('proposedPaymentTermDays', days);
  };

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div className="section-header" style={{ marginBottom: '1rem', paddingBottom: '0.65rem' }}>
        <div className="section-icon">
          <Briefcase size={18} />
        </div>
        <div>
          <h2 className="section-title">Your Deal</h2>
          <p className="section-desc">Key parameters of the proposed B2B contract & fulfillment</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Buyer Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="buyerName" className="form-label">
            <Building2 size={15} color="var(--text-muted)" />
            Buyer / Client Name
          </label>
          <input
            id="buyerName"
            type="text"
            className={`form-input ${errors.buyerName ? 'has-error' : ''}`}
            placeholder="e.g. Acme Industrial Solutions"
            value={deal.buyerName}
            onChange={(e) => onChange('buyerName', e.target.value)}
          />
          {errors.buyerName ? (
            <span className="error-text">
              <AlertCircle size={13} /> {errors.buyerName}
            </span>
          ) : (
            <span className="form-helper">The business purchasing your goods or services.</span>
          )}
        </div>

        {/* Deal Value */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="dealValue" className="form-label">
            <IndianRupee size={15} color="var(--text-muted)" />
            Deal Value (INR)
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
              <AlertCircle size={13} /> {errors.dealValue}
            </span>
          ) : (
            <span className="form-helper">Gross contract or invoice amount.</span>
          )}
        </div>

        {/* Proposed Payment Term Days */}
        <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
          <label htmlFor="proposedPaymentTermDays" className="form-label">
            <Clock size={15} color="var(--text-muted)" />
            Proposed Payment Term
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="input-wrapper" style={{ minWidth: '160px', flex: 1 }}>
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
            <div className="pill-group" style={{ marginTop: 0 }}>
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
          </div>

          {errors.proposedPaymentTermDays ? (
            <span className="error-text">
              <AlertCircle size={13} /> {errors.proposedPaymentTermDays}
            </span>
          ) : (
            <span className="form-helper">Credit duration requested by buyer (e.g. Net 30 = 30 days after invoice).</span>
          )}
        </div>

        {/* Expected Order Date */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="expectedOrderDate" className="form-label">
            <Calendar size={15} color="var(--text-muted)" />
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
              <AlertCircle size={13} /> {errors.expectedOrderDate}
            </span>
          ) : (
            <span className="form-helper">Date order is confirmed or PO issued.</span>
          )}
        </div>

        {/* Estimated Fulfillment Cost */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="estimatedFulfillmentCost" className="form-label">
            <Coins size={15} color="var(--text-muted)" />
            Estimated Fulfillment Cost (INR)
          </label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              id="estimatedFulfillmentCost"
              type="number"
              min="1"
              step="any"
              className={`form-input has-prefix ${errors.estimatedFulfillmentCost ? 'has-error' : ''}`}
              placeholder="e.g. 1500000"
              value={deal.estimatedFulfillmentCost}
              onChange={(e) => onChange('estimatedFulfillmentCost', e.target.value)}
            />
          </div>
          {errors.estimatedFulfillmentCost ? (
            <span className="error-text">
              <AlertCircle size={13} /> {errors.estimatedFulfillmentCost}
            </span>
          ) : (
            <span className="form-helper">Total cash cost to produce or fulfill this order.</span>
          )}
        </div>

        {/* Supplier / Production Payment Timing */}
        <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
          <label htmlFor="fulfillmentPaymentTimingDays" className="form-label">
            <Hourglass size={15} color="var(--text-muted)" />
            Supplier / Production Payment Timing
          </label>
          <div className="input-wrapper" style={{ maxWidth: '320px' }}>
            <input
              id="fulfillmentPaymentTimingDays"
              type="number"
              min="0"
              className={`form-input has-suffix ${errors.fulfillmentPaymentTimingDays ? 'has-error' : ''}`}
              placeholder="e.g. 0"
              value={deal.fulfillmentPaymentTimingDays}
              onChange={(e) => onChange('fulfillmentPaymentTimingDays', e.target.value)}
            />
            <span className="input-suffix">Days after PO</span>
          </div>
          {errors.fulfillmentPaymentTimingDays ? (
            <span className="error-text">
              <AlertCircle size={13} /> {errors.fulfillmentPaymentTimingDays}
            </span>
          ) : (
            <span className="form-helper">Days after PO when production costs must be paid out (0 = upfront cash required).</span>
          )}
        </div>
      </div>
    </div>
  );
};
