import React from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export const CashFlowRationaleCard = ({ cashFlowMetrics }) => {
  const { explanations, coverageStatus, liquidityShortfall, fundingGapDays } = cashFlowMetrics;

  const borderLeftColor = coverageStatus === 'COVERED' ? 'var(--accent-emerald)' : coverageStatus === 'HIGH FUNDING PRESSURE' ? 'var(--accent-rose)' : 'var(--accent-amber)';

  return (
    <div className="fintech-card" style={{
      padding: '1.25rem 1.5rem',
      marginTop: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <HelpCircle size={16} color="var(--accent-blue)" />
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Cash-Flow Impact Analysis
        </h4>
      </div>

      <ol style={{ paddingLeft: '1.15rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {explanations.map((bullet, idx) => (
          <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <span>{bullet}</span>
          </li>
        ))}
      </ol>

      {liquidityShortfall > 0 && (
        <div style={{
          marginTop: '1rem',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.775rem',
          color: 'var(--text-muted)'
        }}>
          <Info size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Operational Guidance: </strong>
            Plan to bridge the estimated {formatINR(liquidityShortfall)} fulfillment gap during the {fundingGapDays}-day credit window (e.g., via milestone deposits, supplier credit, or advance terms).
          </div>
        </div>
      )}
    </div>
  );
};
