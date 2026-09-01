import React, { useState } from 'react';
import { INITIAL_DEAL_STATE, INITIAL_FINANCIAL_PROFILE_STATE } from '../models/dealModel';
import { validateDealAnalysisForm } from '../utils/validation';
import { DealSection } from '../components/DealSection';
import { FinancialProfileSection } from '../components/FinancialProfileSection';
import { DealAnalysisResultPage } from './DealAnalysisResultPage';
import { ArrowRight, ShieldAlert, SlidersHorizontal } from 'lucide-react';

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

    // Build clean numeric payload contract for Step 2
    const cleanPayload = {
      deal: {
        buyerName: deal.buyerName.trim(),
        dealValue: Number(deal.dealValue),
        proposedPaymentTermDays: Number(deal.proposedPaymentTermDays),
        expectedOrderDate: deal.expectedOrderDate
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

  // If successfully submitted, render Step 2 Results View
  if (submittedPayload) {
    return (
      <DealAnalysisResultPage
        payload={submittedPayload}
        onEditInputs={handleEditInputs}
      />
    );
  }

  // Otherwise render Step 1 Input Form View
  return (
    <div style={{ padding: '2.5rem 0 4rem 0' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
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
          border: '1px solid rgba(37, 99, 235, 0.25)',
          marginBottom: '1rem'
        }}>
          <SlidersHorizontal size={14} />
          <span>Fintech Decision Engine Input Layer</span>
        </div>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2
        }}>
          B2B Deal Payment-Term Analysis
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          marginTop: '0.75rem',
          lineHeight: 1.6
        }}>
          Input proposed deal parameters alongside your SME financial metrics. TermPilot will evaluate cash-flow pressure, working capital impact, and financing costs.
        </p>
      </div>

      {/* Global Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 1.5rem auto',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--border-error)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#FCA5A5',
          fontSize: '0.875rem'
        }}>
          <ShieldAlert size={20} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Please fix validation errors: </strong>
            Check the highlighted fields below ({Object.keys(errors).length} invalid inputs).
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAnalyzeDeal} noValidate>
        <div className="form-grid">
          {/* Section 1 — Proposed Deal */}
          <DealSection
            deal={deal}
            errors={errors}
            onChange={handleDealChange}
          />

          {/* Section 2 — Business Financial Profile */}
          <FinancialProfileSection
            profile={financialProfile}
            errors={errors}
            onChange={handleProfileChange}
          />
        </div>

        {/* Primary Action Button */}
        <div style={{ maxWidth: '480px', margin: '2.5rem auto 0 auto' }}>
          <button type="submit" className="btn-primary">
            <span>Analyze Deal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
