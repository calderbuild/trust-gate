// TODO(Eng): replace with the real addresses from deployments/monad.json once
// scripts/deploy.ts has run against the actual Monad testnet (U2). Placeholder
// zero addresses let the rest of the frontend build and render before that.
export const CONTRACT_ADDRESSES = {
  AgentIdentity: "0x0000000000000000000000000000000000000000",
  ActionLedger: "0x0000000000000000000000000000000000000000",
  TrustGate: "0x0000000000000000000000000000000000000000",
} as const;

export const MONAD_TESTNET = {
  chainId: 10143,
  chainIdHex: "0x279f",
  chainName: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  blockExplorerUrl: "https://testnet.monadexplorer.com",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
} as const;
