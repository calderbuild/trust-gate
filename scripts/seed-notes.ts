import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import type { AgentNotes } from "../typechain-types";

const MAX_FEE_PER_GAS = ethers.parseUnits("150", "gwei");
const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("2", "gwei");
const overrides = { maxFeePerGas: MAX_FEE_PER_GAS, maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS };

// Matches scripts/seed-history.ts's real seeded receipts exactly: agentId 1
// has one VERIFIED receipt, agentId 2 has two VERIFIED and one MISMATCH.
const NOTES: Record<number, { zh: string; en: string }> = {
  1: {
    zh: "为 DevOps 流水线做自动化代码审查。完成过一次任务，已被委托方签名确认。",
    en: "Runs automated code-review passes for a DevOps pipeline. One completed job, signed off by the requesting team.",
  },
  2: {
    zh: "执行跨 DEX 套利交易。已结算两笔交易均被对手方签名确认无误，第三笔被对手方签名标记为有争议。",
    en: "Executes cross-DEX arbitrage trades. Two settled trades signed off clean by the counterparty; a third was signed off as disputed.",
  },
  3: {
    zh: "刚刚注册，还没有已完成的交互记录。",
    en: "Newly registered. No completed interactions yet.",
  },
};

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const agentNotesAddress = deployment.contracts.AgentNotes;
  if (!agentNotesAddress) throw new Error("Run scripts/deploy-notes.ts first.");

  const agentNotes = (await ethers.getContractAt("AgentNotes", agentNotesAddress)) as unknown as AgentNotes;

  for (const [agentIdStr, note] of Object.entries(NOTES)) {
    const agentId = BigInt(agentIdStr);
    // zh + en joined with a separator the frontend splits on — keeps this
    // to one on-chain string/call per agent instead of two.
    const combined = `${note.zh}|||${note.en}`;
    const tx = await agentNotes.setNote(agentId, combined, overrides);
    const receipt = await tx.wait();
    console.log(`agentId=${agentId} note set, tx=${receipt?.hash}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
