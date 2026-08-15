import type { CheckAccessResult } from "../lib/contracts";
import { explorerTxUrl } from "../lib/contracts";
import { reasonLabel } from "../lib/reasonLabel";

export default function ResultStamp({ result }: { result: CheckAccessResult }) {
  const granted = result.wouldGrant;
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div
        key={result.txHash}
        className={`animate-stamp-in select-none rounded-sm border-4 px-8 py-3 font-display text-3xl font-black uppercase tracking-widest sm:text-4xl ${
          granted ? "border-grant text-grant" : "border-deny text-deny"
        }`}
        style={{ transform: "rotate(-6deg)" }}
        role="status"
      >
        {granted ? "Granted" : "Denied"}
      </div>
      <p className="font-mono text-sm text-muted text-center">
        {reasonLabel(result.reason)}
        {granted && ` · ${result.verifiedCount.toString()} verified receipt${result.verifiedCount === 1n ? "" : "s"}`}
      </p>
      <a
        href={explorerTxUrl(result.txHash)}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-xs text-seal underline decoration-dotted underline-offset-4 hover:text-ink transition-colors duration-200"
      >
        View transaction on Monad Explorer ↗
      </a>
    </div>
  );
}
