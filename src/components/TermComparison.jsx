import React from 'react';
import { Sliders, ArrowDownRight, CheckCircle2, Star } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const TermComparison = ({ scenarios, proposedTermDays, recommendedTermDays }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA' }}>
          <Sliders size={20} />
        </div>
        <div>
          <h2 className="section-title">Payment Term Scenario Comparison</h2>
          <p className="section-desc">Comparing financing costs across Net 15, Net 30, Net 45, Net 60, and Net 90</p>
        </div>
      </div>

      {/* Grid of Scenarios */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginTop: '1.25rem'
      }}>
        {scenarios.map((scenario) => {
          const isProposed = scenario.termDays === Number(proposedTermDays);
          const isRecommended = scenario.termDays === Number(recommendedTermDays) && !isProposed;

          return (
            <div
              key={scenario.termDays}
              style={{
                backgroundColor: isProposed ? '#1E293B' : isRecommended ? '#0D2818' : '#111827',
                border: isProposed ? '1.5px solid #F59E0B' : isRecommended ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isProposed ? '0 0 15px rgba(245, 158, 11, 0.15)' : isRecommended ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none'
              }}
            >
              {/* Badges */}
              <div style={{ marginBottom: '0.75rem' }}>
                {isProposed && (
                  <span style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'inline-block'
                  }}>
                    Proposed Term
                  </span>
                )}

                {isRecommended && (
                  <span style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Star size={10} fill="#34D399" />
                    Recommended
                  </span>
                )}

                {!isProposed && !isRecommended && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Scenario
                  </span>
                )}
              </div>

              {/* Term Label */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {scenario.label}
                </h3>

                {/* Financing Cost */}
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isProposed ? '#FBBF24' : isRecommended ? '#34D399' : '#60A5FA', marginTop: '0.35rem' }}>
                  {formatINR(Math.round(scenario.financingCost))}
                </div>
              </div>

              {/* Savings or Delta */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                {isProposed ? (
                  <span style={{ color: 'var(--text-muted)' }}>Baseline Proposed Cost</span>
                ) : scenario.savingsVsProposed > 0 ? (
                  <span style={{ color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ArrowDownRight size={14} /> Saves {formatINR(Math.round(scenario.savingsVsProposed))}
                  </span>
                ) : (
                  <span style={{ color: '#FCA5A5' }}>
                    + {formatINR(Math.round(Math.abs(scenario.savingsVsProposed)))} extra cost
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
