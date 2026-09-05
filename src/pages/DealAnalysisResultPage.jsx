import React, { useState } from 'react';
import { calculateFinancialMetrics } from '../engine/financialEngine.js';
import { evaluateFinancialDecision } from '../engine/decisionEngine.js';
import { calculateCashFlowMetrics } from '../engine/cashFlowEngine.js';
import { evaluatePaymentStrategies } from '../engine/paymentStrategyEngine.js';
import { RiskScoreCard } from '../components/RiskScoreCard.jsx';
import { DecisionCard } from '../components/DecisionCard.jsx';
import { FinancialHealthCard } from '../components/FinancialHealthCard.jsx';
import { FinancingCostCard } from '../components/FinancingCostCard.jsx';
import { CashFlowTimelineCard } from '../components/CashFlowTimelineCard.jsx';
import { FundingRequirementCard } from '../components/FundingRequirementCard.jsx';
import { FundingGapCostCard } from '../components/FundingGapCostCard.jsx';
import { CashFlowRationaleCard } from '../components/CashFlowRationaleCard.jsx';
import { PaymentStrategyCard } from '../components/PaymentStrategyCard.jsx';
import { AINegotiationCopilot } from '../components/AINegotiationCopilot.jsx';
import { ArrowLeft, Building2, ChevronDown, ChevronUp, Info, MessageSquare, HelpCircle, Database, ShieldAlert, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export const DealAnalysisResultPage = ({ payload, onEditInputs }) => {
  // Execute pure calculation engines (FROZEN)
  const financialMetrics = calculateFinancialMetrics(payload);
  const decisionResult = evaluateFinancialDecision(financialMetrics);
  const cashFlowMetrics = calculateCashFlowMetrics(payload, financialMetrics);
  const strategyResult = evaluatePaymentStrategies(payload, financialMetrics, decisionResult, cashFlowMetrics);

  const { deal } = payload;
  const { recommendedStrategy } = strategyResult;

  // Supplier Selection State — Initialized to recommended strategy, but supplier has final choice
  const [selectedStrategy, setSelectedStrategy] = useState(recommendedStrategy);
  const [showDetailedCalculations, setShowDetailedCalculations] = useState(false);
  const isSelectedRecommended = selectedStrategy?.id === recommendedStrategy?.id;

  const scrollToNegotiation = () => {
    const elem = document.getElementById('negotiation-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine headline pressure status text
  const getPressureHeadline = () => {
    if (decisionResult.riskLevel === 'HIGH' || cashFlowMetrics.coverageStatus === 'HIGH FUNDING PRESSURE') {
      return { text: 'High Cash-Flow Pressure', color: 'var(--accent-rose)', bg: 'var(--accent-rose-bg)', border: 'var(--accent-rose-border)', icon: ShieldAlert };
    }
    if (decisionResult.riskLevel === 'MODERATE' || cashFlowMetrics.liquidityShortfall > 0) {
      return { text: 'Moderate Cash-Flow Pressure', color: 'var(--accent-amber)', bg: 'var(--accent-amber-bg)', border: 'var(--accent-amber-border)', icon: AlertTriangle };
    }
    return { text: 'Favorable Cash Position', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-bg)', border: 'var(--accent-emerald-border)', icon: CheckCircle2 };
  };

  const headline = getPressureHeadline();
  const HeadlineIcon = headline.icon;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem 0 4rem 0' }}>
      {/* Top Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <button
          onClick={onEditInputs}
          className="btn-secondary"
        >
          <ArrowLeft size={16} />
          <span>Edit Deal Inputs</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Building2 size={16} color="var(--accent-blue)" />
          <strong style={{ color: 'var(--text-primary)' }}>{deal.buyerName}</strong>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatINR(deal.dealValue)}</span>
        </div>
      </div>

      {/* SECTION 1 — YOUR DEAL AT A GLANCE */}
      <div className="fintech-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: headline.bg,
              color: headline.color,
              border: `1px solid ${headline.border}`,
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <HeadlineIcon size={15} />
              <span>{headline.text}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Deal Assessment Summary
          </span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {cashFlowMetrics.liquidityShortfall > 0
            ? `Your order creates a ${formatINR(cashFlowMetrics.liquidityShortfall)} funding gap before the buyer pays.`
            : `Your available cash reserves sufficiently cover fulfillment costs for this order.`}
        </h2>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Under proposed Net {financialMetrics.proposedPaymentTermDays} terms, production cash is required {cashFlowMetrics.fulfillmentPaymentTimingDays > 0 ? `on Day ${cashFlowMetrics.fulfillmentPaymentTimingDays}` : 'immediately'} while invoice collection occurs on Day {financialMetrics.proposedPaymentTermDays}.
        </p>

        {/* Top 3 Core Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Funding Gap
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cashFlowMetrics.liquidityShortfall > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              {formatINR(cashFlowMetrics.liquidityShortfall)}
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Uncovered fulfillment cost
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Payment Delay
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cashFlowMetrics.fundingGapDays > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              {cashFlowMetrics.fundingGapDays} Days
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Gap until buyer payment
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Financial Pressure Index
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: headline.color, marginTop: '0.2rem' }}>
              {decisionResult.financialPressureScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Working capital risk indicator
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — SELECTED PAYMENT STRUCTURE FOR NEGOTIATION */}
      <div className="fintech-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '1.5px solid var(--accent-blue)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              STRUCTURE SELECTED FOR NEGOTIATION
            </span>
            {isSelectedRecommended && (
              <span style={{
                fontSize: '0.675rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
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
            <span style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'var(--accent-blue)',
              color: '#FFFFFF'
            }}>
              SELECTED BY YOU
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Supplier Commercial Choice
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {selectedStrategy?.label}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {isSelectedRecommended
                ? strategyResult.recommendationReason
                : `Selected by you as your starting position for buyer negotiation (AI recommended ${recommendedStrategy?.label}).`}
            </p>
          </div>

          <button
            onClick={scrollToNegotiation}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.75rem 1.5rem', fontSize: '0.925rem' }}
          >
            <MessageSquare size={16} />
            <span>Start Negotiation</span>
          </button>
        </div>

        {/* Supporting Numbers Grid for Selected Strategy */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Upfront Payment
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {formatINR(selectedStrategy?.upfrontAmount)}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              ({selectedStrategy?.upfrontPercentage}% deposit at order)
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Funding Shortfall
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedStrategy?.fundingShortfall > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '0.15rem' }}>
              {formatINR(selectedStrategy?.fundingShortfall)}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {selectedStrategy?.fundingShortfall > 0 ? 'Shortfall under selected structure' : 'Fully covered fulfillment'}
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Estimated Funding Cost
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.15rem' }}>
              {formatINR(Math.round(selectedStrategy?.estimatedFundingCost || 0))}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Carrying cost under selected structure
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3 — ALTERNATIVE PAYMENT STRUCTURES */}
      <PaymentStrategyCard
        strategyResult={strategyResult}
        selectedStrategy={selectedStrategy}
        onSelectStrategy={(strat) => setSelectedStrategy(strat)}
      />

      {/* SECTION 4 — DETAILED CALCULATIONS & LIQUIDITY BREAKDOWN (PROGRESSIVE DISCLOSURE) */}
      <div style={{ marginTop: '2rem' }}>
        <button
          type="button"
          onClick={() => setShowDetailedCalculations((prev) => !prev)}
          className="btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={17} color="var(--accent-blue)" />
            <strong style={{ fontSize: '0.9rem' }}>
              {showDetailedCalculations ? 'Hide Detailed Financial Calculations & Cash-Flow Breakdown' : 'View Detailed Calculations & Cash-Flow Breakdown'}
            </strong>
          </div>
          {showDetailedCalculations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showDetailedCalculations && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Risk & Health Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <RiskScoreCard
                score={decisionResult.financialPressureScore}
                riskLevel={decisionResult.riskLevel}
              />
              <DecisionCard
                decisionResult={decisionResult}
                proposedTermDays={financialMetrics.proposedPaymentTermDays}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <FinancialHealthCard metrics={financialMetrics} />
              <FinancingCostCard metrics={financialMetrics} />
            </div>

            {/* Timeline & Requirement Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <CashFlowTimelineCard cashFlowMetrics={cashFlowMetrics} />
              <FundingRequirementCard cashFlowMetrics={cashFlowMetrics} />
            </div>

            <FundingGapCostCard cashFlowMetrics={cashFlowMetrics} />
            <CashFlowRationaleCard cashFlowMetrics={cashFlowMetrics} />

            {/* Assumptions Drawer */}
            <details style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.85rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={15} color="var(--accent-blue)" />
                Model Assumptions & Methodological Disclaimers
              </summary>
              <ul style={{
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
                marginTop: '0.65rem',
                paddingLeft: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                lineHeight: 1.45
              }}>
                <li><strong>Scope of Decision Logic:</strong> Evaluates working-capital carrying costs & cash liquidity based strictly on financial inputs provided.</li>
                <li><strong>Fulfillment Model:</strong> Estimates fulfillment funding requirements using user-entered estimated fulfillment cost and cash outflow timing.</li>
                <li><strong>Strategy Engine:</strong> Deterministically evaluates candidate payment structures to identify options eliminating or minimizing funding shortfalls.</li>
                <li><strong>Carrying Cost Assumptions:</strong> Estimates assume funding requirement is carried for the respective period at stated annual cost of capital (365-day year convention).</li>
                <li><strong>Index Nature:</strong> Financial Pressure Index is a deterministic heuristic indicator, not a statistical credit default model.</li>
              </ul>
            </details>

            {/* Pure Engine State Drawer */}
            <details style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={14} color="var(--accent-blue)" />
                View In-Memory Engine State (Pure Data Payload)
              </summary>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.725rem',
                color: 'var(--accent-emerald)',
                marginTop: '0.65rem',
                overflowX: 'auto',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
              }}>
                {JSON.stringify({ inputContract: payload, calculatedMetrics: financialMetrics, decisionResult, cashFlowMetrics, strategyResult, selectedStrategy }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* SECTION 5 — NEGOTIATION ASSISTANT */}
      <AINegotiationCopilot
        dealData={payload}
        strategyResult={strategyResult}
        selectedStrategy={selectedStrategy}
      />
    </div>
  );
};
