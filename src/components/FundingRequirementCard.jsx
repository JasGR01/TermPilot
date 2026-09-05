import React from 'react';
import { Coins, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export const FundingRequirementCard = ({ cashFlowMetrics }) => {
  const {
    estimatedFulfillmentCost,
    availableLiquidityAfterObligations,
    liquidityShortfall,
    coverageStatus
  } = cashFlowMetrics;

  const getStatusBadgeStyle = () => {
    switch (coverageStatus) {
      case 'COVERED':
        return {
          bg: 'var(--accent-emerald-bg)',
          text: 'var(--accent-emerald)',
          border: 'var(--accent-emerald-border)',
          icon: CheckCircle2
        };
      case 'HIGH FUNDING PRESSURE':
        return {
          bg: 'var(--accent-rose-bg)',
          text: 'var(--accent-rose)',
          border: 'var(--accent-rose-border)',
          icon: ShieldAlert
        };
      case 'PARTIALLY COVERED / SHORTFALL':
      default:
        return {
          bg: 'var(--accent-amber-bg)',
          text: 'var(--accent-amber)',
          border: 'var(--accent-amber-border)',
          icon: AlertTriangle
        };
    }
  };

  const badge = getStatusBadgeStyle();
  const IconComp = badge.icon;

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="section-header" style={{ marginBottom: 0, paddingBottom: 0 }}>
            <div className="section-icon" style={{ background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)' }}>
              <Coins size={17} />
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: '0.95rem' }}>Funding Requirement & Coverage</h3>
              <p className="section-desc">Fulfillment capital vs net liquidity position</p>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: badge.bg,
            color: badge.text,
            border: `1px solid ${badge.border}`,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            <IconComp size={13} />
            <span>{coverageStatus}</span>
          </div>
        </div>

        {/* 3 Metric Rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginTop: '0.85rem' }}>
          {/* Estimated Fulfillment Cost */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              FULFILLMENT COST
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {formatINR(estimatedFulfillmentCost)}
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>
              Production expense
            </span>
          </div>

          {/* Available Liquidity After Obligations */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              NET LIQUIDITY
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: availableLiquidityAfterObligations <= 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              {formatINR(availableLiquidityAfterObligations)}
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>
              Cash minus dues
            </span>
          </div>

          {/* Internal Liquidity Shortfall */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${liquidityShortfall > 0 ? 'var(--accent-rose-border)' : 'var(--border-color)'}` }}>
            <span style={{ fontSize: '0.675rem', color: liquidityShortfall > 0 ? 'var(--accent-rose)' : 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              CASH SHORTFALL
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: liquidityShortfall > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              {formatINR(liquidityShortfall)}
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.15rem' }}>
              Unfunded gap
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
        * Fulfillment cost is entered by SME and not assumed to equal total deal value.
      </div>
    </div>
  );
};
