# Repository Guidelines

## Project Structure & Module Organization

PLAN.md holds the implementation plan, and research/ holds competition rules, idea selection, and demo material. U1 (the three contracts, tested) has landed:

- contracts/ - Solidity: AgentIdentity.sol, ActionLedger.sol, TrustGate.sol
- test/ - Hardhat tests, one <Contract>.test.ts per contract, 26 passing
- scripts/ - deploy.ts and seed-history.ts (not written yet, U2/U3)
- frontend/src/lib/ - contract plumbing and its unit tests (not written yet, U4)
- frontend/src/components/ - TrustGateDemo.tsx (not written yet, U4)
- hardhat.config.ts - compiler (solc 0.8.24, evmVersion cancun), Hardhat 2.29 pinned to match Monad's documented tooling

Treat PLAN.md as the source of truth for scope and decisions. research/ is reference material, not source.

## Build, Test, and Development Commands

- npx hardhat test - runs the contract test suite (26 tests: 11 PLAN.md scenarios plus supplementary coverage added during U1 review)
- npx hardhat compile - compiles contracts (evmVersion cancun, required for OpenZeppelin 5.6.1's MCOPY usage)
- npx hardhat run scripts/deploy.ts --network monad - deploys in order: AgentIdentity, ActionLedger, TrustGate (script not written yet)
- npx hardhat verify --network monad <address> [args...] - verifies source on Sourcify
- Frontend tests run over frontend/src/lib/**tests**/contracts.test.ts with the scaffold's runner (frontend not scaffolded yet)

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
