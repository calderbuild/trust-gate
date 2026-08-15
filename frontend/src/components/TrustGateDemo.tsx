import { useEffect, useState } from "react";
import { DEMO_AGENTS } from "../lib/demoAgents";
import { previewAccess, checkAccess, type PreviewAccessResult, type CheckAccessResult } from "../lib/contracts";
import { connectWallet, hasInjectedWallet, type ConnectedWallet } from "../lib/wallet";
import AgentRow from "./AgentRow";
import ResultStamp from "./ResultStamp";

type PreviewState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: PreviewAccessResult };

async function loadPreview(agentId: bigint): Promise<PreviewState> {
  try {
    const data = await previewAccess(agentId);
    return { status: "ready", data };
  } catch {
    return { status: "error", message: "not deployed yet" };
  }
}

export default function TrustGateDemo() {
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const [selectedId, setSelectedId] = useState<bigint>(DEMO_AGENTS[0].id);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [gating, setGating] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckAccessResult | null>(null);

  useEffect(() => {
    DEMO_AGENTS.forEach((agent) => {
      setPreviews((prev) => ({ ...prev, [agent.id.toString()]: { status: "loading" } }));
      loadPreview(agent.id).then((state) => {
        setPreviews((prev) => ({ ...prev, [agent.id.toString()]: state }));
      });
    });
  }, []);

  function selectAgent(agentId: bigint) {
    setSelectedId(agentId);
    setResult(null);
    setGateError(null);
  }

  async function handleCheckAccess() {
    const state = await loadPreview(selectedId);
    setPreviews((prev) => ({ ...prev, [selectedId.toString()]: state }));
  }

  async function handleConnect() {
    setConnecting(true);
    setWalletError(null);
    try {
      setWallet(await connectWallet());
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : "Could not connect wallet.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleGateOnChain() {
    if (!wallet) return;
    setGating(true);
    setGateError(null);
    try {
      setResult(await checkAccess(wallet.signer, selectedId));
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setGating(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:py-16">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-seal">On-chain trust ledger · Monad testnet</p>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">TrustGate</h1>
        <p className="mt-3 max-w-md font-sans text-base text-muted">
          Access only clears when both sides of an interaction sign off. An agent can never write its own history.
        </p>
      </header>

      <section aria-label="Agents" className="border-y border-ink/80">
        {DEMO_AGENTS.map((agent, i) => (
          <AgentRow
            key={agent.id.toString()}
            agent={agent}
            preview={previews[agent.id.toString()] ?? { status: "loading" }}
            selected={selectedId === agent.id}
            onSelect={() => selectAgent(agent.id)}
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </section>

      <section className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCheckAccess}
          className="rounded-sm border border-ink px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
        >
          Check access
        </button>

        {!hasInjectedWallet() ? (
          <p className="font-mono text-xs text-muted">Install Rabby or another wallet to gate on-chain.</p>
        ) : !wallet ? (
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-sm bg-ink px-5 py-2.5 font-sans text-sm font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
          >
            {connecting ? "Connecting…" : "Connect wallet"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGateOnChain}
            disabled={gating}
            className="rounded-sm bg-ink px-5 py-2.5 font-sans text-sm font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
          >
            {gating ? "Gating…" : "Gate on-chain"}
          </button>
        )}

        {wallet && <span className="font-mono text-xs text-muted">{shortAddress(wallet.address)}</span>}
      </section>

      {walletError && <p className="mt-3 font-mono text-xs text-deny">{walletError}</p>}
      {gateError && <p className="mt-3 font-mono text-xs text-deny">{gateError}</p>}

      {result && <ResultStamp result={result} />}
    </main>
  );
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
