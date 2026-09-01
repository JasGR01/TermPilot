import React from 'react';
import { IndianRupee, Percent, Calculator, CalendarClock } from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters';

export const FinancingCostCard = ({ metrics }) => {
  const { proposedPaymentTermDays, estimatedFinancingCost, dailyCapitalCost, annualCostOfCapital, dealValue } = metrics;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="section-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        <div className="section-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
          <Calculator size={18} />
        </div>
        <div>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Payment Term Cost</h3>
          <p className="section-desc">Financing cost created by proposed payment delay</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#0D1424', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PROPOSED CREDIT TERM</span>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#FBBF24',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            Net {proposedPaymentTermDays} Days
          </span>
        </div>

        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', margin: '0.25rem 0' }}>
          {formatINR(Math.round(estimatedFinancingCost))}
        </div>
        
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Estimated capital cost of carrying {proposedPaymentTermDays} days of credit
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ backgroundColor: '#111827', padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>DAILY CAPITAL COST</span>
          <strong style={{ fontSize: '0.95rem', color: '#F9FAFB' }}>{formatINR(Math.round(dailyCapitalCost))}/day</strong>
        </div>

        <div style={{ backgroundColor: '#111827', padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>BORROWING RATE</span>
          <strong style={{ fontSize: '0.95rem', color: '#60A5FA' }}>{formatPercent(annualCostOfCapital)} p.a.</strong>
        </div>
      </div>
    </div>
  );
};
