import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key-for-tests');

app.post('/api/negotiate', async (req, res) => {
  try {
    const { buyerMessage, validatedStrategies, accumulatedConstraints, currentStrategy } = req.body;

    if (!buyerMessage || !validatedStrategies) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!process.env.GEMINI_API_KEY) {
       console.warn("No GEMINI_API_KEY provided. Please set it in .env");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: `You are TermPilot's payment-term negotiation reasoning engine.
You may interpret buyer language and recommend only among the validated payment strategies provided to you.
You MUST NOT invent payment terms, upfront percentages, or strategies.
You MUST respect all accumulated buyer constraints.
If the buyer requests an unavailable strategy, mark it as unavailable and choose only from validated strategies.
If no validated strategy satisfies the buyer's constraints, return STOP.
If the buyer rejects terms, suggests different terms, or expresses uncertainty, the intent MUST be COUNTER or REJECT. 
Do NOT classify as ACCEPT unless the buyer explicitly agrees to the CURRENT proposed terms. 
Return only the required JSON structure.`,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 250,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            intent: {
              type: SchemaType.STRING,
              description: "Must be exactly one of: ACCEPT, REJECT, COUNTER, UNCLEAR"
            },
            buyerPosition: {
              type: SchemaType.STRING,
              description: "Short natural language summary of the buyer's position"
            },
            constraints: {
              type: SchemaType.OBJECT,
              properties: {
                upfrontRejected: {
                  type: SchemaType.BOOLEAN,
                  description: "True if the buyer explicitly rejects paying upfront"
                },
                rejectedTermDays: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.NUMBER },
                  description: "List of specific payment term days the buyer explicitly rejected (e.g. [30])"
                },
                requestedTermDays: {
                  type: SchemaType.NUMBER,
                  nullable: true,
                  description: "A specific payment term the buyer requested (e.g. 90). Null if none requested."
                },
                requestedUpfrontPercentage: {
                  type: SchemaType.NUMBER,
                  nullable: true,
                  description: "A specific upfront percentage the buyer requested (e.g. 20). Null if none requested."
                }
              },
              required: ["upfrontRejected", "rejectedTermDays"]
            },
            reasoning: {
              type: SchemaType.STRING,
              description: "Short explanation of the AI's understanding"
            },
            confidence: {
              type: SchemaType.NUMBER,
              description: "Confidence score from 0.0 to 1.0"
            }
          },
          required: ["intent", "buyerPosition", "constraints", "reasoning", "confidence"]
        }
      }
    });

    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Received request for /api/negotiate`);
    
    const prompt = `
Please analyze the following negotiation context:

Current Strategy Offered to Buyer:
${JSON.stringify(currentStrategy, null, 2)}

Previously Accumulated Buyer Constraints:
${JSON.stringify(accumulatedConstraints, null, 2)}

Currently Validated Strategies Available:
${JSON.stringify(validatedStrategies, null, 2)}

Buyer's New Message:
"${buyerMessage}"

Extract the buyer's intent, position, and constraints exactly as requested.
`;

    const geminiStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Starting Gemini generateContent...`);
    
    const result = await model.generateContent(prompt, { timeout: 30000 });
    
    const geminiEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] Gemini response received. Duration: ${geminiEndTime - geminiStartTime}ms`);

    const responseText = result.response.text();
    const jsonOutput = JSON.parse(responseText);

    const totalDuration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Backend processing complete. Total duration: ${totalDuration}ms`);
    
    res.json(jsonOutput);
  } catch (error) {
    const errorMsg = error.message.toLowerCase();
    const isTimeout = errorMsg.includes('abort') || errorMsg.includes('timeout');
    const isQuota = error.status === 429 || errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('too many requests');
    
    if (isTimeout) {
      console.error(`[${new Date().toISOString()}] Gemini API timeout/abort`, error.message);
      return res.status(504).json({ error: 'Evaluation timed out', details: error.message });
    }

    if (isQuota) {
      console.error(`[${new Date().toISOString()}] Gemini API quota exceeded`, error.message);
      return res.status(429).json({ error: 'AI service rate limit reached. Please wait a few seconds and try again.', details: error.message });
    }
    
    console.error(`[${new Date().toISOString()}] Error calling Gemini API:`, error.message);
    res.status(500).json({ error: 'Failed to process negotiation response', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`TermPilot AI proxy running on port ${PORT}`);
});
