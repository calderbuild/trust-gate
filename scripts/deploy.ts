import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// KTD8: Monad's minimum base fee is 100 MON-gwei and it charges
// gas_limit * price_per_gas (not gas actually used), so wallet
// auto-estimation is the wrong default here — every deploy tx sets its own
// explicit fee cap well above the network minimum for headroom.
const MAX_FEE_PER_GAS = ethers.parseUnits("150", "gwei");
const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("2", "gwei");

async function deployAndWait<T extends { waitForDeployment(): Promise<T>; getAddress(): Promise<string> }>(
  label: string,
  deployPromise: Promise<T>
): Promise<T> {
  console.log(`Deploying ${label}...`);
  const contract = await deployPromise;
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`  ${label} deployed at ${address}`);
  return contract;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} MON`);
  console.log(`Network: ${network.name}`);

  const overrides = {
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  // Deploy order matters (KTD2): AgentIdentity and ActionLedger must exist
  // before TrustGate, which takes both addresses as immutable constructor
  // args, and ActionLedger must exist before it can accumulate history.
  const AgentIdentityFactory = await ethers.getContractFactory("AgentIdentity");
  const agentIdentity = await deployAndWait("AgentIdentity", AgentIdentityFactory.deploy(overrides));
  const agentIdentityAddress = await agentIdentity.getAddress();

  const ActionLedgerFactory = await ethers.getContractFactory("ActionLedger");
  const actionLedger = await deployAndWait(
    "ActionLedger",
    ActionLedgerFactory.deploy(agentIdentityAddress, overrides)
  );
  const actionLedgerAddress = await actionLedger.getAddress();

  const TrustGateFactory = await ethers.getContractFactory("TrustGate");
  const trustGate = await deployAndWait(
    "TrustGate",
    TrustGateFactory.deploy(agentIdentityAddress, actionLedgerAddress, overrides)
  );
  const trustGateAddress = await trustGate.getAddress();

  const deployment = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      AgentIdentity: agentIdentityAddress,
      ActionLedger: actionLedgerAddress,
      TrustGate: trustGateAddress,
    },
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));

  console.log("\nDeployment complete:");
  console.log(JSON.stringify(deployment, null, 2));
  console.log(`\nWritten to ${outFile}`);
  console.log("\nVerify with:");
  console.log(`  npx hardhat verify --network monad ${agentIdentityAddress}`);
  console.log(`  npx hardhat verify --network monad ${actionLedgerAddress} ${agentIdentityAddress}`);
  console.log(
    `  npx hardhat verify --network monad ${trustGateAddress} ${agentIdentityAddress} ${actionLedgerAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
