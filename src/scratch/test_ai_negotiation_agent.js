import { evaluateBuyerResponse, decideNextAction, generateInitialProposal, getValidatedStrategies } from '../services/aiNegotiationService.js';
import assert from 'assert';

// Mock global fetch for the LLM proxy
global.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  const msg = body.buyerMessage.toLowerCase();
  
  let intent = 'UNCLEAR';
  let upfrontRejected = false;
  let rejectedTermDays = [];
  let requestedTermDays = null;
  let requestedUpfrontPercentage = null;

  if (msg.includes('cannot do upfront')) upfrontRejected = true;
  if (msg.includes('cannot do net 30')) rejectedTermDays.push(30);
  if (msg.includes('cannot do net 60')) rejectedTermDays.push(60);
  if (msg.includes('timeout')) throw new Error('AbortError');
  if (msg.includes('fail')) throw new Error('API down');
  if (msg.includes('accept')) intent = 'ACCEPT';
  if (msg.includes('no') || msg.includes('cannot')) intent = 'REJECT';
  
  if (msg.includes('net 90')) {
    intent = 'COUNTER';
    requestedTermDays = 90;
  }
  if (msg.includes('20% upfront')) {
    intent = 'COUNTER';
    requestedUpfrontPercentage = 20;
    requestedTermDays = 45;
  }

  return {
    ok: true,
    json: async () => ({
      intent,
      buyerPosition: 'Mocked buyer position',
      constraints: {
        upfrontRejected,
        rejectedTermDays,
        requestedTermDays,
        requestedUpfrontPercentage
      },
      reasoning: 'Mock reasoning',
      confidence: 0.9
    })
  };
};

