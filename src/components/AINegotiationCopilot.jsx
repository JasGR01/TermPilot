import React, { useState, useEffect } from 'react';
import { Bot, MessageSquareText, ShieldAlert, ShieldCheck, Sparkles, CheckCircle2, XCircle, Hand, AlertTriangle, Play, Copy, Check, Info } from 'lucide-react';
import { evaluateBuyerResponse, decideNextAction, generateInitialProposal } from '../services/aiNegotiationService.js';

export const AINegotiationCopilot = ({ dealData, strategyResult, selectedStrategy }) => {
  const strategies = strategyResult?.strategies || [];
  const defaultStartingStrategy = selectedStrategy || strategyResult?.recommendedStrategy || strategies[0] || null;
  
  const [agentState, setAgentState] = useState({
    round: 1,
    maxRounds: 3,
    buyerPosition: "",
    buyerResponseStatus: "",
    selectedStrategyId: defaultStartingStrategy?.id || null,
    conversationHistory: [],
    buyerConstraints: {
      upfrontRejected: false,
      rejectedTermDays: []
    },
    status: "ACTIVE", // ACTIVE | AGREED | STOPPED | MAX_ROUNDS_REACHED
    
    agentAction: null,
    agentReason: null,
    draftResponse: null,
  });

  const [buyerMessage, setBuyerMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Copy draft proposal to clipboard
  const handleCopyProposal = async () => {
    if (!agentState.draftResponse) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(agentState.draftResponse);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = agentState.draftResponse;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Generate proposal for a target strategy
  const generateProposalForStrategy = async (targetStrategy) => {
    if (!dealData || !targetStrategy) return;
    try {
      setIsProcessing(true);
      setError('');
      const draft = await generateInitialProposal(dealData, targetStrategy);
      
      setAgentState(prev => ({
        ...prev,
        selectedStrategyId: targetStrategy.id,
        agentAction: 'PROPOSE_INITIAL',
        agentReason: `Supplier selected starting strategy "${targetStrategy.label}".`,
        draftResponse: draft
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync selectedStrategy prop changes if in Round 1 before buyer response
  useEffect(() => {
    if (selectedStrategy && agentState.round === 1 && !agentState.buyerPosition) {
      generateProposalForStrategy(selectedStrategy);
    }
  }, [selectedStrategy?.id]);

  // Initial generation on mount if not yet generated
  useEffect(() => {
    if (strategies.length > 0 && defaultStartingStrategy && !agentState.draftResponse) {
      generateProposalForStrategy(defaultStartingStrategy);
    }
  }, []);

  const handleAnalyzeAndDecide = async () => {
    if (!buyerMessage.trim() || agentState.status !== 'ACTIVE') return;
    
    try {
      setIsProcessing(true);
      setError('');
      
      const currentStrategy = strategies.find(s => s.id === agentState.selectedStrategyId);
      const responseAnalysis = await evaluateBuyerResponse(
        buyerMessage, 
        strategies, 
        agentState.buyerConstraints, 
        currentStrategy
      );
      
      const newConstraints = responseAnalysis.newConstraints || { upfrontRejected: false, rejectedTermDays: [] };
      const accumulatedConstraints = {
        upfrontRejected: agentState.buyerConstraints.upfrontRejected || newConstraints.upfrontRejected,
        rejectedTermDays: [...new Set([...agentState.buyerConstraints.rejectedTermDays, ...newConstraints.rejectedTermDays])]
      };

      const decision = await decideNextAction(
        dealData, 
        strategies, 
        agentState.selectedStrategyId, 
        responseAnalysis,
        accumulatedConstraints
      );

      setAgentState(prev => {
        let newStatus = 'ACTIVE';
        if (decision.action === 'AGREE') newStatus = 'AGREED';
        if (decision.action === 'STOP') newStatus = 'STOPPED';

        return {
          ...prev,
          buyerPosition: responseAnalysis.buyerPosition,
          buyerResponseStatus: responseAnalysis.responseStatus,
          agentAction: decision.action,
          selectedStrategyId: decision.selectedStrategyId,
          agentReason: decision.reason,
          draftResponse: decision.draftResponse,
          buyerConstraints: accumulatedConstraints,
          status: newStatus
        };
      });

    } catch (err) {
      setError(err.message || 'Failed to process buyer response');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAndContinue = () => {
    if (agentState.status === 'AGREED' || agentState.status === 'STOPPED') {
      return;
    }

    if (agentState.round >= agentState.maxRounds) {
      setAgentState(prev => ({ ...prev, status: 'MAX_ROUNDS_REACHED' }));
      return;
    }

    setAgentState(prev => ({
      ...prev,
      round: prev.round + 1,
      buyerPosition: "",
      buyerResponseStatus: "",
      agentAction: 'AWAITING_BUYER',
      agentReason: null,
      draftResponse: null,
    }));
    setBuyerMessage('');
  };

  const handleStopNegotiation = () => {
    setAgentState(prev => ({ ...prev, status: 'STOPPED' }));
  };

  if (!dealData || !strategyResult) return null;

  const currentStrategy = strategies.find(s => s.id === agentState.selectedStrategyId);

  return (
    <div id="negotiation-section" className="fintech-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      {/* 1. NEGOTIATION FLOW CLARITY */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <span>Supplier Selects</span>
        <span style={{ color: 'var(--border-color)' }}>→</span>
        <span>TermPilot Drafts</span>
        <span style={{ color: 'var(--border-color)' }}>→</span>
        <span>You Send</span>
        <span style={{ color: 'var(--border-color)' }}>→</span>
        <span>Paste Response</span>
        <span style={{ color: 'var(--border-color)' }}>→</span>
        <span>AI Analyzes</span>
      </div>

      {/* Header & 2. AGENT STATUS & 3. ROUND PROGRESS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="section-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', margin: 0 }}>
            <Bot size={20} />
          </div>
          <div>
            <h2 className="section-title" style={{ margin: 0, fontSize: '1.15rem' }}>Negotiation Assistant</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 500 }}>
              {agentState.status === 'ACTIVE' && agentState.agentAction === 'AWAITING_BUYER' ? 'Waiting for buyer response...' :
               agentState.status === 'ACTIVE' && agentState.draftResponse ? 'Proposal ready to send' :
               agentState.status === 'AGREED' ? 'Agreement Reached' :
               agentState.status === 'STOPPED' ? 'Negotiation stopped' :
               agentState.status === 'MAX_ROUNDS_REACHED' ? 'Maximum rounds reached' : 'Ready to negotiate'}
            </div>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.4rem 0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '99px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.2rem' }}>Rounds</span>
          {[1, 2, 3].map(r => (
            <div key={r} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: agentState.round === r ? 'var(--accent-blue)' : agentState.round > r ? 'var(--accent-emerald)' : 'var(--border-color)',
            }} title={`Round ${r}`} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left Column: AGENT DECISION & DRAFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Analysis & Decision (Replaces the inline rationale) */}
          {agentState.agentAction && agentState.agentAction !== 'PROPOSE_INITIAL' && agentState.agentAction !== 'AWAITING_BUYER' && (
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                Analysis & Decision
              </div>
              
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {agentState.buyerPosition && (
                  <div>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MessageSquareText size={12}/> AI Understanding</span>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{agentState.buyerPosition}</div>
                  </div>
                )}
                
                {(agentState.buyerConstraints.upfrontRejected || agentState.buyerConstraints.rejectedTermDays.length > 0) && (
                  <div>
                    <span style={{ fontSize: '0.675rem', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Hand size={12}/> Buyer Constraints</span>
                    <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1.15rem', fontSize: '0.825rem', color: 'var(--accent-rose)' }}>
                      {agentState.buyerConstraints.upfrontRejected && <li>No upfront payment accepted</li>}
                      {agentState.buyerConstraints.rejectedTermDays.map(term => (
                        <li key={term}>Net {term} rejected</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <span style={{ fontSize: '0.675rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Sparkles size={12}/> Agent Decision</span>
                  <div style={{ fontSize: '0.825rem', color: agentState.agentAction === 'AGREE' ? 'var(--accent-emerald)' : (agentState.agentAction === 'STOP' ? 'var(--accent-rose)' : 'var(--text-primary)'), fontWeight: 600, marginTop: '0.2rem' }}>
                    {agentState.agentAction}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Info size={12}/> Reasoning</span>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {agentState.agentReason}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draft Proposal */}
          {agentState.draftResponse && (
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                  Draft Proposal
                </h3>
                <button
                  type="button"
                  onClick={handleCopyProposal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    color: isCopied ? 'var(--accent-emerald)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    backgroundColor: isCopied ? 'var(--accent-emerald-bg)' : 'var(--bg-card)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Explicit Draft Banner */}
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', backgroundColor: 'var(--accent-amber-bg)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', border: '1px solid var(--accent-amber-border)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <AlertTriangle size={14} />
                This is a draft generated by TermPilot. Review it before sending.
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.825rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5, flex: 1 }}>
                {agentState.draftResponse}
              </div>
            </div>
          )}
          
          {agentState.agentAction === 'AWAITING_BUYER' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
              Awaiting buyer response...
            </div>
          )}
        </div>

        {/* Right Column: BUYER RESPONSE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquareText size={16} color="var(--accent-blue)" />
              Buyer Response
            </h3>
            
            {agentState.status === 'AGREED' ? (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--accent-emerald-bg)', 
                border: '1px solid var(--accent-emerald-border)', 
                borderRadius: 'var(--radius-sm)', 
                color: 'var(--accent-emerald)', 
                fontSize: '0.875rem',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                Agreement reached. No further buyer response is required.
              </div>
            ) : (
              <>
                <textarea 
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  placeholder="Paste buyer's email or message here..."
                  disabled={agentState.status !== 'ACTIVE' || agentState.agentAction !== 'AWAITING_BUYER'}
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    marginBottom: '0.85rem'
                  }}
                />

                <button 
                  onClick={handleAnalyzeAndDecide}
                  disabled={isProcessing || !buyerMessage.trim() || agentState.status !== 'ACTIVE' || agentState.agentAction !== 'AWAITING_BUYER'}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '0.4rem', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: (isProcessing || !buyerMessage.trim() || agentState.status !== 'ACTIVE' || agentState.agentAction !== 'AWAITING_BUYER') ? 'var(--border-color)' : 'var(--accent-blue)',
                    color: (isProcessing || !buyerMessage.trim() || agentState.status !== 'ACTIVE' || agentState.agentAction !== 'AWAITING_BUYER') ? 'var(--text-muted)' : 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: (isProcessing || !buyerMessage.trim() || agentState.status !== 'ACTIVE' || agentState.agentAction !== 'AWAITING_BUYER') ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isProcessing ? <Sparkles size={16} /> : <Bot size={16} />}
                  {isProcessing ? 'Evaluating...' : 'Evaluate Buyer Response'}
                </button>
              </>
            )}

            {error && (
              <div style={{ marginTop: '0.75rem', color: 'var(--accent-rose)', fontSize: '0.8rem', padding: '0.5rem', backgroundColor: 'var(--accent-rose-bg)', borderRadius: '4px' }}>{error}</div>
            )}
          </div>

          {/* Action Controls & Human-in-the-loop reminder */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
              Negotiation Control
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
              Review the recommendation before continuing.
            </p>
            
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button 
                onClick={handleApproveAndContinue}
                disabled={agentState.status !== 'ACTIVE' || agentState.agentAction === 'AWAITING_BUYER' || isProcessing}
                style={{ 
                  flex: 1,
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '0.4rem', 
                  alignItems: 'center', 
                  padding: '0.65rem',
                  backgroundColor: (agentState.status !== 'ACTIVE' || agentState.agentAction === 'AWAITING_BUYER') ? 'var(--border-color)' : 'var(--accent-emerald)',
                  color: (agentState.status !== 'ACTIVE' || agentState.agentAction === 'AWAITING_BUYER') ? 'var(--text-muted)' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: (agentState.status !== 'ACTIVE' || agentState.agentAction === 'AWAITING_BUYER' || isProcessing) ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle2 size={15} /> Continue to Next Round
              </button>
              <button 
                onClick={handleStopNegotiation}
                disabled={agentState.status !== 'ACTIVE' || isProcessing}
                style={{ 
                  flex: 1,
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '0.4rem', 
                  alignItems: 'center', 
                  padding: '0.65rem',
                  backgroundColor: 'transparent',
                  color: (agentState.status !== 'ACTIVE') ? 'var(--text-muted)' : 'var(--accent-rose)',
                  border: `1px solid ${(agentState.status !== 'ACTIVE') ? 'var(--border-color)' : 'var(--accent-rose-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: (agentState.status !== 'ACTIVE' || isProcessing) ? 'not-allowed' : 'pointer'
                }}
              >
                <XCircle size={15} /> Stop Negotiation
              </button>
            </div>
            
            <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              TermPilot recommends. You decide what to send.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
