import React from 'react';
import { Gauge, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const RiskScoreCard = ({ score, riskLevel }) => {
  const getBadgeStyle = () => {
    switch (riskLevel) {
      case 'LOW':
        return { bg: 'var(--accent-emerald-bg)', text: 'var(--accent-emerald)', border: 'var(--accent-emerald-border)', icon: CheckCircle2 };
      case 'HIGH':
        return { bg: 'var(--accent-rose-bg)', text: 'var(--accent-rose)', border: 'var(--accent-rose-border)', icon: ShieldAlert };
      case 'MODERATE':
      default:
        return { bg: 'var(--accent-amber-bg)', text: 'var(--accent-amber)', border: 'var(--accent-amber-border)', icon: AlertTriangle };
    }
  };

  const badgeStyle = getBadgeStyle();
  const IconComponent = badgeStyle.icon;

  return (
    <div className="fintech-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Gauge size={17} color="var(--accent-blue)" />
            <span>Financial Pressure Index</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
            fontSize: '0.725rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            <IconComponent size={13} />
            <span>{riskLevel} PRESSURE</span>
          </div>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.5rem 0' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1,
            color: badgeStyle.text
          }}>
            {score}
          </span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            / 100
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '7px',
          backgroundColor: 'var(--bg-main)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '0.75rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: badgeStyle.text,
            borderRadius: '4px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>

        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Pressure score based on available liquidity runway, deal contract exposure, receivables, and payment term duration.
        </p>
      </div>

      <details style={{
        marginTop: '0.85rem',
        backgroundColor: 'var(--bg-main)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        padding: '0.5rem 0.75rem'
      }}>
        <summary style={{
          cursor: 'pointer',
          fontSize: '0.75rem',
          color: 'var(--accent-blue)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <Info size={13} />
          <span>How is this index calculated?</span>
        </summary>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div>• <strong>Liquidity Runway (40% Weight):</strong> Months of OpEx covered by net post-obligation cash.</div>
          <div>• <strong>Deal Value Exposure (25% Weight):</strong> Ratio of contract value relative to liquid cash.</div>
          <div>• <strong>Receivable Pressure (15% Weight):</strong> Outstanding client receivables vs available cash.</div>
          <div>• <strong>Payment Term Cost (20% Weight):</strong> Duration of credit period requested by buyer.</div>
        </div>
      </details>
    </div>
  );
};
