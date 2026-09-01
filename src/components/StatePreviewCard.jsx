import React from 'react';
import { CheckCircle2, Database, Sparkles } from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters';

export const StatePreviewCard = ({ payload, onReset }) => {
  const { deal, financialProfile } = payload;

  return (
    <div style={{
      marginTop: '2rem',
      backgroundColor: '#0D1424',
      border: '1px solid #10B981',
      borderRadius: 'var(--radius-lg)',
      padding: '1.75rem',
      boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)'
    }}>
      {/* Banner Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #1E293B',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F9FAFB' }}>
              Inputs Validated & Saved to Memory
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
              Step 1 Complete: Input contract stored ready for scenario calculation engine.
            </p>
          </div>
        </div>
        
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          Edit Parameters
        </button>
      </div>

      {/* Grid of Key Stored Properties */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Buyer */}
        <div style={{ background: '#111827', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Buyer Name</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F9FAFB', marginTop: '0.25rem' }}>{deal.buyerName}</p>
        </div>

        {/* Value */}
        <div style={{ background: '#111827', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Deal Value</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60A5FA', marginTop: '0.25rem' }}>{formatINR(deal.dealValue)}</p>
        </div>

        {/* Payment Term */}
        <div style={{ background: '#111827', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Proposed Term</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F59E0B', marginTop: '0.25rem' }}>Net {deal.proposedPaymentTermDays} Days</p>
        </div>

        {/* Available Cash */}
        <div style={{ background: '#111827', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Available Cash</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34D399', marginTop: '0.25rem' }}>{formatINR(financialProfile.availableCash)}</p>
        </div>

        {/* Cost of Capital */}
        <div style={{ background: '#111827', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Borrowing Rate</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F9FAFB', marginTop: '0.25rem' }}>{formatPercent(financialProfile.annualCostOfCapital)} p.a.</p>
        </div>
      </div>

      {/* Technical Data Model JSON Drawer */}
      <details open style={{ background: '#090D16', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.75rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={14} color="#60A5FA" />
          Stored State Contract Payload (JSON Object)
        </summary>
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: '#34D399',
          marginTop: '0.75rem',
          overflowX: 'auto',
          padding: '0.75rem',
          backgroundColor: '#070A10',
          borderRadius: '6px'
        }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>

      <div style={{
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.775rem',
        color: '#9CA3AF',
        fontStyle: 'italic'
      }}>
        <Sparkles size={14} color="#60A5FA" />
        Input contract verified. Ready for Step 2.
      </div>
    </div>
  );
};
