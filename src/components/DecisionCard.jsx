import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowDownRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const DecisionCard = ({ decisionResult, proposedTermDays }) => {
  const {
    decision,
    recommendedTermDays,
    estimatedSavings,
    explanationBullets,
    riskLevel
  } = decisionResult;

  const getDecisionStyle = () => {
    switch (decision) {
      case 'ACCEPT':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: '#10B981',
          text: '#34D399',
          icon: ShieldCheck,
          title: 'ACCEPT PROPOSED TERMS'
        };
      case 'HIGH RISK / REVIEW':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: '#EF4444',
          text: '#FCA5A5',
          icon: ShieldAlert,
          title: 'HIGH RISK — REVIEW / REJECT'
        };
      case 'NEGOTIATE':
      default:
        return {
          bg: 'rgba(37, 99, 235, 0.12)',
          border: '#2563EB',
          text: '#60A5FA',
          icon: AlertTriangle,
          title: 'NEGOTIATE PAYMENT TERMS'
        };
    }
  };

  const style = getDecisionStyle();
  const IconComponent = style.icon;
  const isShorterRecommended = recommendedTermDays < proposedTermDays;

  return (
    <div style={{
      backgroundColor: '#0F172A',
      border: `1.5px solid ${style.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1.75rem',
      boxShadow: `0 0 25px ${style.bg}`
    }}>
      {/* Top Banner & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: style.bg,
            border: `1px solid ${style.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: style.text
          }}>
            <IconComponent size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              PRELIMINARY DECISION
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: style.text, margin: 0 }}>
              {decision}
            </h2>
          </div>
        </div>

        {isShorterRecommended && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ArrowDownRight size={18} color="#34D399" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>
                Recommended Direction
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>
                Negotiate toward Net {recommendedTermDays}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Term Savings Highlight */}
      {isShorterRecommended && estimatedSavings > 0 && (
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Net {proposedPaymentTermDays} creates moderate working-capital pressure.
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              Targeting Net {recommendedTermDays} optimizes cash flow and reduces financing cost.
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.725rem', color: '#34D399', textTransform: 'uppercase', fontWeight: 600 }}>
              Estimated Savings
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
              {formatINR(Math.round(estimatedSavings))}
            </div>
          </div>
        </div>
      )}

      {/* Data-Driven Explainability Section */}
      <div>
        <h4 style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <HelpCircle size={16} color="#60A5FA" />
          Why {decision.toLowerCase()}? (Data-Driven Decision Logic)
        </h4>

        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {explanationBullets.map((bullet, idx) => (
            <li key={idx} style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              backgroundColor: '#111827',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: '#60A5FA', fontWeight: 700 }}>•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
