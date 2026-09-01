import React from 'react';
import { Gauge, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export const RiskScoreCard = ({ score, riskLevel }) => {
  // Color palette based on risk level
  const getBadgeStyle = () => {
    switch (riskLevel) {
      case 'LOW':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle2 };
      case 'HIGH':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#FCA5A5', border: 'rgba(239, 68, 68, 0.3)', icon: ShieldAlert };
      case 'MODERATE':
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)', icon: AlertTriangle };
    }
  };

  const badgeStyle = getBadgeStyle();
  const IconComponent = badgeStyle.icon;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Gauge size={18} color="#60A5FA" />
            <span>Financial Pressure Score</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            <IconComponent size={14} />
            <span>{riskLevel} RISK</span>
          </div>
        </div>

        {/* Large Score Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '1rem 0 0.75rem 0' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1,
            color: badgeStyle.text
          }}>
            {score}
          </span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            / 100
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#1E293B',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: badgeStyle.text,
            borderRadius: '4px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>

      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        <strong>TermPilot Financial Pressure Index:</strong> Weighted calculation of liquidity runway (40%), deal value exposure (25%), receivable pressure (15%), and payment credit terms (20%).
      </div>
    </div>
  );
};
