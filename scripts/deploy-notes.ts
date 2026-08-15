import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const MAX_FEE_PER_GAS = ethers.parseUnits("150", "gwei");
const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("2", "gwei");
const overrides = { maxFeePerGas: MAX_FEE_PER_GAS, maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS };

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${network.name}`);

  const AgentNotesFactory = await ethers.getContractFactory("AgentNotes");
  const agentNotes = await AgentNotesFactory.deploy(overrides);
  await agentNotes.waitForDeployment();
  const address = await agentNotes.getAddress();
  console.log(`AgentNotes deployed at ${address}`);

  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  deployment.contracts.AgentNotes = address;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log(`Updated ${deploymentPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