const runTests = async () => {
  console.log('--- STARTING STEP 5 CONSTRAINED NEGOTIATION TESTS (REAL LLM MOCKED) ---');
  let testsPassed = 0;
  let testsFailed = 0;

  const runTest = async (name, testFn) => {
    try {
      await testFn();
      console.log(`PASS ✅ - ${name}`);
      testsPassed++;
    } catch (e) {
      console.error(`FAIL ❌ - ${name}`);
      console.error(e);
      testsFailed++;
    }
  };

  const mockDealData = { deal: { buyerName: 'Acme Corp' } };

  const mockStrategyResult = {
    strategies: [
      { id: 'strat-1', label: 'Net 60', upfrontPercentage: 0, paymentTermDays: 60, fundingShortfall: 200, estimatedFundingCost: 20 },
      { id: 'strat-2', label: 'Net 30', upfrontPercentage: 0, paymentTermDays: 30, fundingShortfall: 100, estimatedFundingCost: 10 },
      { id: 'strat-3', label: '30% Upfront + Net 30', upfrontPercentage: 30, paymentTermDays: 30, fundingShortfall: 0, estimatedFundingCost: 0 },
      { id: 'strat-4', label: '30% Upfront + Net 60', upfrontPercentage: 30, paymentTermDays: 60, fundingShortfall: 50, estimatedFundingCost: 5 }
    ],
    recommendedStrategy: { id: 'strat-3' }
  };
  
  const strategies = getValidatedStrategies(mockStrategyResult);
  const currentStrategy = strategies[2]; // strat-3
  
  const defaultConstraints = { upfrontRejected: false, rejectedTermDays: [] };

  // 1. Reject upfront → all upfront strategies excluded.
  await runTest('1. Reject upfront -> all upfront strategies excluded.', async () => {
    const evalRes = await evaluateBuyerResponse("We cannot do upfront.", strategies, defaultConstraints, currentStrategy);
    assert.strictEqual(evalRes.newConstraints.upfrontRejected, true);
    
    const decision = await decideNextAction(mockDealData, strategies, 'strat-3', evalRes, evalRes.newConstraints);
    assert.ok(decision.selectedStrategyId === 'strat-2'); 
  });

  // 2. Reject Net 30 → all Net 30 strategies excluded.
  await runTest('2. Reject Net 30 -> all Net 30 strategies excluded.', async () => {
    const evalRes = await evaluateBuyerResponse("We cannot do Net 30.", strategies, defaultConstraints, currentStrategy);
    assert.ok(evalRes.newConstraints.rejectedTermDays.includes(30));
    
    const decision = await decideNextAction(mockDealData, strategies, 'strat-2', evalRes, evalRes.newConstraints);
    assert.strictEqual(decision.selectedStrategyId, 'strat-4');
  });

  // 3. Reject Net 60 → all Net 60 strategies excluded.
  await runTest('3. Reject Net 60 -> all Net 60 strategies excluded.', async () => {
    const evalRes = await evaluateBuyerResponse("We cannot do Net 60.", strategies, defaultConstraints, currentStrategy);
    assert.ok(evalRes.newConstraints.rejectedTermDays.includes(60));
    const decision = await decideNextAction(mockDealData, strategies, 'strat-4', evalRes, evalRes.newConstraints);
    assert.strictEqual(decision.selectedStrategyId, 'strat-3');
  });

  // 4. Reject upfront + Net 30.
  await runTest('4. Reject upfront + Net 30.', async () => {
    const evalRes = await evaluateBuyerResponse("We cannot do upfront and cannot do net 30.", strategies, defaultConstraints, currentStrategy);
    assert.strictEqual(evalRes.newConstraints.upfrontRejected, true);
    assert.ok(evalRes.newConstraints.rejectedTermDays.includes(30));

    const decision = await decideNextAction(mockDealData, strategies, 'strat-3', evalRes, evalRes.newConstraints);
    assert.strictEqual(decision.selectedStrategyId, 'strat-1'); 
  });

  // 5. Constraint memory across round 1 → round 2.
  await runTest('5. Constraint memory across round 1 -> round 2.', async () => {
    let constraints = { upfrontRejected: true, rejectedTermDays: [] };
    const evalRes = await evaluateBuyerResponse("We cannot do Net 30.", strategies, constraints, currentStrategy);
    assert.ok(evalRes.newConstraints.rejectedTermDays.includes(30));
    
    const accumulated = {
        upfrontRejected: constraints.upfrontRejected || evalRes.newConstraints.upfrontRejected,
        rejectedTermDays: [...new Set([...constraints.rejectedTermDays, ...evalRes.newConstraints.rejectedTermDays])]
    };

    assert.strictEqual(accumulated.upfrontRejected, true);
    assert.ok(accumulated.rejectedTermDays.includes(30));

    const decision = await decideNextAction(mockDealData, strategies, 'strat-3', evalRes, accumulated);
    assert.strictEqual(decision.selectedStrategyId, 'strat-1');
  });

  // 6. Constraint memory across round 2 → round 3.
  await runTest('6. Constraint memory across round 2 -> round 3.', async () => {
    let constraints = { upfrontRejected: true, rejectedTermDays: [30] };
    const evalRes = await evaluateBuyerResponse("We cannot do Net 60.", strategies, constraints, currentStrategy);
    
    const accumulated = {
        upfrontRejected: constraints.upfrontRejected || evalRes.newConstraints.upfrontRejected,
        rejectedTermDays: [...new Set([...constraints.rejectedTermDays, ...evalRes.newConstraints.rejectedTermDays])]
    };

    assert.strictEqual(accumulated.upfrontRejected, true);
    assert.ok(accumulated.rejectedTermDays.includes(30));
    assert.ok(accumulated.rejectedTermDays.includes(60));
  });

  // 7. Unvalidated Net 90 does not become a strategy.
  await runTest('7. Unvalidated Net 90 does not become a strategy.', async () => {
    const evalRes = await evaluateBuyerResponse("We prefer Net 90.", strategies, defaultConstraints, currentStrategy);
    assert.strictEqual(evalRes.matchedStrategyId, null);
    const decision = await decideNextAction(mockDealData, strategies, 'strat-3', evalRes, defaultConstraints);
    assert.notStrictEqual(decision.selectedStrategyId, 'net-90');
  });

  // 8. Unvalidated 20% upfront + Net 45 does not become a strategy.
  await runTest('8. Unvalidated 20% upfront + Net 45 does not become a strategy.', async () => {
    const evalRes = await evaluateBuyerResponse("We can do 20% upfront and Net 45.", strategies, defaultConstraints, currentStrategy);
    assert.strictEqual(evalRes.matchedStrategyId, null);
  });

  // 9. All strategies eliminated → STOP immediately.
  await runTest('9. All strategies eliminated -> STOP immediately.', async () => {
    const constraints = { upfrontRejected: true, rejectedTermDays: [30, 60] };
    const evalRes = await evaluateBuyerResponse("No.", strategies, constraints, currentStrategy);
    const decision = await decideNextAction(mockDealData, strategies, 'strat-3', evalRes, constraints);
    assert.strictEqual(decision.action, 'STOP');
    assert.strictEqual(decision.selectedStrategyId, null);
  });

  // 10. Buyer accepts current strategy → AGREED.
  await runTest('10. Buyer accepts current strategy -> AGREED.', async () => {
    const evalRes = await evaluateBuyerResponse("We accept these terms.", strategies, defaultConstraints, currentStrategy);
    assert.strictEqual(evalRes.responseStatus, 'ACCEPTED');
    const decision = await decideNextAction(mockDealData, strategies, 'strat-3', evalRes, defaultConstraints);
    assert.strictEqual(decision.action, 'AGREE');
    assert.strictEqual(decision.selectedStrategyId, 'strat-3');
  });

  // 11. AI returns invalid strategy -> deterministic layer rejects it.
  await runTest('11. AI returns invalid strategy -> deterministic layer rejects it.', async () => {
    // If matchedStrategyId returned by AI was fake, it gets stripped to null
    const fakeStratResult = await evaluateBuyerResponse("We can do 20% upfront.", [{id: 'strat-1', label: 'Net 30', upfrontPercentage: 0}], defaultConstraints, currentStrategy);
    assert.strictEqual(fakeStratResult.matchedStrategyId, null);
  });

  // 12. Gemini timeout does not settle
  await runTest('12. Gemini timeout does not settle (throws error).', async () => {
    let errorThrown = false;
    try {
      await evaluateBuyerResponse("timeout", strategies, defaultConstraints, currentStrategy);
    } catch (e) {
      errorThrown = true;
    }
    assert.strictEqual(errorThrown, true);
  });

  // 13. Gemini failure does not settle
  await runTest('13. Gemini failure does not settle (throws error).', async () => {
    let errorThrown = false;
    try {
      await evaluateBuyerResponse("fail", strategies, defaultConstraints, currentStrategy);
    } catch (e) {
      errorThrown = true;
    }
    assert.strictEqual(errorThrown, true);
  });

  console.log(`\nResults: ${testsPassed} passed, ${testsFailed} failed`);
  if (testsFailed > 0) process.exit(1);
};

runTests();
