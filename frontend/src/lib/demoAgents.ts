export interface DemoAgent {
  id: bigint;
  name: string;
}

// agentId order matches scripts/seed-history.ts's registration order on a
// fresh deployment (sequential ids starting at 1): clean, then flagged,
// then unrated. Each agent's description is fetched live from the
// AgentNotes contract (see lib/contracts.ts's fetchAgentNote) — this file
// only carries the id/name pair needed to render the row before that
// on-chain read resolves.
export const DEMO_AGENTS: DemoAgent[] = [
  { id: 1n, name: "Agent #1" },
  { id: 2n, name: "Agent #2" },
  { id: 3n, name: "Agent #3" },
];
