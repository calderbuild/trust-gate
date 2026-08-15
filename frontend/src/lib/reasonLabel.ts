// Pure mapping from TrustGate.previewAccess's raw `reason` string to
// copy a first-time visitor can read without a tooltip. Kept separate
// from contracts.ts so it's testable without touching ethers at all.
const LABELS: Record<string, string> = {
  GRANTED: "Access granted",
  AGENT_REVOKED: "Agent revoked or unknown",
  MISMATCH_ON_RECORD: "Disputed history on record",
  INSUFFICIENT_HISTORY: "No verified history yet",
};

export function reasonLabel(reason: string): string {
  return LABELS[reason] ?? reason;
}
