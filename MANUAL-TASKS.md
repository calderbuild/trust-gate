# Manual Tasks (Lead)

Living checklist of things that need a human, not code. Maps to PLAN.md's U6 track — runs in parallel with Eng's units, not after them. Check items off as you go; add new ones if something comes up that isn't here.

## Now — blocking Eng

- [ ] **History script for U3**: 2-3 sentences per seeded agent (2-3 agents total) — what task it did, who the counterparty was, why one is clean and one is flagged. Needed before Eng seeds on-chain history (U3), which runs right after deploy (U2). Not needed for U1 (contracts + tests, in progress now).

## Now — not blocking, but needed soon

- [ ] **Wallet**: install Rabby (recommended over MetaMask per the org's own guidance), add Monad testnet manually:
  - RPC: `https://testnet-rpc.monad.xyz`
  - Chain ID: `10143`
  - Decided: this wallet doubles as the deploy wallet Eng's scripts use (not demo-only). Eng needs the private key for `.env` (`.env` is gitignored) — coordinating exact var name with Eng session, will export once confirmed.
- [x] **Faucet**: `https://testnet.monad.xyz` redirects to the dev portal now — the working URL is **`https://faucet.monad.xyz`**. Also found a second, event-specific faucet inside MOJO itself (event page → 水龙头 tab, one-time 100 MON per person). Claimed from both: 5 MON via faucet.monad.xyz + 100 MON via MOJO's faucet, total **105 MON** on `0x5321ef319E4ffC58ffD748e3DA119bc22135BA4A`. Both verified on-chain via `https://testnet.monadvision.com` (not the faucet UI's own success toast — faucet.monad.xyz showed a stale "tokens sent" message from an old cooldown before the real claim even went through, so don't trust that toast, check the explorer). Fund generously; Monad's Reserve Balance mechanism can revert an already-included transaction if the balance is cutting it close, and that looks exactly like a contract bug when it isn't. 105 MON is comfortable margin per Eng's own check (U2 = 3 deploys, U3 = a handful of receipt/signature txs, gas ~102 gwei).
- [ ] **MOJO**: confirm logged in at `mojo.devnads.com`, registered for the event, team/captain set. Only the captain can submit later, and no team changes are possible after submission — lock this in early. Login uses the same email as event check-in (the one tied to your check-in code) — use that email, not a personal one, or the submission won't match your registration.

## Whenever you have a spare minute

- [ ] Start the MOJO submission form fields (logo, preview image, description) — doesn't need working code yet. GitHub field: `https://github.com/calderbuild/trust-gate` (public). Demo URL field: `https://trust-gate-flax.vercel.app` (live now — currently shows honest "not deployed yet" states on each agent row since U2 hasn't run against the real network yet; will look right once the private key lands and Eng re-deploys, no action needed from you here).
- [ ] Draft the demo narrative half: what TrustGate is and why it matters (the ERC-8004 study finding unverified/Sybil feedback), the KTD1 honest limitation (fixes a lone liar, not two colluding keys under one operator), timed to fit a 5-minute slot.
- [x] Vercel login/account — Eng deployed straight from CLI (already authenticated), no login needed from you.
- [ ] Vote for other teams on MOJO — counts as your activity requirement (R9), do it anytime before the deadline.

## Later — will need you at these points

- [ ] **After U3 (seeded history)**: review the seeded agents against your history script — confirm the on-chain result (clean agent = GRANT, flagged agent = DENY/MISMATCH) matches what the demo narrative says happened.
- [ ] **Once U5's frontend is visually working**: do a cold-read pass as a first-time user with zero explanation from Eng. Report confusion points in plain language — this is real UX signal a solo builder can't get by testing their own work.
- [ ] **By 17:30**: capture fallback screenshots + a short screen recording of the working flow, regardless of the live app's state at that moment (R10 requires this fallback to exist no matter what).
- [ ] **Before the deadline**: submit the project on MOJO (captain only).
- [ ] **18:00-18:30**: join Eng for at least one full timed rehearsal of the 5-minute demo slot against the live deployed contracts.

## Deadline

Official deadline is **19:00** — confirmed from the org's own kickoff talk (two independent meeting-note sources agree: "项目提交截止时间为今日下午 7 点", submit early to avoid platform congestion at the cutoff). Still treat **18:30** as our internal target so there's real margin before the hard 19:00 cutoff, not because 18:30 is the official time.
