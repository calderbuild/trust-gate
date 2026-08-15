# Manual Tasks (Lead)

Living checklist of things that need a human, not code. Maps to PLAN.md's U6 track — runs in parallel with Eng's units, not after them. Check items off as you go; add new ones if something comes up that isn't here.

## Now — blocking Eng

- [ ] **History script for U3**: 2-3 sentences per seeded agent (2-3 agents total) — what task it did, who the counterparty was, why one is clean and one is flagged. Needed before Eng seeds on-chain history (U3), which runs right after deploy (U2). Not needed for U1 (contracts + tests, in progress now).

## Now — not blocking, but needed soon

- [ ] **Wallet**: install Rabby (recommended over MetaMask per the org's own guidance), add Monad testnet manually:
  - RPC: `https://testnet-rpc.monad.xyz`
  - Chain ID: `10143`
  - Decide: is this wallet just for the live demo click-through, or also the deploy wallet Eng's scripts use? Either works — flag your preference.
- [ ] **Faucet**: `https://testnet.monad.xyz` — fund that wallet with MON. Fund generously; Monad's Reserve Balance mechanism can revert an already-included transaction if the balance is cutting it close, and that looks exactly like a contract bug when it isn't.
- [ ] **MOJO**: confirm logged in at `mojo.devnads.com`, registered for the event, team/captain set. Only the captain can submit later, and no team changes are possible after submission — lock this in early.

## Whenever you have a spare minute

- [ ] Start the MOJO submission form fields (logo, preview image, description) — doesn't need working code yet.
- [ ] Draft the demo narrative half: what TrustGate is and why it matters (the ERC-8004 study finding unverified/Sybil feedback), the KTD1 honest limitation (fixes a lone liar, not two colluding keys under one operator), timed to fit a 5-minute slot.
- [ ] Vercel login/account (only actually needed once U5's frontend is ready to deploy).
- [ ] Vote for other teams on MOJO — counts as your activity requirement (R9), do it anytime before the deadline.

## Later — will need you at these points

- [ ] **After U3 (seeded history)**: review the seeded agents against your history script — confirm the on-chain result (clean agent = GRANT, flagged agent = DENY/MISMATCH) matches what the demo narrative says happened.
- [ ] **Once U5's frontend is visually working**: do a cold-read pass as a first-time user with zero explanation from Eng. Report confusion points in plain language — this is real UX signal a solo builder can't get by testing their own work.
- [ ] **By 17:30**: capture fallback screenshots + a short screen recording of the working flow, regardless of the live app's state at that moment (R10 requires this fallback to exist no matter what).
- [ ] **Before the deadline**: submit the project on MOJO (captain only).
- [ ] **18:00-18:30**: join Eng for at least one full timed rehearsal of the 5-minute demo slot against the live deployed contracts.

## Deadline

Target **18:30** (on-site notes mention 19:00 but that's unconfirmed — treat 18:30 as the real deadline with safety margin).
