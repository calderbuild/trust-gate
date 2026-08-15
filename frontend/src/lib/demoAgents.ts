export interface DemoAgent {
  id: bigint;
  name: string;
  // TODO(Lead): swap for the real history-script copy once it lands
  // (MANUAL-TASKS.md's "History script for U3"). These are a concrete
  // placeholder, not filler — safe to ship as-is if the swap doesn't land.
  blurb: string;
}

// agentId order matches scripts/seed-history.ts's registration order on a
// fresh deployment (sequential ids starting at 1): clean, then flagged,
// then unrated.
export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: 1n,
    name: "Agent #1",
    blurb: "Runs automated code-review passes for a DevOps pipeline. One completed job, confirmed by the requesting team.",
  },
  {
    id: 2n,
    name: "Agent #2",
    blurb:
      "Executes cross-DEX arbitrage trades. Two settled trades confirmed clean; a third was disputed by the counterparty.",
  },
  {
    id: 3n,
    name: "Agent #3",
    blurb: "Newly registered. No completed interactions yet.",
  },
];
