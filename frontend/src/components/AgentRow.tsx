import type { DemoAgent } from "../lib/demoAgents";
import type { PreviewAccessResult } from "../lib/contracts";

type PreviewState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: PreviewAccessResult };

interface AgentRowProps {
  agent: DemoAgent;
  preview: PreviewState;
  selected: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
}

export default function AgentRow({ agent, preview, selected, onSelect, style }: AgentRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={style}
      className={`animate-row-in w-full text-left border-b border-line px-5 py-4 transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-seal ${
        selected ? "bg-paper-raised border-l-4 border-l-seal" : "border-l-4 border-l-transparent hover:bg-paper-raised/60"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-sm text-muted">{agent.name}</span>
        <PreviewCounts preview={preview} />
      </div>
      <p className="mt-1 text-sm text-ink/80 font-sans">{agent.blurb}</p>
    </button>
  );
}

function PreviewCounts({ preview }: { preview: PreviewState }) {
  if (preview.status === "loading") {
    return <span className="font-mono text-xs text-muted animate-pulse">checking…</span>;
  }
  if (preview.status === "error") {
    return <span className="font-mono text-xs text-deny">{preview.message}</span>;
  }
  const { verifiedCount, mismatchCount } = preview.data;
  return (
    <span className="font-mono text-xs text-muted">
      {verifiedCount.toString()} verified · {mismatchCount.toString()} mismatch
    </span>
  );
}
