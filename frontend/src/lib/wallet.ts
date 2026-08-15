import { BrowserProvider, type Signer } from "ethers";
import { MONAD_TESTNET } from "./addresses";

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export interface ConnectedWallet {
  signer: Signer;
  address: string;
}

/**
 * Connects to whatever injected wallet is present (Rabby, MetaMask — same
 * EIP-1193 interface), then ensures it's on Monad testnet, adding the chain
 * (EIP-3085) if the wallet doesn't already know it, or switching (EIP-3326)
 * if it does. Standard flow, not Monad-specific.
 */
export async function connectWallet(): Promise<ConnectedWallet> {
  if (!hasInjectedWallet()) {
    throw new Error("No wallet found. Install Rabby or another browser wallet extension.");
  }

  const provider = new BrowserProvider(window.ethereum!);
  await provider.send("eth_requestAccounts", []);
  await ensureMonadTestnet();

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { signer, address };
}

async function ensureMonadTestnet(): Promise<void> {
  const ethereum = window.ethereum!;
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET.chainIdHex }],
    });
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 4902) throw error;
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: MONAD_TESTNET.chainIdHex,
          chainName: MONAD_TESTNET.chainName,
          rpcUrls: [MONAD_TESTNET.rpcUrl],
          nativeCurrency: MONAD_TESTNET.nativeCurrency,
          blockExplorerUrls: [MONAD_TESTNET.blockExplorerUrl],
        },
      ],
    });
  }
}
