import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

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
};

export default config;
