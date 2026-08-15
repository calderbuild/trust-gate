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

// One-line statement of the policy branch that produced the verdict, so the
// result never reads as an opaque black box — the visitor sees the rule,
// not just the outcome.
const RULES: Record<Locale, Record<string, string>> = {
  en: {
    GRANTED: "Rule: at least one verified receipt and zero disputes grants access.",
    AGENT_REVOKED: "Rule: a revoked or unregistered agent is always denied.",
    MISMATCH_ON_RECORD:
      "Rule: one disputed receipt vetoes access, no matter how many clean receipts exist.",
    INSUFFICIENT_HISTORY: "Rule: at least one verified receipt is required to grant access.",
  },
  zh: {
    GRANTED: "规则：至少 1 条验证通过、0 条有争议即放行。",
    AGENT_REVOKED: "规则：已注销或不存在的 agent 一律拒绝。",
    MISMATCH_ON_RECORD: "规则：任意一条有争议记录即一票否决，不论有多少条干净记录。",
    INSUFFICIENT_HISTORY: "规则：至少要有 1 条验证通过的记录才会放行。",
  },
};

export function reasonRule(reason: string, locale: Locale = "en"): string {
  return RULES[locale][reason] ?? "";
}
