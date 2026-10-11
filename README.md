# SherlockLedger

**Every claim. Every source. Every decision.**

SherlockLedger is a claim-verification and evidence-tracking tool for investigating factual claims from AI-generated answers and other sources. It is a verification tool, not an AI model. Its value is traceability: you can see the claim, the evidence considered, the decision, the reviewer's notes, and the history of changes.

## Status

Early development. The project foundation is in place (React, TypeScript, Vite, ESLint). The claim and evidence workflow is not built yet.

## Planned workflow

1. Capture factual claims that need checking.
2. Find and record relevant evidence and source references.
3. Assess each claim as Supported, Contradicted, or Unverified.
4. Record reviewer notes explaining the decision.
5. Keep an audit trail of sources, decisions, notes, and changes.

## Principles

- Real functionality, not a fake demo.
- Never invent sources or claim verification that has not occurred.
- If an evidence provider is unavailable, an API key is missing, or a service fails, show an honest unavailable or error state.
- Understand an external service's function, free tier, limits, key requirements, and cost before integrating it.
- Keep test fixtures isolated in tests, never presented as real evidence.

## Tech stack

- React and TypeScript
- Vite
- ESLint
- Deployment to Vercel (planned)

## Getting started

Requires Node.js and npm.

    git clone https://github.com/ssghaany-cmd/sherlockledger.git
    cd sherlockledger
    npm install
    npm run dev

## Scripts

- `npm run dev` starts the development server
- `npm run build` type-checks and builds for production
- `npm run lint` runs ESLint

## Roadmap

1. Project foundation: clean install, dev run, production build (done)
2. Modular structure and the first claim/evidence workflow
3. Input validation, error handling, strong types, persistent records
4. Automated tests with Vitest and Testing Library
5. README upkeep, `.env.example`, committed lockfile, GitHub Actions CI
6. Security and dependency review, fresh-clone check, Vercel deployment
