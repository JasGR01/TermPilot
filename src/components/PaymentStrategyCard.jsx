import React from 'react';
import { Layers, Star, CheckCircle2, Info } from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export const PaymentStrategyCard = ({ strategyResult, selectedStrategy, onSelectStrategy, onOpenComparison }) => {
  if (!strategyResult) return null;

  const { strategies, recommendedStrategy, recommendationReason } = strategyResult;

  // Fallback if selectedStrategy is not provided
  const activeSelected = selectedStrategy || recommendedStrategy;

  return (
    <div className="fintech-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      {/* Section Header */}
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <div className="section-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
          <Layers size={18} />
        </div>
        <div>
          <h2 className="section-title">Payment Structures & Options</h2>
          <p className="section-desc">Select the structure you want to negotiate with your buyer. AI recommends, supplier decides.</p>
        </div>
      </div>

      {/* Evaluated Structures Grid — Supplier Choice */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: 0 }}>
          Select Structure for Negotiation
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click any card to select it for your negotiation
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
        gap: '1rem'
      }}>
        {strategies.map((strat) => {
          const isRec = strat.isRecommended;
          const isSelected = activeSelected && activeSelected.id === strat.id;

          return (
            <div
              key={strat.id}
              onClick={() => onSelectStrategy && onSelectStrategy(strat)}
              style={{
                backgroundColor: isSelected ? 'var(--accent-blue-light)' : (isRec ? 'var(--accent-emerald-bg)' : 'var(--bg-main)'),
                border: isSelected ? '2px solid var(--accent-blue)' : (isRec ? '1.5px solid var(--accent-emerald-border)' : '1px solid var(--border-color)'),
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
              }}
            >
              <div>
                {/* Badges Container */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  {isRec && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--accent-emerald-bg)',
                      color: 'var(--accent-emerald)',
                      border: '1px solid var(--accent-emerald-border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <Star size={9} fill="var(--accent-emerald)" /> RECOMMENDED
                    </span>
                  )}

                  {isSelected && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--accent-blue)',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <CheckCircle2 size={9} /> SELECTED BY YOU
                    </span>
                  )}

                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: strat.status === 'COVERED' ? 'var(--accent-emerald-bg)' : 'var(--accent-amber-bg)',
                    color: strat.status === 'COVERED' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    marginLeft: 'auto'
                  }}>
                    {strat.status}
                  </span>
                </div>

                {/* Strategy Title */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0 0.6rem 0' }}>
                  {strat.label}
                </h4>

                {/* Metrics Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Upfront:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{strat.upfrontPercentage}% ({formatINR(strat.upfrontAmount)})</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Term:</span>
                    <strong style={{ color: 'var(--accent-blue)' }}>Net {strat.paymentTermDays}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shortfall:</span>
                    <strong style={{ color: strat.fundingShortfall > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {formatINR(strat.fundingShortfall)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Funding Gap:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{strat.fundingGapDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Action Affordance */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Cost: <strong style={{ color: 'var(--accent-amber)' }}>{formatINR(Math.round(strat.estimatedFundingCost))}</strong>
                </span>

                {isSelected ? (
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle2 size={13} /> Active
                  </span>
                ) : (
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Use this strategy →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
