import type { PreviewAccessResult } from "../lib/contracts";
import { explorerTxUrl } from "../lib/contracts";
import { reasonLabel } from "../lib/reasonLabel";
import { t, type Locale } from "../lib/i18n";

interface ResultStampProps {
  // txHash is only present after a real signed checkAccess transaction.
  // The free preview shares the exact same contract logic (KTD3 — the
  // view and write paths can never disagree) so the verdict itself is
  // just as real either way; only the receipt link is conditional.
  result: PreviewAccessResult & { txHash?: string };
  locale: Locale;
  agentName: string;
}

export default function ResultStamp({ result, locale, agentName }: ResultStampProps) {
  const granted = result.wouldGrant;
  const dict = t(locale);
  const receiptWord = result.verifiedCount === 1n ? dict.verifiedReceipt : dict.verifiedReceipts;
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div
        key={result.txHash ?? `${result.reason}-${result.wouldGrant}`}
        className={`animate-stamp-in select-none rounded-sm border-4 px-8 py-3 font-display text-3xl font-black uppercase tracking-widest sm:text-4xl ${
          granted ? "border-grant text-grant" : "border-deny text-deny"
        }`}
        style={{ transform: "rotate(-6deg)" }}
        role="status"
      >
        {granted ? (locale === "zh" ? "通过" : "Granted") : locale === "zh" ? "拒绝" : "Denied"}
      </div>
      <p className="font-mono text-sm text-muted text-center">
        {agentName} · {reasonLabel(result.reason, locale)}
        {granted && ` · ${result.verifiedCount.toString()} ${receiptWord}`}
      </p>
      {result.txHash ? (
        <a
          href={explorerTxUrl(result.txHash)}
          target="_blank"
          rel="noreferrer"
          className="inline-block px-2 py-2 -mx-2 -my-2 font-mono text-xs text-seal-text underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-ink active:text-ink"
        >
          {dict.viewTx}
        </a>
      ) : (
        <p className="font-mono text-xs text-muted">{dict.previewNote}</p>
      )}
    </div>
  );
}
