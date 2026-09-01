import React from 'react';
import { Landmark, Wallet, Clock, TrendingUp } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const FinancialHealthCard = ({ metrics }) => {
  const { postObligationCash, cashRunwayMonths, dealExposureRatio, existingReceivables, availableCash } = metrics;

  const runwayDisplay = cashRunwayMonths >= 999 ? 'Unlimited' : `${cashRunwayMonths.toFixed(1)} mo`;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="section-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        <div className="section-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
          <Landmark size={18} />
        </div>
        <div>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Financial Health & Liquidity</h3>
          <p className="section-desc">Immediate post-obligation liquidity & working capital</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        {/* Post-Obligation Cash */}
        <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Wallet size={14} color="#34D399" />
            <span>Post-Obligation Cash</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: postObligationCash < 0 ? '#EF4444' : '#F9FAFB', marginTop: '0.35rem' }}>
            {formatINR(postObligationCash)}
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Available cash minus obligations
          </span>
        </div>

        {/* Cash Runway */}
        <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Clock size={14} color="#60A5FA" />
            <span>Cash Runway</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: cashRunwayMonths < 1 ? '#EF4444' : cashRunwayMonths < 2 ? '#F59E0B' : '#34D399', marginTop: '0.35rem' }}>
            {runwayDisplay}
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Months of OpEx covered by net cash
          </span>
        </div>
      </div>

      {/* Exposure Ratios Row */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Deal Exposure Ratio (Deal / Cash):</span>
          <strong style={{ color: dealExposureRatio > 200 ? '#F59E0B' : '#F9FAFB' }}>
            {dealExposureRatio.toFixed(1)}% ({(dealExposureRatio / 100).toFixed(2)}×)
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Existing Accounts Receivable:</span>
          <strong style={{ color: '#F9FAFB' }}>{formatINR(existingReceivables)}</strong>
        </div>
      </div>
    </div>
  );
};
