# Repository Guidelines

## Project Structure & Module Organization

The repo is planning-stage today: PLAN.md holds the implementation plan, and research/ holds competition rules, idea selection, and demo material. Source code is not scaffolded yet.

Per PLAN.md, implementation lands as:

- contracts/ - Solidity: AgentIdentity.sol, ActionLedger.sol, TrustGate.sol
- test/ - Hardhat tests, one <Contract>.test.ts per contract
- scripts/ - deploy.ts and seed-history.ts
- frontend/src/lib/ - contract plumbing and its unit tests
- frontend/src/components/ - TrustGateDemo.tsx
- hardhat.config.ts - compiler, network, and Sourcify config

Treat PLAN.md as the source of truth for scope and decisions. research/ is reference material, not source.

## Build, Test, and Development Commands

No build exists yet; the test script in package.json is a placeholder. After the Hardhat scaffold lands:

- npx hardhat test - runs the 11 contract scenarios defined in PLAN.md
- npx hardhat run scripts/deploy.ts --network monad - deploys in order: AgentIdentity, ActionLedger, TrustGate
- npx hardhat verify --network monad <address> [args...] - verifies source on Sourcify
- Frontend tests run over frontend/src/lib/__tests__/contracts.test.ts with the scaffold's runner

## Coding Style & Naming Conventions

- Solidity pinned to ^0.8.24, TypeScript elsewhere
- Contracts PascalCase; functions, events, and variables camelCase
- Denial reasons are UPPER_SNAKE_CASE: AGENT_REVOKED, MISMATCH_ON_RECORD, INSUFFICIENT_HISTORY
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
