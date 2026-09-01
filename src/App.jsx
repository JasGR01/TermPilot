import React from 'react';
import { Header } from './components/Header';
import { DealAnalysisPage } from './pages/DealAnalysisPage';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className="container" style={{ flex: 1 }}>
        <DealAnalysisPage />
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        backgroundColor: '#070A10'
      }}>
        <div className="container">
          TermPilot MVP Step 1 — SME Payment-Term Decision Agent • Built with React & Vite
        </div>
      </footer>
    </div>
  );
}
