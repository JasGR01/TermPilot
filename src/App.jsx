import React from 'react';
import { Header } from './components/Header';
import { DealAnalysisPage } from './pages/DealAnalysisPage';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Header />
      <main className="container" style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <DealAnalysisPage />
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        backgroundColor: 'var(--bg-card)'
      }}>
        <div className="container">
          TermPilot — SME B2B Payment-Term Advisor
        </div>
      </footer>
    </div>
  );
}
