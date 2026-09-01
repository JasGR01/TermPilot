import React from 'react';
import { calculateFinancialMetrics } from '../engine/financialEngine';
import { evaluateFinancialDecision } from '../engine/decisionEngine';
import { RiskScoreCard } from '../components/RiskScoreCard';
import { DecisionCard } from '../components/DecisionCard';
import { FinancialHealthCard } from '../components/FinancialHealthCard';
import { FinancingCostCard } from '../components/FinancingCostCard';
import { TermComparison } from '../components/TermComparison';
import { ArrowLeft, Cpu, Building2, Calendar, FileText, Database } from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';

export const DealAnalysisResultPage = ({ payload, onEditInputs }) => {
  // Execute pure calculation engine
  const financialMetrics = calculateFinancialMetrics(payload);
  const decisionResult = evaluateFinancialDecision(financialMetrics);

  const { deal, financialProfile } = payload;

  return (
    <div style={{ padding: '2rem 0 4rem 0' }}>
      {/* Top Breadcrumb & Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onEditInputs}
            className="pill-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Edit Deal Parameters</span>
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Building2 size={16} color="#60A5FA" />
            <strong style={{ color: 'var(--text-primary)' }}>{deal.buyerName}</strong>
            <span>({formatINR(deal.dealValue)})</span>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          color: '#60A5FA',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          border: '1px solid rgba(37, 99, 235, 0.25)'
        }}>
          <Cpu size={14} />
          <span>Step 2: Deterministic Financial Impact Engine</span>
        </div>
      </div>

      {/* Main Grid: Top Row — Pressure Score & Decision Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <RiskScoreCard
          score={decisionResult.financialPressureScore}
          riskLevel={decisionResult.riskLevel}
        />

        <DecisionCard
          decisionResult={decisionResult}
          proposedTermDays={financialMetrics.proposedPaymentTermDays}
        />
      </div>

      {/* Middle Row: Financial Health & Financing Cost Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <FinancialHealthCard metrics={financialMetrics} />
        <FinancingCostCard metrics={financialMetrics} />
      </div>

      {/* Bottom Row: Term Comparison Matrix */}
      <TermComparison
        scenarios={decisionResult.scenarios}
        proposedTermDays={financialMetrics.proposedPaymentTermDays}
        recommendedTermDays={decisionResult.recommendedTermDays}
      />

      {/* Data Model Contract Drawer */}
      <details style={{ marginTop: '2rem', background: '#0D1424', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.875rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.825rem', color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={15} color="#60A5FA" />
          View Calculated Engine Outputs (Pure Data Object)
        </summary>
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.775rem',
          color: '#34D399',
          marginTop: '0.75rem',
          overflowX: 'auto',
          padding: '0.75rem',
          backgroundColor: '#070A10',
          borderRadius: '6px'
        }}>
          {JSON.stringify({ inputContract: payload, calculatedMetrics: financialMetrics, decisionResult }, null, 2)}
        </pre>
      </details>
    </div>
  );
};
