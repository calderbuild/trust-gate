import type { Locale } from "./i18n";

// Pure mapping from TrustGate.previewAccess's raw `reason` string to
// copy a first-time visitor can read without a tooltip. Kept separate
// from contracts.ts so it's testable without touching ethers at all.
const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    GRANTED: "Access granted",
    AGENT_REVOKED: "Agent revoked or unknown",
    MISMATCH_ON_RECORD: "Disputed history on record",
    INSUFFICIENT_HISTORY: "No verified history yet",
  },
  zh: {
    GRANTED: "准入通过",
    AGENT_REVOKED: "Agent 已注销或不存在",
    MISMATCH_ON_RECORD: "存在有争议的历史记录",
    INSUFFICIENT_HISTORY: "暂无已验证的历史记录",
  },
};

export function reasonLabel(reason: string, locale: Locale = "en"): string {
  return LABELS[locale][reason] ?? reason;
}
