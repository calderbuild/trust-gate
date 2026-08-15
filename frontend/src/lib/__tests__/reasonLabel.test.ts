import { describe, it, expect } from "vitest";
import { reasonLabel } from "../reasonLabel";

describe("reasonLabel", () => {
  it("maps GRANTED to a human-readable label", () => {
    expect(reasonLabel("GRANTED")).toBe("Access granted");
  });

  it("maps AGENT_REVOKED to a human-readable label", () => {
    expect(reasonLabel("AGENT_REVOKED")).toBe("Agent revoked or unknown");
  });

  it("maps MISMATCH_ON_RECORD to a human-readable label", () => {
    expect(reasonLabel("MISMATCH_ON_RECORD")).toBe("Disputed history on record");
  });

  it("maps INSUFFICIENT_HISTORY to a human-readable label", () => {
    expect(reasonLabel("INSUFFICIENT_HISTORY")).toBe("No verified history yet");
  });

  it("falls back to the raw reason string for an unrecognized value", () => {
    expect(reasonLabel("SOME_FUTURE_REASON")).toBe("SOME_FUTURE_REASON");
  });
});
