import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Status enum values as declared in ActionLedger.sol.
const CREATED = 0n;
const VERIFIED = 1n;
const MISMATCH = 2n;

/**
 * Reproduces ActionLedger.linkOutcome's expected digest off-chain:
 * MessageHashUtils.toEthSignedMessageHash(keccak256(abi.encodePacked(receiptId, verified))).
 * ethers' signMessage() applies the same "\x19Ethereum Signed Message:\n32"
 * prefix when given a raw 32-byte hash, so this matches ECDSA.recoverCalldata
 * on-chain exactly.
 */
async function signOutcome(signer: HardhatEthersSigner, receiptId: bigint, verified: boolean) {
  const packed = ethers.solidityPacked(["uint256", "bool"], [receiptId, verified]);
  const messageHash = ethers.keccak256(packed);
  return signer.signMessage(ethers.getBytes(messageHash));
}

describe("ActionLedger", () => {
  async function deployFixture() {
    const [agentOwner, counterparty] = await ethers.getSigners();
    const ActionLedgerFactory = await ethers.getContractFactory("ActionLedger");
    const actionLedger = await ActionLedgerFactory.deploy();
    await actionLedger.waitForDeployment();
    return { actionLedger, agentOwner, counterparty };
  }

  it("creates a receipt in CREATED status linked to the agent", async () => {
    const { actionLedger, counterparty } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(1n, counterparty.address);

    await expect(actionLedger.createReceipt(1n, counterparty.address))
      .to.emit(actionLedger, "ReceiptCreated")
      .withArgs(receiptId, 1n, counterparty.address);

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.agentId).to.equal(1n);
    expect(receipt.counterparty).to.equal(counterparty.address);
    expect(receipt.status).to.equal(CREATED);
    expect(await actionLedger.getAgentReceipts(1n)).to.deep.equal([receiptId]);
  });

  // Scenario 8 (PLAN.md U1): linkOutcome with a valid signature from the
  // registered counterparty succeeds.
  it("resolves to VERIFIED with a valid signature from the registered counterparty (KTD1)", async () => {
    const { actionLedger, counterparty } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(1n, counterparty.address);
    await actionLedger.createReceipt(1n, counterparty.address);

    const signature = await signOutcome(counterparty, receiptId, true);
    await expect(actionLedger.linkOutcome(receiptId, true, signature))
      .to.emit(actionLedger, "OutcomeLinked")
      .withArgs(receiptId, VERIFIED);

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(VERIFIED);
  });

  it("resolves to MISMATCH with a valid signature asserting non-verification", async () => {
    const { actionLedger, counterparty } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(1n, counterparty.address);
    await actionLedger.createReceipt(1n, counterparty.address);

    const signature = await signOutcome(counterparty, receiptId, false);
    await expect(actionLedger.linkOutcome(receiptId, false, signature))
      .to.emit(actionLedger, "OutcomeLinked")
      .withArgs(receiptId, MISMATCH);

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(MISMATCH);
  });

  // Scenario 9 (PLAN.md U1): linkOutcome with a signature from the wrong
  // address (e.g. the agent's own key) reverts — the agent cannot self-attest.
  it("reverts when the signature recovers to any address other than the registered counterparty", async () => {
    const { actionLedger, agentOwner, counterparty } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(1n, counterparty.address);
    await actionLedger.createReceipt(1n, counterparty.address);

    // The agent (creator) tries to self-attest instead of the real counterparty.
    const selfSignature = await signOutcome(agentOwner, receiptId, true);
    await expect(actionLedger.linkOutcome(receiptId, true, selfSignature)).to.be.revertedWithCustomError(
      actionLedger,
      "InvalidCounterpartySignature"
    );

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(CREATED);
  });

  // Scenario 10 (PLAN.md U1): linkOutcome called twice on the same receipt
  // with conflicting verified values reverts on the second call. Implemented
  // as "a resolved receipt is locked" — any second call reverts regardless of
  // whether the value agrees or conflicts, which is the stricter, simpler
  // invariant and trivially covers the conflicting case the plan names.
  it("reverts on a second linkOutcome call for an already-resolved receipt", async () => {
    const { actionLedger, counterparty } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(1n, counterparty.address);
    await actionLedger.createReceipt(1n, counterparty.address);

    const firstSignature = await signOutcome(counterparty, receiptId, true);
    await actionLedger.linkOutcome(receiptId, true, firstSignature);

    const conflictingSignature = await signOutcome(counterparty, receiptId, false);
    await expect(actionLedger.linkOutcome(receiptId, false, conflictingSignature)).to.be.revertedWithCustomError(
      actionLedger,
      "ReceiptAlreadyResolved"
    );

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(VERIFIED);
  });

  it("reverts linkOutcome for a receipt id that was never created", async () => {
    const { actionLedger, counterparty } = await deployFixture();
    const signature = await signOutcome(counterparty, 999n, true);

    await expect(actionLedger.linkOutcome(999n, true, signature)).to.be.revertedWithCustomError(
      actionLedger,
      "ReceiptNotFound"
    );
  });

  it("getAgentReceipts returns an empty array for an agent with no receipts", async () => {
    const { actionLedger } = await deployFixture();
    expect(await actionLedger.getAgentReceipts(1n)).to.deep.equal([]);
  });
});
