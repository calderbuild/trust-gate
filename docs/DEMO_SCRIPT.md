# TrustGate — 5-min live demo script

Timings assume live signing lag (Rabby popup, ~15-20s per approval) happens
on camera — don't cut it, it's proof this isn't faked. Total: 5:00.

Recording setup: screen record the browser tab at 1512x812+ with system
audio off and mic on. Narrate live in your own voice — Rabby's popup is a
separate OS window that can't be scripted, so this has to be a real take,
not a stitched one.

---

## [0:00–0:25] Hook

**Say:** "A 2026 study of the ERC-8004 agent reputation standard found that
59 to 90 percent of on-chain agent feedback shows Sybil patterns — because
the feedback is self-reported. An agent can just write its own good
reviews. TrustGate fixes that: an interaction only counts once the
_other_ party signs it with their own key. The agent can never write its
own history."

**Screen:** TrustGate homepage, three agent rows visible.

## [0:25–1:10] How it works

**Say:** "Three contracts. AgentIdentity just tracks who's registered.
ActionLedger records receipts — but a receipt only becomes VERIFIED or
MISMATCH when the counterparty's own signature checks out. TrustGate reads
both and applies one rule: any disputed receipt on record denies access,
no history denies access, otherwise it grants. And critically —
`previewAccess`, the free check, and `checkAccess`, the real transaction,
run the exact same logic. They can never disagree."

**Screen:** scroll to README architecture diagram, or just stay on the
live page — don't over-explain, keep moving.

## [1:10–1:25] Transition

**Say:** "Let's see it live — deployed on Monad testnet right now, not a
mockup."

**Screen:** click Agent #1 row.

## [1:25–2:15] Agent #1 — real GRANT transaction

**Say (while clicking):** "Agent #1 has one verified receipt, no disputes.
I'll connect my wallet and run the real on-chain check." _(click Connect,
click 链上验证/Gate on-chain)_ "This pops up Rabby for a real signature —
this part's genuinely live, so bear with the wait."

**[wallet lag — let it sit on screen, ~15-20s]**

**Say (once signed):** "And there it is — GRANTED, one verified receipt,
with a real transaction hash."

**Screen:** result stamp shows GRANT, click "View transaction on Monad
Explorer".

## [2:15–2:35] Prove it on-chain

**Say:** "This is the actual transaction on Monad's explorer — function
selector `0x6e583cac`, that's `checkAccess`, input data ends in `...0001`
for agent 1, status Success, real gas paid. Anyone can pull this up
independently — nothing here is a screenshot I made up."

**Screen:** MonadVision transaction detail page, point at Method + Input
Data + Status fields.

## [2:35–3:15] Agent #2 — real DENY transaction

**Say:** "Now Agent #2 — two verified receipts, but one counterparty
disputed a trade. One mismatch is enough to veto, no matter how many good
receipts exist." _(select Agent #2, click Gate on-chain again)_ "Signing
again — same real cost, same real wait."

**[wallet lag again, ~15-20s]**

**Say (once signed):** "DENIED. Same contract, same wallet, different
history — and that's a second real transaction, input ending `...0002`."

**Screen:** result stamp shows DENY.

## [3:30–4:00] Agent #3 — no wallet needed

**Say:** "Now here's the part that matters for anyone scanning this on
their phone without a crypto wallet installed — Agent #3, brand new,
zero history. I hit 'free preview' — no wallet, no gas, no transaction."

**[click 免费预检 for Agent #3 — should be instant]**

**Say:** "Denied, insufficient history — and this is the _exact same_
verdict `checkAccess` would produce, because they share the identical
contract call underneath. You get the real answer without ever touching a
wallet."

## [4:00–4:20] Mobile / QR

**Say:** "That's why the demo page has a QR code baked in — scan it,
you're straight into the same UI on your phone, free-preview button works
with zero setup."

**Screen:** scroll down to QR ticket, or point at it if visible.

## [4:20–4:45] Honest limitation

**Say:** "One thing I want to be upfront about: this defeats a lone liar —
an agent can never sign its own good review. It does _not_ defeat
collusion — if one operator controls both wallets, they can fake a
mutually-signed history together. That needs a different mechanism,
staked deposits with a slashing challenge, and building that correctly
in one day would've cost us getting the core mechanism working at all.
It's a disclosed boundary, not a blind spot."

## [4:45–5:00] Close

**Say:** "TrustGate — reputation an agent can't write for itself, live on
Monad testnet right now. Thanks."

---

## Fallback if a signature times out or fails during the take

Don't restart the whole recording. Say: "Let me retry that" and click
Gate on-chain again — a second attempt on camera reads as authentic, not
as a mistake. Only re-record from scratch if the contract call itself
reverts (wrong network, wallet on wrong chain) since that's the one
failure that actually looks broken.
