import { t, type Locale } from "../lib/i18n";

const QR_SIZE = 29;
const DEMO_URL = "trust-gate-flax.vercel.app";

// Modules for https://trust-gate-flax.vercel.app, generated once at build
// time (errorCorrectionLevel M) and embedded as static rects — no runtime
// QR library, no network call, so scanning it never depends on the venue's
// wifi. Regenerate with scripts/gen-qr.mjs if the production URL changes.
function QrGrid() {
  return (
    <svg viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="0" width={QR_SIZE} height={QR_SIZE} fill="#f7f5f0" />
      <g fill="#14171c">
        <rect x="0" y="0" width="7" height="1"/>
        <rect x="9" y="0" width="2" height="1"/>
        <rect x="12" y="0" width="4" height="1"/>
        <rect x="17" y="0" width="1" height="1"/>
        <rect x="19" y="0" width="2" height="1"/>
        <rect x="22" y="0" width="7" height="1"/>
        <rect x="0" y="1" width="1" height="1"/>
        <rect x="6" y="1" width="1" height="1"/>
        <rect x="10" y="1" width="2" height="1"/>
        <rect x="13" y="1" width="4" height="1"/>
        <rect x="18" y="1" width="1" height="1"/>
        <rect x="20" y="1" width="1" height="1"/>
        <rect x="22" y="1" width="1" height="1"/>
        <rect x="28" y="1" width="1" height="1"/>
        <rect x="0" y="2" width="1" height="1"/>
        <rect x="2" y="2" width="3" height="1"/>
        <rect x="6" y="2" width="1" height="1"/>
        <rect x="8" y="2" width="1" height="1"/>
        <rect x="10" y="2" width="4" height="1"/>
        <rect x="15" y="2" width="1" height="1"/>
        <rect x="18" y="2" width="1" height="1"/>
        <rect x="22" y="2" width="1" height="1"/>
        <rect x="24" y="2" width="3" height="1"/>
        <rect x="28" y="2" width="1" height="1"/>
        <rect x="0" y="3" width="1" height="1"/>
        <rect x="2" y="3" width="3" height="1"/>
        <rect x="6" y="3" width="1" height="1"/>
        <rect x="8" y="3" width="1" height="1"/>
        <rect x="11" y="3" width="2" height="1"/>
        <rect x="14" y="3" width="2" height="1"/>
        <rect x="17" y="3" width="2" height="1"/>
        <rect x="22" y="3" width="1" height="1"/>
        <rect x="24" y="3" width="3" height="1"/>
        <rect x="28" y="3" width="1" height="1"/>
        <rect x="0" y="4" width="1" height="1"/>
        <rect x="2" y="4" width="3" height="1"/>
        <rect x="6" y="4" width="1" height="1"/>
        <rect x="8" y="4" width="1" height="1"/>
        <rect x="11" y="4" width="2" height="1"/>
        <rect x="15" y="4" width="6" height="1"/>
        <rect x="22" y="4" width="1" height="1"/>
        <rect x="24" y="4" width="3" height="1"/>
        <rect x="28" y="4" width="1" height="1"/>
        <rect x="0" y="5" width="1" height="1"/>
        <rect x="6" y="5" width="1" height="1"/>
        <rect x="8" y="5" width="1" height="1"/>
        <rect x="12" y="5" width="1" height="1"/>
        <rect x="17" y="5" width="1" height="1"/>
        <rect x="22" y="5" width="1" height="1"/>
        <rect x="28" y="5" width="1" height="1"/>
        <rect x="0" y="6" width="7" height="1"/>
        <rect x="8" y="6" width="1" height="1"/>
        <rect x="10" y="6" width="1" height="1"/>
        <rect x="12" y="6" width="1" height="1"/>
        <rect x="14" y="6" width="1" height="1"/>
        <rect x="16" y="6" width="1" height="1"/>
        <rect x="18" y="6" width="1" height="1"/>
        <rect x="20" y="6" width="1" height="1"/>
        <rect x="22" y="6" width="7" height="1"/>
        <rect x="8" y="7" width="2" height="1"/>
        <rect x="14" y="7" width="1" height="1"/>
        <rect x="16" y="7" width="1" height="1"/>
        <rect x="18" y="7" width="1" height="1"/>
        <rect x="20" y="7" width="1" height="1"/>
        <rect x="0" y="8" width="1" height="1"/>
        <rect x="2" y="8" width="5" height="1"/>
        <rect x="11" y="8" width="2" height="1"/>
        <rect x="17" y="8" width="1" height="1"/>
        <rect x="19" y="8" width="1" height="1"/>
        <rect x="22" y="8" width="5" height="1"/>
        <rect x="0" y="9" width="2" height="1"/>
        <rect x="4" y="9" width="1" height="1"/>
        <rect x="7" y="9" width="5" height="1"/>
        <rect x="13" y="9" width="3" height="1"/>
        <rect x="19" y="9" width="2" height="1"/>
        <rect x="22" y="9" width="3" height="1"/>
        <rect x="28" y="9" width="1" height="1"/>
        <rect x="2" y="10" width="1" height="1"/>
        <rect x="4" y="10" width="1" height="1"/>
        <rect x="6" y="10" width="1" height="1"/>
        <rect x="8" y="10" width="1" height="1"/>
        <rect x="10" y="10" width="6" height="1"/>
        <rect x="17" y="10" width="1" height="1"/>
        <rect x="23" y="10" width="1" height="1"/>
        <rect x="0" y="11" width="2" height="1"/>
        <rect x="3" y="11" width="1" height="1"/>
        <rect x="5" y="11" width="1" height="1"/>
        <rect x="7" y="11" width="4" height="1"/>
        <rect x="12" y="11" width="2" height="1"/>
        <rect x="15" y="11" width="1" height="1"/>
        <rect x="18" y="11" width="4" height="1"/>
        <rect x="24" y="11" width="2" height="1"/>
        <rect x="27" y="11" width="1" height="1"/>
        <rect x="1" y="12" width="2" height="1"/>
        <rect x="4" y="12" width="1" height="1"/>
        <rect x="6" y="12" width="4" height="1"/>
        <rect x="12" y="12" width="1" height="1"/>
        <rect x="14" y="12" width="4" height="1"/>
        <rect x="21" y="12" width="1" height="1"/>
        <rect x="23" y="12" width="1" height="1"/>
        <rect x="25" y="12" width="2" height="1"/>
        <rect x="0" y="13" width="1" height="1"/>
        <rect x="4" y="13" width="1" height="1"/>
        <rect x="7" y="13" width="1" height="1"/>
        <rect x="9" y="13" width="1" height="1"/>
        <rect x="16" y="13" width="1" height="1"/>
        <rect x="18" y="13" width="7" height="1"/>
        <rect x="28" y="13" width="1" height="1"/>
        <rect x="0" y="14" width="2" height="1"/>
        <rect x="5" y="14" width="2" height="1"/>
        <rect x="8" y="14" width="1" height="1"/>
        <rect x="11" y="14" width="1" height="1"/>
        <rect x="15" y="14" width="1" height="1"/>
        <rect x="20" y="14" width="1" height="1"/>
        <rect x="22" y="14" width="5" height="1"/>
        <rect x="0" y="15" width="1" height="1"/>
        <rect x="5" y="15" width="1" height="1"/>
        <rect x="10" y="15" width="1" height="1"/>
        <rect x="14" y="15" width="2" height="1"/>
        <rect x="20" y="15" width="1" height="1"/>
        <rect x="23" y="15" width="2" height="1"/>
        <rect x="27" y="15" width="1" height="1"/>
        <rect x="0" y="16" width="1" height="1"/>
        <rect x="4" y="16" width="1" height="1"/>
        <rect x="6" y="16" width="1" height="1"/>
        <rect x="8" y="16" width="5" height="1"/>
        <rect x="15" y="16" width="3" height="1"/>
        <rect x="19" y="16" width="1" height="1"/>
        <rect x="23" y="16" width="1" height="1"/>
        <rect x="25" y="16" width="2" height="1"/>
        <rect x="0" y="17" width="3" height="1"/>
        <rect x="4" y="17" width="1" height="1"/>
        <rect x="7" y="17" width="1" height="1"/>
        <rect x="9" y="17" width="2" height="1"/>
        <rect x="13" y="17" width="2" height="1"/>
        <rect x="16" y="17" width="1" height="1"/>
        <rect x="19" y="17" width="1" height="1"/>
        <rect x="21" y="17" width="4" height="1"/>
        <rect x="26" y="17" width="1" height="1"/>
        <rect x="28" y="17" width="1" height="1"/>
        <rect x="0" y="18" width="1" height="1"/>
        <rect x="2" y="18" width="1" height="1"/>
        <rect x="4" y="18" width="3" height="1"/>
        <rect x="9" y="18" width="10" height="1"/>
        <rect x="20" y="18" width="1" height="1"/>
        <rect x="26" y="18" width="1" height="1"/>
        <rect x="0" y="19" width="1" height="1"/>
        <rect x="7" y="19" width="1" height="1"/>
        <rect x="11" y="19" width="1" height="1"/>
        <rect x="13" y="19" width="1" height="1"/>
        <rect x="15" y="19" width="1" height="1"/>
        <rect x="18" y="19" width="1" height="1"/>
        <rect x="20" y="19" width="1" height="1"/>
        <rect x="22" y="19" width="1" height="1"/>
        <rect x="24" y="19" width="1" height="1"/>
        <rect x="27" y="19" width="1" height="1"/>
        <rect x="0" y="20" width="1" height="1"/>
        <rect x="3" y="20" width="5" height="1"/>
        <rect x="9" y="20" width="1" height="1"/>
        <rect x="12" y="20" width="1" height="1"/>
        <rect x="14" y="20" width="2" height="1"/>
        <rect x="17" y="20" width="1" height="1"/>
        <rect x="20" y="20" width="5" height="1"/>
        <rect x="26" y="20" width="3" height="1"/>
        <rect x="8" y="21" width="1" height="1"/>
        <rect x="11" y="21" width="1" height="1"/>
        <rect x="16" y="21" width="1" height="1"/>
        <rect x="18" y="21" width="1" height="1"/>
        <rect x="20" y="21" width="1" height="1"/>
        <rect x="24" y="21" width="5" height="1"/>
        <rect x="0" y="22" width="7" height="1"/>
        <rect x="9" y="22" width="1" height="1"/>
        <rect x="11" y="22" width="1" height="1"/>
        <rect x="15" y="22" width="1" height="1"/>
        <rect x="17" y="22" width="4" height="1"/>
        <rect x="22" y="22" width="1" height="1"/>
        <rect x="24" y="22" width="3" height="1"/>
        <rect x="0" y="23" width="1" height="1"/>
        <rect x="6" y="23" width="1" height="1"/>
        <rect x="8" y="23" width="3" height="1"/>
        <rect x="14" y="23" width="1" height="1"/>
        <rect x="16" y="23" width="1" height="1"/>
        <rect x="19" y="23" width="2" height="1"/>
        <rect x="24" y="23" width="1" height="1"/>
        <rect x="27" y="23" width="2" height="1"/>
        <rect x="0" y="24" width="1" height="1"/>
        <rect x="2" y="24" width="3" height="1"/>
        <rect x="6" y="24" width="1" height="1"/>
        <rect x="8" y="24" width="2" height="1"/>
        <rect x="17" y="24" width="1" height="1"/>
        <rect x="20" y="24" width="5" height="1"/>
        <rect x="26" y="24" width="2" height="1"/>
        <rect x="0" y="25" width="1" height="1"/>
        <rect x="2" y="25" width="3" height="1"/>
        <rect x="6" y="25" width="1" height="1"/>
        <rect x="8" y="25" width="5" height="1"/>
        <rect x="14" y="25" width="1" height="1"/>
        <rect x="18" y="25" width="1" height="1"/>
        <rect x="23" y="25" width="1" height="1"/>
        <rect x="25" y="25" width="4" height="1"/>
        <rect x="0" y="26" width="1" height="1"/>
        <rect x="2" y="26" width="3" height="1"/>
        <rect x="6" y="26" width="1" height="1"/>
        <rect x="8" y="26" width="1" height="1"/>
        <rect x="12" y="26" width="2" height="1"/>
        <rect x="15" y="26" width="1" height="1"/>
        <rect x="19" y="26" width="1" height="1"/>
        <rect x="21" y="26" width="7" height="1"/>
        <rect x="0" y="27" width="1" height="1"/>
        <rect x="6" y="27" width="1" height="1"/>
        <rect x="9" y="27" width="4" height="1"/>
        <rect x="14" y="27" width="3" height="1"/>
        <rect x="19" y="27" width="3" height="1"/>
        <rect x="24" y="27" width="2" height="1"/>
        <rect x="27" y="27" width="1" height="1"/>
        <rect x="0" y="28" width="7" height="1"/>
        <rect x="8" y="28" width="2" height="1"/>
        <rect x="13" y="28" width="1" height="1"/>
        <rect x="17" y="28" width="1" height="1"/>
        <rect x="19" y="28" width="1" height="1"/>
        <rect x="23" y="28" width="4" height="1"/>
      </g>
    </svg>
  );
}

export default function QrTicket({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <div className="hidden sm:flex flex-col items-center gap-3 pt-2">
      <div className="ledger-perforation w-16" aria-hidden="true" />
      <div className="rounded-sm border border-line/60 bg-[#f7f5f0] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-10px_rgba(0,0,0,0.3)]">
        <div className="h-28 w-28">
          <QrGrid />
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-seal-text">{dict.scanToTry}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted">{DEMO_URL}</p>
      </div>
    </div>
  );
}
