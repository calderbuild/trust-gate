# TrustGate

An on-chain trust gate for AI agents on Monad. Access only clears when both sides of an interaction cryptographically sign off — an agent can never write its own history.

Built for Monad Blitz@北京 V2, 2026-08-15. Full design rationale and requirements trace: [PLAN.md](./PLAN.md).

## The problem

A 2026 empirical study of the ERC-8004 Reputation Registry ([arxiv.org/abs/2606.26028](https://arxiv.org/abs/2606.26028)) found 59.2%-90.6% of on-chain agent feedback shows Sybil patterns, because feedback is self-reported and never grounded in a verifiable interaction. Reputation exists on paper; it carries no real signal.

TrustGate fixes the specific failure mode: an interaction's outcome only becomes VERIFIED or MISMATCH once the counterparty signs off with their own key. The agent alone can never resolve its own receipt.

## How it works

Three independent contracts, each doing one job:

- **`AgentIdentity`** — registers agents, tracks active/revoked status. Owns nothing else.
- **`ActionLedger`** — records receipts between an agent and a counterparty. A receipt only resolves to `VERIFIED` or `MISMATCH` when the counterparty's own signature recovers against the receipt data (chain id + contract address + receipt id + verdict — domain-separated so a signature can't be replayed against another deployment). The agent's own owner can never create a receipt naming itself as counterparty.
- **`TrustGate`** — read-only over the other two. `previewAccess` (free, never reverts) and `checkAccess` (the real transaction) apply one policy: any `MISMATCH` on record denies, zero `VERIFIED` receipts denies, otherwise grants.

```
frontend picks an agent
  -> previewAccess(agentId)        free read, no wallet needed
  -> checkAccess(agentId)          real tx, wallet required
  -> AccessGranted / AccessDenied  read back from the mined receipt
```

## Tech stack

- **Contracts**: Solidity 0.8.24, OpenZeppelin 5.6.1, Hardhat 2.29 + TypeScript + ethers v6, targeting Monad testnet (chain id `10143`, EVM `cancun`)
- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4, ethers v6, plain injected-wallet connect (Rabby/MetaMask, no wallet-connection library)

## Running it

### Contracts

```bash
npm install
npx hardhat test              # 26 tests: PLAN.md's scenarios + review-driven coverage
npx hardhat compile
```

Deploying to Monad testnet requires a funded wallet's private key in `.env` (see `.env.example` — never commit this file):

```bash
cp .env.example .env          # fill in PRIVATE_KEY
npm run deploy:monad          # AgentIdentity -> ActionLedger -> TrustGate, in order
npm run seed:monad            # seeds real bilaterally-signed history for the demo
```

Both scripts write their results to `deployments/` and self-verify against `previewAccess` before finishing.

### Frontend

```bash
cd frontend
npm install
npm run test                  # unit tests for pure-logic helpers
npm run build                 # tsc + vite build
npm run dev                   # local dev server
```

`frontend/src/lib/addresses.ts` holds the deployed contract addresses as local constants — update it after running `deploy:monad` against the real network.

## Deployment

Contracts deploy via `scripts/deploy.ts` against Monad testnet (Sourcify-verified, not Etherscan — Monad's verification service). The frontend deploys to Vercel from `frontend/`.

## Demo account

None needed — connect any wallet with Monad testnet MON (free from `https://faucet.monad.xyz`) to send the real `checkAccess` transaction. Previewing an agent's access needs no wallet at all.

## License

UNLICENSED — hackathon submission, not intended for reuse.
