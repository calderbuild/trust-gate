import { useEffect, useState } from "react";
import { DEMO_AGENTS } from "../lib/demoAgents";
import { previewAccess, checkAccess, type PreviewAccessResult, type CheckAccessResult } from "../lib/contracts";
import { connectWallet, useHasInjectedWallet, type ConnectedWallet } from "../lib/wallet";
import { t, DEFAULT_LOCALE, type Locale } from "../lib/i18n";
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
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const dict = t(locale);
  const hasWallet = useHasInjectedWallet();

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

  const selectedAgent = DEMO_AGENTS.find((agent) => agent.id === selectedId) ?? DEMO_AGENTS[0];

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
      console.error(err);
      setWalletError(dict.connectFailed);
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
      console.error(err);
      setGateError(dict.gateFailed);
    } finally {
      setGating(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:py-14">
      <div className="ledger-sheet">
        <div className="ledger-perforation" aria-hidden="true" />
        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-seal-text">{dict.eyebrow}</p>
              <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">TrustGate</h1>
              <p className="mt-3 max-w-md font-sans text-base text-muted">{dict.subhead}</p>
            </div>
            <LocaleToggle locale={locale} onChange={setLocale} />
          </header>

          <section aria-label="Agents" className="border-y border-ink/80">
            {DEMO_AGENTS.map((agent, i) => (
              <AgentRow
                key={agent.id.toString()}
                agent={agent}
                preview={previews[agent.id.toString()] ?? { status: "loading" }}
                selected={selectedId === agent.id}
                onSelect={() => selectAgent(agent.id)}
                locale={locale}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </section>

          <section className="mt-6 flex flex-wrap items-start gap-4">
            <div>
              <button
                type="button"
                onClick={handleCheckAccess}
                className="min-h-[44px] rounded-sm border border-ink px-5 py-3 font-sans text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper active:bg-paper/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal-text"
              >
                {dict.checkAccess}
              </button>
              <p className="mt-1.5 font-mono text-[11px] text-muted">{dict.checkAccessHint}</p>
            </div>

            {!hasWallet ? (
              <p className="font-mono text-xs text-muted max-w-xs pt-2.5">{dict.noWallet}</p>
            ) : !wallet ? (
              <div>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="min-h-[44px] rounded-sm bg-ink px-5 py-3 font-sans text-sm font-medium text-paper-raised transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal-text"
                >
                  {connecting ? dict.connecting : dict.connectWallet}
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleGateOnChain}
                  disabled={gating}
                  className="min-h-[44px] rounded-sm bg-ink px-5 py-3 font-sans text-sm font-medium text-paper-raised transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal-text"
                >
                  {gating ? dict.gating : dict.gateOnChain}
                </button>
                <p className="mt-1.5 font-mono text-[11px] text-muted">{dict.gateOnChainHint}</p>
              </div>
            )}

            {wallet && <span className="font-mono text-xs text-muted pt-2.5">{shortAddress(wallet.address)}</span>}
          </section>

          <div aria-live="polite">
            {walletError && <p className="mt-3 font-mono text-xs text-deny">{walletError}</p>}
            {gateError && <p className="mt-3 font-mono text-xs text-deny">{gateError}</p>}
          </div>

          {result && <ResultStamp result={result} locale={locale} agentName={selectedAgent.name} />}
        </div>
      </div>
    </main>
  );
}

function LocaleToggle({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1 font-mono text-xs" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => onChange("zh")}
        aria-pressed={locale === "zh"}
        className={`min-h-[36px] rounded-sm px-2.5 py-1.5 transition-colors duration-200 active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal-text ${
          locale === "zh" ? "bg-ink text-paper" : "text-muted hover:text-ink"
        }`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-pressed={locale === "en"}
        className={`min-h-[36px] rounded-sm px-2.5 py-1.5 transition-colors duration-200 active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal-text ${
          locale === "en" ? "bg-ink text-paper" : "text-muted hover:text-ink"
        }`}
      >
        EN
      </button>
    </div>
  );
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
