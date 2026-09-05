/**
 * aiNegotiationService.js
 * 
 * Clean integration boundary for AI/LLM capabilities representing the
 * TermPilot constrained negotiation agent.
 * 
 * Uses mocked LLM interactions to adhere to security rules (no hardcoded API keys),
 * but implements the full deterministic constrained agent policy for strategy selection
 * including buyer constraints extraction and multi-round memory.
 */

// 1. getValidatedStrategies
export const getValidatedStrategies = (strategyResult) => {
  return strategyResult?.strategies || [];
};

// Extracts constraints and classifies response using Real LLM Proxy
export const evaluateBuyerResponse = async (buyerMessage, validatedStrategies, accumulatedConstraints, currentStrategy) => {
  if (!buyerMessage || typeof buyerMessage !== 'string') {
    throw new Error("Missing or invalid buyer message");
  }

  try {
    const response = await fetch('http://localhost:3002/api/negotiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        buyerMessage,
        validatedStrategies,
        accumulatedConstraints,
        currentStrategy
      })
    });

    if (!response.ok) {
      if (response.status === 504) {
        throw new Error("Evaluation timed out after 30 seconds. Please try again.");
      }
      if (response.status === 429) {
        throw new Error("AI service rate limit reached. Please wait a few seconds and try again.");
      }
      const errorText = await response.text();
      let details = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error) details = parsed.error;
      } catch(e) {}
      throw new Error(`API error ${response.status}: ${details}`);
    }

    const data = await response.json();

    // Map intent to responseStatus
    let responseStatus = 'UNCLEAR';
    if (data.intent === 'ACCEPT') responseStatus = 'ACCEPTED';
    if (data.intent === 'REJECT') responseStatus = 'REJECTED';
    if (data.intent === 'COUNTER') responseStatus = 'COUNTERED';

    let matchedStrategyId = null;
    if (data.intent === 'COUNTER') {
      const rTerm = data.constraints.requestedTermDays;
      const rUpfront = data.constraints.requestedUpfrontPercentage;
      
      const altStrategy = validatedStrategies.find(s => {
        let match = true;
        if (rTerm !== null && s.paymentTermDays !== rTerm) match = false;
        if (rUpfront !== null && s.upfrontPercentage !== rUpfront) match = false;
        return match;
      });
      
      if (altStrategy) {
        matchedStrategyId = altStrategy.id;
      }
    }

    const llmResponse = {
      buyerPosition: data.buyerPosition,
      responseStatus,
      matchedStrategyId,
      newConstraints: {
        upfrontRejected: data.constraints.upfrontRejected || false,
        rejectedTermDays: data.constraints.rejectedTermDays || []
      },
      reasoning: data.reasoning
    };

    if (llmResponse.matchedStrategyId) {
      const isValid = validatedStrategies.some(s => s.id === llmResponse.matchedStrategyId);
      if (!isValid) llmResponse.matchedStrategyId = null;
    }

    return llmResponse;
  } catch (error) {
    console.error("Failed to evaluate buyer response:", error);
    throw new Error(error.message || "Failed to reach negotiation AI proxy.");
  }
};

// Helper: Strategy sorting logic (deterministic policy)
const sortStrategiesByPolicy = (strategies) => {
  return [...strategies].sort((a, b) => {
    // 1. lower funding shortfall
    if (a.fundingShortfall !== b.fundingShortfall) return a.fundingShortfall - b.fundingShortfall;
    // 2. lower funding cost
    if (a.estimatedFundingCost !== b.estimatedFundingCost) return a.estimatedFundingCost - b.estimatedFundingCost;
    // 3. lower upfront percentage
    if (a.upfrontPercentage !== b.upfrontPercentage) return a.upfrontPercentage - b.upfrontPercentage;
    // 4. shorter payment term
    return a.paymentTermDays - b.paymentTermDays;
  });
};

