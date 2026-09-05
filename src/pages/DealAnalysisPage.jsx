import React, { useState } from 'react';
import { INITIAL_DEAL_STATE, INITIAL_FINANCIAL_PROFILE_STATE } from '../models/dealModel';
import { validateDealAnalysisForm } from '../utils/validation';
import { DealSection } from '../components/DealSection';
import { FinancialProfileSection } from '../components/FinancialProfileSection';
import { DealAnalysisResultPage } from './DealAnalysisResultPage';
import { ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DealAnalysisPage = () => {
  const [deal, setDeal] = useState(INITIAL_DEAL_STATE);
  const [financialProfile, setFinancialProfile] = useState(INITIAL_FINANCIAL_PROFILE_STATE);
  const [errors, setErrors] = useState({});
  const [submittedPayload, setSubmittedPayload] = useState(null);

  const handleDealChange = (field, value) => {
    setDeal((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleProfileChange = (field, value) => {
    setFinancialProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAnalyzeDeal = (e) => {
    e.preventDefault();
    const validation = validateDealAnalysisForm(deal, financialProfile);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmittedPayload(null);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setErrors({});

    // Build clean numeric payload contract
    const cleanPayload = {
      deal: {
        buyerName: deal.buyerName.trim(),
        dealValue: Number(deal.dealValue),
        proposedPaymentTermDays: Number(deal.proposedPaymentTermDays),
        expectedOrderDate: deal.expectedOrderDate,
        estimatedFulfillmentCost: Number(deal.estimatedFulfillmentCost),
        fulfillmentPaymentTimingDays: Math.max(0, Number(deal.fulfillmentPaymentTimingDays ?? 0))
      },
      financialProfile: {
        availableCash: Number(financialProfile.availableCash),
        monthlyOperatingExpenses: Number(financialProfile.monthlyOperatingExpenses),
        upcomingObligations: Number(financialProfile.upcomingObligations),
        existingReceivables: Number(financialProfile.existingReceivables),
        annualCostOfCapital: Number(financialProfile.annualCostOfCapital)
      }
    };

    setSubmittedPayload(cleanPayload);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditInputs = () => {
    setSubmittedPayload(null);
  };

  // If successfully submitted, render Results View
  if (submittedPayload) {
    return (
      <DealAnalysisResultPage
        payload={submittedPayload}
        onEditInputs={handleEditInputs}
      />
    );
  }

  // Otherwise render Input View
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '1rem 0 3rem 0' }}>
      {/* Page Hero */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          lineHeight: 1.25
        }}>
          Evaluate B2B Payment Terms & Cash Flow
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          marginTop: '0.5rem',
          maxWidth: '620px',
          margin: '0.5rem auto 0 auto',
          lineHeight: 1.5
        }}>
          Assess cash-flow pressure, calculate carrying costs, and receive recommended payment structures before negotiating with buyers.
        </p>
      </div>

      {/* Global Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          backgroundColor: 'var(--accent-rose-bg)',
          border: '1px solid var(--accent-rose-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--accent-rose)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Validation Required:</strong> Please check the highlighted fields ({Object.keys(errors).length} field errors).
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAnalyzeDeal} noValidate>
        <div className="form-stack">
          {/* Section 1 — Your Deal */}
          <DealSection
            deal={deal}
            errors={errors}
            onChange={handleDealChange}
          />

          {/* Section 2 — Your Cash Position (Collapsible) */}
          <FinancialProfileSection
            profile={financialProfile}
            errors={errors}
            onChange={handleProfileChange}
          />
        </div>

        {/* Primary CTA */}
        <div style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.9rem 1.5rem', fontSize: '1rem' }}>
            <span>Analyze Deal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
