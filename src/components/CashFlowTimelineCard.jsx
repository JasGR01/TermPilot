import React from 'react';
import { Calendar, Hourglass } from 'lucide-react';
import { formatDate, formatINR } from '../utils/formatters.js';

export const CashFlowTimelineCard = ({ cashFlowMetrics }) => {
  const {
    expectedOrderDate,
    fulfillmentPaymentTimingDays,
    proposedPaymentTermDays,
    fulfillmentCashOutDate,
    customerPaymentDate,
    fundingGapDays,
    estimatedFulfillmentCost
  } = cashFlowMetrics;

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="section-header" style={{ marginBottom: '0.85rem', paddingBottom: '0.5rem' }}>
          <div className="section-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
            <Calendar size={17} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: '0.95rem' }}>Cash Flow Timeline</h3>
            <p className="section-desc">Key dates between order placement and buyer invoice payment</p>
          </div>
        </div>

        {/* Timeline Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem' }}>
          {/* Order Placement */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            padding: '0.75rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
              <div>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  ORDER DATE (DAY 0)
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {formatDate(expectedOrderDate)}
                </strong>
              </div>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--accent-blue)', fontWeight: 600, backgroundColor: 'var(--accent-blue-light)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              PO Confirmed
            </span>
          </div>

          {/* Fulfillment Cash Outflow */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            padding: '0.75rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-rose-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
              <div>
                <span style={{ fontSize: '0.675rem', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  FULFILLMENT CASH-OUT (DAY {fulfillmentPaymentTimingDays})
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {formatDate(fulfillmentCashOutDate)}
                </strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                -{formatINR(estimatedFulfillmentCost)}
              </span>
            </div>
          </div>

          {/* Customer Payment Inflow */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            padding: '0.75rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-emerald-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
              <div>
                <span style={{ fontSize: '0.675rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  CUSTOMER PAYMENT (DAY {proposedPaymentTermDays})
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {formatDate(customerPaymentDate)}
                </strong>
              </div>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)', fontWeight: 600, backgroundColor: 'var(--accent-emerald-bg)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              Net {proposedPaymentTermDays} Credit Window
            </span>
          </div>
        </div>
      </div>

      {/* Funding Gap Duration Banner */}
      <div style={{
        marginTop: '0.85rem',
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.65rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Hourglass size={15} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
            Funding Gap Duration:
          </span>
        </div>
        <strong style={{ fontSize: '0.95rem', fontWeight: 800, color: fundingGapDays > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
          {fundingGapDays} Days
        </strong>
      </div>
    </div>
  );
};
