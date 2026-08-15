# Repository Guidelines

## Project Structure & Module Organization

PLAN.md holds the implementation plan, and research/ holds competition rules, idea selection, and demo material. U1 through U5 have landed: contracts, Monad testnet deploy, history seeding, frontend plumbing, and the demo UI.

- contracts/ - Solidity: AgentIdentity.sol, ActionLedger.sol, TrustGate.sol
- test/ - Hardhat tests, one <Contract>.test.ts per contract, 26 passing (AgentIdentity 6, ActionLedger 11, TrustGate 9)
- scripts/ - deploy.ts (deploys the three contracts in order), seed-history.ts (seeds bilaterally-signed demo history), gen-qr.mjs (booth QR ticket)
- deployments/ - monad.json (deployed addresses) and seed-history.monad.json (seeded agents and verdicts); both scripts write these and self-verify against previewAccess before finishing
- frontend/ - Vite + React 19 + TypeScript + Tailwind v4, ethers v6. src/lib/ holds contract plumbing, addresses, i18n, and pure-logic unit tests; src/components/ holds TrustGateDemo.tsx and its row/stamp/QR pieces
- docs/handoffs/ - dated session handoffs
- hardhat.config.ts - compiler (solc 0.8.24, evmVersion cancun), Hardhat 2.29 pinned to match Monad's documented tooling

Treat PLAN.md as the source of truth for scope and decisions. research/ is reference material, not source.

## Live Environment

Contracts are deployed on Monad testnet (chain id 10143). Sourcify verification (`npx hardhat verify`) currently fails on a tsconfig project-references conflict between the repo root and frontend/ — not yet fixed, non-blocking since contract behavior is confirmed via the test suite and live seeded transactions. Addresses live in deployments/monad.json and are hardcoded in frontend/src/lib/addresses.ts, so update the latter after any redeploy. Demo app: https://trust-gate-flax.vercel.app

## Build, Test, and Development Commands

Contracts (repo root):

- npx hardhat test - runs the 26-test suite: PLAN.md scenarios plus coverage added during U1 review
- npx hardhat compile - compiles contracts (evmVersion cancun, required for OpenZeppelin 5.6.1's MCOPY usage)
- npm run deploy:monad - deploys in order: AgentIdentity, ActionLedger, TrustGate; writes deployments/monad.json
- npm run seed:monad - seeds the three demo agents with real bilaterally-signed history; writes deployments/seed-history.monad.json
- npx hardhat verify --network monad <address> [args...] - verifies source on Sourcify

Frontend (run from frontend/):

- npm run test - vitest unit tests for pure-logic helpers
- npm run build - tsc plus vite build
- npm run lint - oxlint
- npm run dev - local dev server

The frontend deploys to Vercel from frontend/.

## Coding Style & Naming Conventions

- Solidity pinned to ^0.8.24, TypeScript elsewhere
- Contracts PascalCase; functions, events, and variables camelCase
- Denial reasons are UPPER_SNAKE_CASE: AGENT_REVOKED, MISMATCH_ON_RECORD, INSUFFICIENT_HISTORY
- UI copy ships in zh (default) and en; follow the existing i18n structure in frontend/src/lib/i18n.ts
- Follow the formatting and lint rules shipped by the scaffold

## Testing Guidelines

- Hardhat plus TypeScript; one test file per contract named <Contract>.test.ts
- Cover every scenario in PLAN.md, including the agent-cannot-self-attest case and previewAccess/checkAccess agreement on all seeded cases
- Frontend tests target pure logic helpers only, not ethers wrappers

## Commit & Pull Request Guidelines

- Use short descriptive subjects matching existing history, for example "Initial commit: project plan and README"
- No AI attribution in commits or PRs
- All commits must be timestamped inside the event window; check with git log --format=%ai before submitting
- Do not reuse code or assets from the prior SafeReceipt project

## Monad-Specific Notes

- Set gas price at or above 100 MON-gwei and set gas limits explicitly; wallet auto-estimation is unreliable here
- Denial is a return value plus an event, never a revert
- Deploy order matters: AgentIdentity, ActionLedger, then TrustGate