// 3. selectStrategy
// Deterministic policy to choose the next strategy. Filters by accumulated buyer constraints first.
export const selectStrategy = (validatedStrategies, buyerResponseResult, currentStrategyId, buyerConstraints) => {
  const { responseStatus, matchedStrategyId } = buyerResponseResult;

  if (responseStatus === 'ACCEPTED') {
    return validatedStrategies.find(s => s.id === currentStrategyId) || null;
  }

  if (responseStatus === 'COUNTERED' && matchedStrategyId) {
    const matched = validatedStrategies.find(s => s.id === matchedStrategyId);
    // Explicit acceptance of a counter proposal can override constraints if needed, but per requirement 9, 
    // "keep the previous constraint and require a validated strategy acceptance before changing". 
    // If matchedStrategyId is valid and buyer explicitly proposed it, we select it.
    if (matched) return matched;
  }

  // Filter 1: Apply Accumulated Buyer Constraints
  let compatibleStrategies = validatedStrategies.filter(s => {
    if (buyerConstraints.upfrontRejected && s.upfrontPercentage > 0) return false;
    if (buyerConstraints.rejectedTermDays.includes(s.paymentTermDays)) return false;
    return true;
  });

  // Filter 2: Remove current strategy unless there are no other options
  let remainingStrategies = compatibleStrategies.filter(s => s.id !== currentStrategyId);
  
  if (remainingStrategies.length === 0) {
    return null; // Triggers STOP
  }

  // Filter 3: Rank remaining
  const sorted = sortStrategiesByPolicy(remainingStrategies);
  
  // 4. Select best
  return sorted[0];
};

// 4. decideNextAction (Agent decision step)
export const decideNextAction = async (dealData, validatedStrategies, currentStrategyId, buyerResponseResult, buyerConstraints) => {

  const { responseStatus } = buyerResponseResult;
  const { deal } = dealData;
  const selectedStrategy = selectStrategy(validatedStrategies, buyerResponseResult, currentStrategyId, buyerConstraints);

  let action = 'STOP';
  let reason = "No validated strategy satisfies the buyer's stated constraints.";
  let draftResponse = '';
  let finalSelectedId = null;

  if (responseStatus === 'ACCEPTED') {
    action = 'AGREE';
    reason = 'Buyer accepted the proposed strategy.';
    finalSelectedId = currentStrategyId;
    draftResponse = `Hi Team at ${deal.buyerName},\n\nExcellent. We are glad we could reach an agreement on these terms.\n\nWe will proceed with the order processing.`;
  } else if (selectedStrategy) {
    action = 'COUNTER';
    const understanding = buyerResponseResult.reasoning ? `${buyerResponseResult.reasoning} ` : '';
    const constraintDesc = buyerConstraints.upfrontRejected ? 'no upfront payment' : 'active buyer constraints';
    reason = `${understanding}Enforced buyer constraint (${constraintDesc}) and selected validated strategy "${selectedStrategy.label}" (${selectedStrategy.upfrontPercentage}% upfront + Net ${selectedStrategy.paymentTermDays}) to minimize funding cost.`;
    finalSelectedId = selectedStrategy.id;
    
    const upfrontStr = selectedStrategy.upfrontPercentage > 0 ? `${selectedStrategy.upfrontPercentage}% upfront` : 'No upfront payment';
    draftResponse = `Hi Team at ${deal.buyerName},\n\nWe understand your position. To bridge the gap, we can offer an alternative structure:\n- ${upfrontStr}\n- Balance paid on Net ${selectedStrategy.paymentTermDays} terms\n\nThis structure (${selectedStrategy.label}) allows us to fulfill the order. Please let us know if this is acceptable.`;
  }

  const agentDecision = {
    action,
    selectedStrategyId: finalSelectedId,
    reason,
    draftResponse
  };

  // Critical check
  if (agentDecision.selectedStrategyId) {
    const isValid = validatedStrategies.some(s => s.id === agentDecision.selectedStrategyId);
    if (!isValid) throw new Error("AI Agent attempted to select an unvalidated strategy ID. Request rejected.");
  }

  return agentDecision;
};

// For initial proposal generation (Agent initiating)
export const generateInitialProposal = async (dealData, selectedStrategy) => {

  if (!dealData || !selectedStrategy) throw new Error('Missing required data for proposal generation.');

  const { deal } = dealData;
  const { label, upfrontPercentage, paymentTermDays } = selectedStrategy;

  const upfrontStr = upfrontPercentage > 0 ? `${upfrontPercentage}% upfront` : 'No upfront payment';
  
  const draftResponse = `Hi Team at ${deal.buyerName},

Thank you for the opportunity to work together on this order. We've reviewed the scope and our current fulfillment capacity.

To ensure we can dedicate the necessary resources and deliver on time, we'd like to propose the following payment structure:
- ${upfrontStr}
- Balance paid on Net ${paymentTermDays} terms

This structure (${label}) allows us to cover our initial fulfillment requirements while offering you reasonable payment terms. 

Please let us know if this works for you.

Best regards,
[Your Name/Company]`;

  return draftResponse;
};
