import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import type { AgentIdentity, ActionLedger, TrustGate } from "../typechain-types";

// KTD8: same explicit fee cap as deploy.ts, well above Monad's live ~102
// MON-gwei minimum base fee.
const MAX_FEE_PER_GAS = ethers.parseUnits("150", "gwei");
const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("2", "gwei");
const overrides = { maxFeePerGas: MAX_FEE_PER_GAS, maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS };

interface ReceiptScenario {
  verified: boolean;
  // TODO(Lead): swap in the real 2-3 sentence beat from the history script
  // (MANUAL-TASKS.md's "History script for U3" item) once it lands — this
  // placeholder only exists so the script is fully runnable today.
  narrative: string;
}

interface AgentScenario {
  label: string;
  receipts: ReceiptScenario[];
  expectedVerdict: { wouldGrant: boolean; reason: string };
}

// Three agents cover KTD5's three demo-relevant verdicts: a clean grant, a
// mismatch-dominates denial (shown after two good interactions, to make the
// "any single mismatch overrides" policy visible), and an unrated denial.
const SCENARIOS: AgentScenario[] = [
  {
    label: "clean-agent",
    receipts: [{ verified: true, narrative: "TODO(Lead): what task, what counterparty, why it checks out." }],
    expectedVerdict: { wouldGrant: true, reason: "GRANTED" },
  },
  {
    label: "flagged-agent",
    receipts: [
      { verified: true, narrative: "TODO(Lead): first interaction — looked trustworthy." },
      { verified: true, narrative: "TODO(Lead): second interaction — still looked trustworthy." },
      { verified: false, narrative: "TODO(Lead): third interaction — counterparty disputes the outcome." },
    ],
    expectedVerdict: { wouldGrant: false, reason: "MISMATCH_ON_RECORD" },
  },
  {
    label: "unrated-agent",
    receipts: [],
    expectedVerdict: { wouldGrant: false, reason: "INSUFFICIENT_HISTORY" },
  },
];

async function signOutcome(
  signer: ReturnType<typeof ethers.Wallet.createRandom>,
  actionLedgerAddress: string,
  chainId: bigint,
  receiptId: bigint,
  verified: boolean
) {
  const packed = ethers.solidityPacked(
    ["uint256", "address", "uint256", "bool"],
    [chainId, actionLedgerAddress, receiptId, verified]
  );
  const messageHash = ethers.keccak256(packed);
  return signer.signMessage(ethers.getBytes(messageHash));
}

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found at ${deploymentPath} — run scripts/deploy.ts first.`);
  }
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const { AgentIdentity: agentIdentityAddress, ActionLedger: actionLedgerAddress, TrustGate: trustGateAddress } =
    deployment.contracts;

  const [owner] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();

  const agentIdentity = (await ethers.getContractAt("AgentIdentity", agentIdentityAddress)) as unknown as AgentIdentity;
  const actionLedger = (await ethers.getContractAt("ActionLedger", actionLedgerAddress)) as unknown as ActionLedger;
  const trustGate = (await ethers.getContractAt("TrustGate", trustGateAddress)) as unknown as TrustGate;

  console.log(`Seeding on ${network.name} as ${owner.address}`);
  console.log(`AgentIdentity: ${agentIdentityAddress}`);
  console.log(`ActionLedger:  ${actionLedgerAddress}`);
  console.log(`TrustGate:     ${trustGateAddress}\n`);

  const results = [];

  for (const scenario of SCENARIOS) {
    console.log(`--- ${scenario.label} ---`);

    const agentId = await agentIdentity.registerAgent.staticCall();
    await (await agentIdentity.registerAgent(overrides)).wait();
    console.log(`  registered agentId=${agentId}`);

    for (const receipt of scenario.receipts) {
      // Fresh throwaway counterparty key per receipt (PLAN.md U3 step 2):
      // it only ever produces an off-chain signature, so it never needs MON.
      const counterparty = ethers.Wallet.createRandom();

      const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
      await (await actionLedger.createReceipt(agentId, counterparty.address, overrides)).wait();

      const signature = await signOutcome(counterparty, actionLedgerAddress, chainId, receiptId, receipt.verified);
      await (await actionLedger.linkOutcome(receiptId, receipt.verified, signature, overrides)).wait();

      console.log(
        `  receiptId=${receiptId} counterparty=${counterparty.address} verified=${receipt.verified} — ${receipt.narrative}`
      );
    }

    const [wouldGrant, reason, verifiedCount, mismatchCount] = await trustGate.previewAccess(agentId);
    const matches = wouldGrant === scenario.expectedVerdict.wouldGrant && reason === scenario.expectedVerdict.reason;
    console.log(
      `  previewAccess -> wouldGrant=${wouldGrant} reason=${reason} verified=${verifiedCount} mismatch=${mismatchCount} ${
        matches ? "(matches expected)" : "(!!! DOES NOT MATCH EXPECTED — investigate before wiring the frontend)"
      }\n`
    );

    if (!matches) {
      throw new Error(
        `${scenario.label}: expected ${JSON.stringify(scenario.expectedVerdict)}, got {wouldGrant: ${wouldGrant}, reason: "${reason}"}`
      );
    }

    results.push({
      label: scenario.label,
      agentId: agentId.toString(),
      owner: owner.address,
      receiptCount: scenario.receipts.length,
      verdict: { wouldGrant, reason, verifiedCount: verifiedCount.toString(), mismatchCount: mismatchCount.toString() },
    });
  }

  const outDir = path.join(__dirname, "..", "deployments");
  const outFile = path.join(outDir, `seed-history.${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ network: network.name, agents: results }, null, 2));
  console.log(`Written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
