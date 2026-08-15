import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Status enum values as declared in ActionLedger.sol.
const CREATED = 0n;
const VERIFIED = 1n;
const MISMATCH = 2n;

/**
 * Reproduces ActionLedger.linkOutcome's expected digest off-chain:
 * MessageHashUtils.toEthSignedMessageHash(keccak256(abi.encodePacked(
 *   block.chainid, address(this), receiptId, verified))).
 * ethers' signMessage() applies the same "\x19Ethereum Signed Message:\n32"
 * prefix when given a raw 32-byte hash, so this matches ECDSA.recoverCalldata
 * on-chain exactly. Binding to chainId + the ledger's own address stops a
 * signature from one deployment resolving a same-numbered receipt elsewhere.
 */
async function signOutcome(
  signer: HardhatEthersSigner,
  chainId: bigint,
  actionLedgerAddress: string,
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

describe("ActionLedger", () => {
  async function deployFixture() {
    const [agentOwner, counterparty, stranger] = await ethers.getSigners();

    const AgentIdentityFactory = await ethers.getContractFactory("AgentIdentity");
    const agentIdentity = await AgentIdentityFactory.deploy();
    await agentIdentity.waitForDeployment();

    const ActionLedgerFactory = await ethers.getContractFactory("ActionLedger");
    const actionLedger = await ActionLedgerFactory.deploy(await agentIdentity.getAddress());
    await actionLedger.waitForDeployment();

    const agentId = await agentIdentity.registerAgent.staticCall();
    await agentIdentity.registerAgent();

    const { chainId } = await ethers.provider.getNetwork();
    const actionLedgerAddress = await actionLedger.getAddress();
    const sign = (signer: HardhatEthersSigner, receiptId: bigint, verified: boolean) =>
      signOutcome(signer, chainId, actionLedgerAddress, receiptId, verified);

    return { agentIdentity, actionLedger, agentOwner, counterparty, stranger, agentId, sign };
  }

  it("creates a receipt in CREATED status linked to the agent, when called by the agent's owner", async () => {
    const { actionLedger, counterparty, agentId } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);

    await expect(actionLedger.createReceipt(agentId, counterparty.address))
      .to.emit(actionLedger, "ReceiptCreated")
      .withArgs(receiptId, agentId, counterparty.address);

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.agentId).to.equal(agentId);
    expect(receipt.counterparty).to.equal(counterparty.address);
    expect(receipt.status).to.equal(CREATED);
    expect(await actionLedger.getAgentReceipts(agentId)).to.deep.equal([receiptId]);
  });

  // Review finding: createReceipt had no access control, so a third party
  // could plant a receipt on someone else's agentId and self-sign it MISMATCH
  // to permanently blacklist that agent.
  it("reverts createReceipt when the caller does not own the agent", async () => {
    const { actionLedger, stranger, counterparty, agentId } = await deployFixture();
    await expect(
      actionLedger.connect(stranger).createReceipt(agentId, counterparty.address)
    ).to.be.revertedWithCustomError(actionLedger, "NotAgentOwner");
  });

  // Review finding: without this check, an agent owner could name itself as
  // counterparty and self-sign VERIFIED, defeating KTD1 entirely.
  it("reverts createReceipt when the counterparty is the caller itself", async () => {
    const { actionLedger, agentOwner, agentId } = await deployFixture();
    await expect(
      actionLedger.createReceipt(agentId, agentOwner.address)
    ).to.be.revertedWithCustomError(actionLedger, "InvalidCounterparty");
  });

  // Scenario 8 (PLAN.md U1): linkOutcome with a valid signature from the
  // registered counterparty succeeds.
  it("resolves to VERIFIED with a valid signature from the registered counterparty (KTD1)", async () => {
    const { actionLedger, counterparty, agentId, sign } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
    await actionLedger.createReceipt(agentId, counterparty.address);

    const signature = await sign(counterparty, receiptId, true);
    await expect(actionLedger.linkOutcome(receiptId, true, signature))
      .to.emit(actionLedger, "OutcomeLinked")
      .withArgs(receiptId, VERIFIED);

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(VERIFIED);
  });

  it("resolves to MISMATCH with a valid signature asserting non-verification", async () => {
    const { actionLedger, counterparty, agentId, sign } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
    await actionLedger.createReceipt(agentId, counterparty.address);

    const signature = await sign(counterparty, receiptId, false);
    await expect(actionLedger.linkOutcome(receiptId, false, signature))
      .to.emit(actionLedger, "OutcomeLinked")
      .withArgs(receiptId, MISMATCH);

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(MISMATCH);
  });

  // Scenario 9 (PLAN.md U1): linkOutcome with a signature from the wrong
  // address (e.g. the agent's own key) reverts — the agent cannot self-attest.
  it("reverts when the signature recovers to any address other than the registered counterparty", async () => {
    const { actionLedger, agentOwner, counterparty, agentId, sign } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
    await actionLedger.createReceipt(agentId, counterparty.address);

    // The agent (creator) tries to self-attest instead of the real counterparty.
    const selfSignature = await sign(agentOwner, receiptId, true);
    await expect(actionLedger.linkOutcome(receiptId, true, selfSignature)).to.be.revertedWithCustomError(
      actionLedger,
      "InvalidCounterpartySignature"
    );

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(CREATED);
  });

  // Review finding: the signed digest must bind to this chain and this
  // contract, or a signature harvested from a second ActionLedger deployment
  // (a redeploy, a local run, another chain) could resolve a same-numbered
  // receipt here.
  it("reverts when the signature was produced for a different ActionLedger deployment", async () => {
    const { actionLedger, agentIdentity, counterparty, agentId } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
    await actionLedger.createReceipt(agentId, counterparty.address);

    const ActionLedgerFactory = await ethers.getContractFactory("ActionLedger");
    const otherLedger = await ActionLedgerFactory.deploy(await agentIdentity.getAddress());
    await otherLedger.waitForDeployment();
    const { chainId } = await ethers.provider.getNetwork();

    const signatureForOtherLedger = await signOutcome(
      counterparty,
      chainId,
      await otherLedger.getAddress(),
      receiptId,
      true
    );

    await expect(
      actionLedger.linkOutcome(receiptId, true, signatureForOtherLedger)
    ).to.be.revertedWithCustomError(actionLedger, "InvalidCounterpartySignature");
  });

  // Scenario 10 (PLAN.md U1): linkOutcome called twice on the same receipt
  // with conflicting verified values reverts on the second call. Implemented
  // as "a resolved receipt is locked" — any second call reverts regardless of
  // whether the value agrees or conflicts, which is the stricter, simpler
  // invariant and trivially covers the conflicting case the plan names.
  it("reverts on a second linkOutcome call for an already-resolved receipt", async () => {
    const { actionLedger, counterparty, agentId, sign } = await deployFixture();
    const receiptId = await actionLedger.createReceipt.staticCall(agentId, counterparty.address);
    await actionLedger.createReceipt(agentId, counterparty.address);

    const firstSignature = await sign(counterparty, receiptId, true);
    await actionLedger.linkOutcome(receiptId, true, firstSignature);

    const conflictingSignature = await sign(counterparty, receiptId, false);
    await expect(actionLedger.linkOutcome(receiptId, false, conflictingSignature)).to.be.revertedWithCustomError(
      actionLedger,
      "ReceiptAlreadyResolved"
    );

    const receipt = await actionLedger.getReceipt(receiptId);
    expect(receipt.status).to.equal(VERIFIED);
  });

  it("reverts linkOutcome for a receipt id that was never created", async () => {
    const { actionLedger, counterparty, sign } = await deployFixture();
    const signature = await sign(counterparty, 999n, true);

    await expect(actionLedger.linkOutcome(999n, true, signature)).to.be.revertedWithCustomError(
      actionLedger,
      "ReceiptNotFound"
    );
  });

  // Review finding: the receiptId==0 disjunct of the ReceiptNotFound guard
  // was only ever exercised indirectly via a large out-of-range id; assert it
  // independently so a future refactor that drops or inverts that half of
  // the check would be caught.
  it("reverts linkOutcome for receiptId 0", async () => {
    const { actionLedger, counterparty, sign } = await deployFixture();
    const signature = await sign(counterparty, 0n, true);

    await expect(actionLedger.linkOutcome(0n, true, signature)).to.be.revertedWithCustomError(
      actionLedger,
      "ReceiptNotFound"
    );
  });

  it("getAgentReceipts returns an empty array for an agent with no receipts", async () => {
    const { actionLedger, agentId } = await deployFixture();
    expect(await actionLedger.getAgentReceipts(agentId)).to.deep.equal([]);
  });
});
