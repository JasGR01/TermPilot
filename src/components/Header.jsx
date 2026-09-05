import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '3.75rem'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.1rem',
            height: '2.1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>
                Term<span style={{ color: 'var(--accent-blue)' }}>Pilot</span>
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              B2B payment-term advisor
            </p>
          </div>
        </div>

        {/* Security / Quality Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.775rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-main)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontWeight: 500
          }}>
            <Shield size={14} color="var(--accent-emerald)" />
            <span>AI Financial Advisor</span>
          </div>
        </div>
      </div>
    </header>
  );
};
