import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // Monad testnet supports the Cancun opcodes (MCOPY/TLOAD/TSTORE);
      // OpenZeppelin Contracts 5.6.1's Bytes.sol uses MCOPY unconditionally,
      // so this must be set explicitly rather than left to solc's default.
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      // Deliberately omitted when unset rather than passed as [""], which
      // hardhat-ethers would otherwise try to load as a signer and fail on.
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  // KTD8: Monad charges gas_limit * price, not gas_used, so every deploy
  // and verify transaction sets its own explicit gas price/limit in
  // scripts/deploy.ts rather than trusting wallet auto-estimation. Sourcify
  // is Monad's verification service, not Etherscan.
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org/",
    browserUrl: "https://testnet.monadexplorer.com/",
  },
  etherscan: {
    enabled: false,
  },
};

export default config;
