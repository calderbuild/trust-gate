import type { DemoAgent } from "../lib/demoAgents";
import type { PreviewAccessResult } from "../lib/contracts";
import { t, type Locale } from "../lib/i18n";

type PreviewState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: PreviewAccessResult };

interface AgentRowProps {
  agent: DemoAgent;
  preview: PreviewState;
  selected: boolean;
  onSelect: () => void;
  locale: Locale;
  style?: React.CSSProperties;
}

export default function AgentRow({ agent, preview, selected, onSelect, locale, style }: AgentRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={style}
      className={`animate-row-in w-full min-h-[44px] text-left border-b border-line px-5 py-4 transition-[background-color,transform] duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-seal-text ${
        selected ? "bg-paper border-l-4 border-l-seal" : "border-l-4 border-l-transparent hover:bg-paper/60 active:bg-paper/80"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-sm text-muted">{agent.name}</span>
        <PreviewCounts preview={preview} locale={locale} />
      </div>
      <p className="mt-1 text-sm text-ink/80 font-sans">{agent.blurb[locale]}</p>
    </button>
  );
}

function PreviewCounts({ preview, locale }: { preview: PreviewState; locale: Locale }) {
  const dict = t(locale);
  if (preview.status === "loading") {
    return (
      <span className="font-mono text-xs text-muted animate-pulse" aria-live="polite">
        {dict.checking}
      </span>
    );
  }
  if (preview.status === "error") {
    return (
      <span className="font-mono text-xs text-deny" aria-live="polite">
        {dict.notDeployedYet}
      </span>
    );
  }
  const { verifiedCount, mismatchCount } = preview.data;
  return (
    <span className="font-mono text-xs text-muted" aria-live="polite">
      {verifiedCount.toString()} {dict.verified} · {mismatchCount.toString()} {dict.mismatch}
    </span>
  );
}
