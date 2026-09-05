import React from 'react';
import { Landmark, Wallet, Clock } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const FinancialHealthCard = ({ metrics }) => {
  const { postObligationCash, cashRunwayMonths, dealExposureRatio, existingReceivables } = metrics;

  const runwayDisplay = cashRunwayMonths >= 999 ? 'Unlimited' : `${cashRunwayMonths.toFixed(1)} mo`;

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div className="section-header" style={{ marginBottom: '0.85rem', paddingBottom: '0.5rem' }}>
        <div className="section-icon" style={{ background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)' }}>
          <Landmark size={17} />
        </div>
        <div>
          <h3 className="section-title" style={{ fontSize: '0.95rem' }}>Financial Health & Liquidity</h3>
          <p className="section-desc">Immediate post-obligation liquidity & working capital position</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
        {/* Post-Obligation Cash */}
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Wallet size={13} color="var(--accent-emerald)" />
            <span>Post-Obligation Cash</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: postObligationCash < 0 ? 'var(--accent-rose)' : 'var(--text-primary)', marginTop: '0.25rem' }}>
            {formatINR(postObligationCash)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Cash minus obligations
          </span>
        </div>

        {/* Cash Runway */}
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Clock size={13} color="var(--accent-blue)" />
            <span>Cash Runway</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: cashRunwayMonths < 1 ? 'var(--accent-rose)' : cashRunwayMonths < 2 ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            {runwayDisplay}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Months OpEx covered
          </span>
        </div>
      </div>

      {/* Exposure Ratios Row */}
      <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Deal Value Exposure:</span>
          <strong style={{ color: dealExposureRatio > 200 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
            {(dealExposureRatio / 100).toFixed(2)}× available cash ({dealExposureRatio.toFixed(1)}%)
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Receivables Exposure:</span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {(metrics.receivableExposureRatio / 100).toFixed(2)}× available cash ({formatINR(existingReceivables)})
          </strong>
        </div>
      </div>
    </div>
  );
};
