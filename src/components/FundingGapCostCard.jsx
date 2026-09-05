import React from 'react';
import { Calculator } from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters.js';

export const FundingGapCostCard = ({ cashFlowMetrics }) => {
  const {
    fundingGapDays,
    liquidityShortfall,
    fundingNeed,
    estimatedFulfillmentCarryingCost,
    dailyFulfillmentCarryingCost,
    annualCostOfCapital
  } = cashFlowMetrics;

  const currentShortfall = liquidityShortfall ?? fundingNeed ?? 0;

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="section-header" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>
          <div className="section-icon" style={{ background: 'var(--accent-amber-bg)', color: 'var(--accent-amber)' }}>
            <Calculator size={17} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: '0.95rem' }}>Estimated Cost of Funding Shortfall</h3>
            <p className="section-desc">Carrying cost of funding the uncovered fulfillment requirement during payment gap</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>FULFILLMENT FUNDING GAP</span>
            <span style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'var(--accent-amber-bg)',
              color: 'var(--accent-amber)',
              border: '1px solid var(--accent-amber-border)'
            }}>
              {fundingGapDays} Days Gap
            </span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.1rem 0' }}>
            {formatINR(Math.round(estimatedFulfillmentCarryingCost))}
          </div>

          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Cost of funding {formatINR(currentShortfall)} unfunded shortfall for {fundingGapDays} days at {formatPercent(annualCostOfCapital)} p.a.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>FUNDING SHORTFALL</span>
            <strong style={{ fontSize: '0.875rem', color: currentShortfall > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{formatINR(currentShortfall)}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>DAILY COST</span>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{formatINR(Math.round(dailyFulfillmentCarryingCost))}/day</strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>COST OF CAPITAL</span>
            <strong style={{ fontSize: '0.875rem', color: 'var(--accent-blue)' }}>{formatPercent(annualCostOfCapital)} p.a.</strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
        * Calculated specifically on unfunded shortfall ({formatINR(currentShortfall)}).
      </div>
    </div>
  );
};
