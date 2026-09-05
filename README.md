# TermPilot

## AI-Powered B2B Payment-Term Negotiation Agent

TermPilot helps businesses evaluate B2B payment terms by analyzing
cash-flow pressure, funding requirements, and borrowing costs, then
recommending financially viable negotiation strategies.

## Features

- Cash-flow analysis
- Funding-gap calculation
- Payment-term strategy recommendation
- AI-powered buyer-response evaluation
- Multi-round payment-term negotiation
- Financial risk and pressure analysis
- API rate-limit and timeout handling

## Tech Stack

- React
- JavaScript
- Node.js
- Google Gemini API
- Vite

## Running Locally

```bash
npm install
npm run dev
```

For the AI functionality, configure the required Gemini API key
using environment variables in a `.env` file.

## Project Structure
- `src/` — frontend application
- `src/engine/` — financial analysis engines
- `src/components/` — UI components
- `server/` — backend AI proxy
