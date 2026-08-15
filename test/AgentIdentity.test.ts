import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentIdentity", () => {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const AgentIdentityFactory = await ethers.getContractFactory("AgentIdentity");
    const agentIdentity = await AgentIdentityFactory.deploy();
    await agentIdentity.waitForDeployment();
    return { agentIdentity, owner, other };
  }

  it("registers an agent as active, owned by the caller", async () => {
    const { agentIdentity, owner } = await deployFixture();
    const agentId = await agentIdentity.registerAgent.staticCall();

    await expect(agentIdentity.registerAgent())
      .to.emit(agentIdentity, "AgentRegistered")
      .withArgs(agentId, owner.address);

    expect(await agentIdentity.isActive(agentId)).to.equal(true);
    const stored = await agentIdentity.agents(agentId);
    expect(stored.owner).to.equal(owner.address);
    expect(stored.active).to.equal(true);
  });

  it("assigns sequential agent ids across multiple registrations", async () => {
    const { agentIdentity } = await deployFixture();

    const firstId = await agentIdentity.registerAgent.staticCall();
    await agentIdentity.registerAgent();
    const secondId = await agentIdentity.registerAgent.staticCall();
    await agentIdentity.registerAgent();

    expect(firstId).to.equal(1n);
    expect(secondId).to.equal(2n);
  });

  it("isActive returns false for an id that was never registered", async () => {
    const { agentIdentity } = await deployFixture();
    expect(await agentIdentity.isActive(999n)).to.equal(false);
  });

  it("lets the owner revoke their own agent", async () => {
    const { agentIdentity } = await deployFixture();
    await agentIdentity.registerAgent();

    await expect(agentIdentity.revokeAgent(1n)).to.emit(agentIdentity, "AgentRevoked").withArgs(1n);
    expect(await agentIdentity.isActive(1n)).to.equal(false);
  });

  it("reverts when a non-owner tries to revoke an agent", async () => {
    const { agentIdentity, other } = await deployFixture();
    await agentIdentity.registerAgent();

    await expect(agentIdentity.connect(other).revokeAgent(1n)).to.be.revertedWithCustomError(
      agentIdentity,
      "NotAgentOwner"
    );
    expect(await agentIdentity.isActive(1n)).to.equal(true);
  });

  it("reverts revoking an id that was never registered (no owner can match)", async () => {
    const { agentIdentity } = await deployFixture();
    await expect(agentIdentity.revokeAgent(999n)).to.be.revertedWithCustomError(agentIdentity, "NotAgentOwner");
  });
});
