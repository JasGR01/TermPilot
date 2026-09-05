import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowDownRight, HelpCircle } from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export const DecisionCard = ({ decisionResult, proposedTermDays }) => {
  const {
    decision,
    recommendedTermDays,
    estimatedSavings,
    explanationBullets,
  } = decisionResult;

  const getDecisionStyle = () => {
    switch (decision) {
      case 'ACCEPT':
        return {
          bg: 'var(--accent-emerald-bg)',
          border: 'var(--accent-emerald-border)',
          text: 'var(--accent-emerald)',
          icon: ShieldCheck,
          title: 'ACCEPT PROPOSED TERMS'
        };
      case 'HIGH RISK / REVIEW':
        return {
          bg: 'var(--accent-rose-bg)',
          border: 'var(--accent-rose-border)',
          text: 'var(--accent-rose)',
          icon: ShieldAlert,
          title: 'HIGH RISK — REVIEW / REJECT'
        };
      case 'NEGOTIATE':
      default:
        return {
          bg: 'var(--accent-blue-light)',
          border: 'var(--accent-blue-border)',
          text: 'var(--accent-blue)',
          icon: AlertTriangle,
          title: 'NEGOTIATE PAYMENT TERMS'
        };
    }
  };

  const style = getDecisionStyle();
  const IconComponent = style.icon;
  const isShorterRecommended = recommendedTermDays < proposedTermDays;

  return (
    <div className="fintech-card" style={{
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: style.bg,
              border: `1px solid ${style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: style.text
            }}>
              <IconComponent size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Recommendation
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: style.text, margin: 0 }}>
                {decision}
              </h2>
            </div>
          </div>

          {isShorterRecommended && (
            <div style={{
              backgroundColor: 'var(--accent-emerald-bg)',
              border: '1px solid var(--accent-emerald-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <ArrowDownRight size={16} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Target Terms
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Net {recommendedTermDays}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Savings Highlight */}
        {isShorterRecommended && estimatedSavings > 0 && (
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Net {proposedTermDays} creates cash-flow exposure.
              </span>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Targeting Net {recommendedTermDays} reduces financing carrying cost.
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 600 }}>
                Estimated Savings
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {formatINR(Math.round(estimatedSavings))}
              </div>
            </div>
          </div>
        )}

        {/* Explainability Rationale */}
        <div>
          <h4 style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            <HelpCircle size={14} color="var(--accent-blue)" />
            Key Financial Rationale
          </h4>

          <ol style={{ paddingLeft: '1.15rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {explanationBullets.map((bullet, idx) => (
              <li key={idx} style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                <span>{bullet}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
