import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { AgentIdentity, ActionLedger } from "../typechain-types";

async function signOutcome(signer: HardhatEthersSigner, receiptId: bigint, verified: boolean) {
  const packed = ethers.solidityPacked(["uint256", "bool"], [receiptId, verified]);
  const messageHash = ethers.keccak256(packed);
  return signer.signMessage(ethers.getBytes(messageHash));
}

async function registerAgent(agentIdentity: AgentIdentity) {
  const agentId = await agentIdentity.registerAgent.staticCall();
  await agentIdentity.registerAgent();
  return agentId;
}

async function createResolvedReceipt(
  actionLedger: ActionLedger,
  agentId: bigint,
  counterparty: HardhatEthersSigner,
  verified: boolean
) {
  const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
  await actionLedger.createReceipt(agentId, counterparty.address);
  const signature = await signOutcome(counterparty, receiptId, verified);
  await actionLedger.linkOutcome(receiptId, verified, signature);
  return receiptId;
}

describe("TrustGate", () => {
  async function deployFixture() {
    const [, counterparty] = await ethers.getSigners();

    const AgentIdentityFactory = await ethers.getContractFactory("AgentIdentity");
    const agentIdentity = await AgentIdentityFactory.deploy();
    await agentIdentity.waitForDeployment();

    const ActionLedgerFactory = await ethers.getContractFactory("ActionLedger");
    const actionLedger = await ActionLedgerFactory.deploy();
    await actionLedger.waitForDeployment();

    const TrustGateFactory = await ethers.getContractFactory("TrustGate");
    const trustGate = await TrustGateFactory.deploy(
      await agentIdentity.getAddress(),
      await actionLedger.getAddress()
    );
    await trustGate.waitForDeployment();

    return { agentIdentity, actionLedger, trustGate, counterparty };
  }

  // Scenario 1
  it("previewAccess grants a freshly-registered agent with one VERIFIED receipt", async () => {
    const { agentIdentity, actionLedger, trustGate, counterparty } = await deployFixture();
    const agentId = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, agentId, counterparty, true);

    const [wouldGrant, reason, verifiedCount, mismatchCount] = await trustGate.previewAccess(agentId);
    expect(wouldGrant).to.equal(true);
    expect(reason).to.equal("GRANTED");
    expect(verifiedCount).to.equal(1n);
    expect(mismatchCount).to.equal(0n);
  });

  // Scenario 2
  it("previewAccess denies an agent with a MISMATCH receipt", async () => {
    const { agentIdentity, actionLedger, trustGate, counterparty } = await deployFixture();
    const agentId = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, agentId, counterparty, false);

    const [wouldGrant, reason] = await trustGate.previewAccess(agentId);
    expect(wouldGrant).to.equal(false);
    expect(reason).to.equal("MISMATCH_ON_RECORD");
  });

  // Scenario 3
  it("previewAccess denies an agent with zero receipts", async () => {
    const { agentIdentity, trustGate } = await deployFixture();
    const agentId = await registerAgent(agentIdentity);

    const [wouldGrant, reason] = await trustGate.previewAccess(agentId);
    expect(wouldGrant).to.equal(false);
    expect(reason).to.equal("INSUFFICIENT_HISTORY");
  });

  // Scenario 4
  it("checkAccess on the clean agent emits AccessGranted and returns true", async () => {
    const { agentIdentity, actionLedger, trustGate, counterparty } = await deployFixture();
    const agentId = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, agentId, counterparty, true);

    expect(await trustGate.checkAccess.staticCall(agentId)).to.equal(true);
    await expect(trustGate.checkAccess(agentId)).to.emit(trustGate, "AccessGranted").withArgs(agentId, 1n);
  });

  // Scenario 5
  it("checkAccess on the flagged agent emits AccessDenied, returns false, and does not revert", async () => {
    const { agentIdentity, actionLedger, trustGate, counterparty } = await deployFixture();
    const agentId = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, agentId, counterparty, false);

    expect(await trustGate.checkAccess.staticCall(agentId)).to.equal(false);
    await expect(trustGate.checkAccess(agentId))
      .to.emit(trustGate, "AccessDenied")
      .withArgs(agentId, "MISMATCH_ON_RECORD");
  });

  // Scenario 6
  it("checkAccess on a revoked agent emits AccessDenied with AGENT_REVOKED", async () => {
    const { agentIdentity, actionLedger, trustGate, counterparty } = await deployFixture();
    const agentId = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, agentId, counterparty, true);
    await agentIdentity.revokeAgent(agentId);

    expect(await trustGate.checkAccess.staticCall(agentId)).to.equal(false);
    await expect(trustGate.checkAccess(agentId))
      .to.emit(trustGate, "AccessDenied")
      .withArgs(agentId, "AGENT_REVOKED");
  });

  // Scenario 7
  it("checkAccess and previewAccess agree on every seeded scenario", async () => {
    const { agentIdentity, actionLedger, trustGate, counterparty } = await deployFixture();

    const cleanAgent = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, cleanAgent, counterparty, true);

    const flaggedAgent = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, flaggedAgent, counterparty, false);

    const emptyAgent = await registerAgent(agentIdentity);

    const revokedAgent = await registerAgent(agentIdentity);
    await createResolvedReceipt(actionLedger, revokedAgent, counterparty, true);
    await agentIdentity.revokeAgent(revokedAgent);

    for (const agentId of [cleanAgent, flaggedAgent, emptyAgent, revokedAgent, 999n]) {
      const [wouldGrant] = await trustGate.previewAccess(agentId);
      const granted = await trustGate.checkAccess.staticCall(agentId);
      expect(granted).to.equal(wouldGrant, `checkAccess/previewAccess disagree for agentId ${agentId}`);
    }
  });

  // Scenario 11: non-existent agentId. AgentIdentity.isActive() returns false
  // (not a revert) for an unregistered id, so TrustGate treats it exactly
  // like a revoked agent under the AGENT_REVOKED branch — no revert on
  // either previewAccess or checkAccess.
  it("a non-existent agentId denies as AGENT_REVOKED without reverting, on both previewAccess and checkAccess", async () => {
    const { trustGate } = await deployFixture();
    const nonExistentAgentId = 999n;

    const [wouldGrant, reason, verifiedCount, mismatchCount] = await trustGate.previewAccess(nonExistentAgentId);
    expect(wouldGrant).to.equal(false);
    expect(reason).to.equal("AGENT_REVOKED");
    expect(verifiedCount).to.equal(0n);
    expect(mismatchCount).to.equal(0n);

    expect(await trustGate.checkAccess.staticCall(nonExistentAgentId)).to.equal(false);
    await expect(trustGate.checkAccess(nonExistentAgentId))
      .to.emit(trustGate, "AccessDenied")
      .withArgs(nonExistentAgentId, "AGENT_REVOKED");
  });
});
