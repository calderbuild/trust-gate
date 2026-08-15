// Live on Monad testnet — see deployments/monad.json (block 53858083+ range).
export const CONTRACT_ADDRESSES = {
  AgentIdentity: "0xC51AB4dF12A2a2F293fc4e90B1C5e6bB8D147095",
  ActionLedger: "0x2Fc2Cac0Ec46c8a0C6da5aD66a7F0610678A9dD6",
  TrustGate: "0xA5e2c58B32F92825389E5B038aA4E8c69E6B5818",
  AgentNotes: "0x216C15BdfE93a2B57f61A74c8B8a9eb893550928",
} as const;

export const MONAD_TESTNET = {
  chainId: 10143,
  chainIdHex: "0x279f",
  chainName: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  blockExplorerUrl: "https://testnet.monadexplorer.com",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
} as const;
