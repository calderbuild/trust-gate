import { BrowserProvider, type Signer } from "ethers";
import { useEffect, useState } from "react";
import { MONAD_TESTNET } from "./addresses";

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function hasInjectedWalletNow(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

/**
 * Most in-app wallet browsers (imToken, OKX, MetaMask mobile) inject
 * window.ethereum slightly after the page's own scripts run, and fire
 * `ethereum#initialized` once it's ready — a plain synchronous check at
 * render time can miss it. This re-checks on that event and on a short
 * poll as a fallback for wallets that don't fire it.
 */
export function useHasInjectedWallet(): boolean {
  const [present, setPresent] = useState(hasInjectedWalletNow);

  useEffect(() => {
    if (present) return;
    const onInit = () => setPresent(true);
    window.addEventListener("ethereum#initialized", onInit, { once: true });
    const poll = window.setInterval(() => {
      if (hasInjectedWalletNow()) {
        setPresent(true);
        window.clearInterval(poll);
      }
    }, 500);
    const timeout = window.setTimeout(() => window.clearInterval(poll), 5000);
    return () => {
      window.removeEventListener("ethereum#initialized", onInit);
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    };
  }, [present]);

  return present;
}

export interface ConnectedWallet {
  signer: Signer;
  address: string;
}

/**
 * Connects to whatever injected wallet is present (Rabby, MetaMask, or a
 * mobile wallet app's in-app browser — same EIP-1193 interface), then
 * ensures it's on Monad testnet, adding the chain (EIP-3085) if the wallet
 * doesn't already know it, or switching (EIP-3326) if it does. Standard
 * flow, not Monad-specific.
 */
export async function connectWallet(): Promise<ConnectedWallet> {
  if (!hasInjectedWalletNow()) {
    throw new Error("No injected wallet found.");
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
