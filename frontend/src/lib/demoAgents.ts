export interface DemoAgent {
  id: bigint;
  name: string;
  // TODO(Lead): swap for the real history-script copy once it lands
  // (MANUAL-TASKS.md's "History script for U3"). These are a concrete
  // placeholder, not filler — safe to ship as-is if the swap doesn't land.
  blurb: { en: string; zh: string };
}

// agentId order matches scripts/seed-history.ts's registration order on a
// fresh deployment (sequential ids starting at 1): clean, then flagged,
// then unrated.
export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: 1n,
    name: "Agent #1",
    blurb: {
      en: "Runs automated code-review passes for a DevOps pipeline. One completed job, confirmed by the requesting team.",
      zh: "为 DevOps 流水线做自动化代码审查。完成过一次任务，已被委托方确认。",
    },
  },
  {
    id: 2n,
    name: "Agent #2",
    blurb: {
      en: "Executes cross-DEX arbitrage trades. Two settled trades confirmed clean; a third was disputed by the counterparty.",
      zh: "执行跨 DEX 套利交易。已结算两笔交易均被确认无误，第三笔被对手方提出争议。",
    },
  },
  {
    id: 3n,
    name: "Agent #3",
    blurb: {
      en: "Newly registered. No completed interactions yet.",
      zh: "刚刚注册，还没有已完成的交互记录。",
    },
  },
];
