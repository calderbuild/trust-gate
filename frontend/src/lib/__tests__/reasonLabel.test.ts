import { describe, it, expect } from "vitest";
import { reasonLabel } from "../reasonLabel";

describe("reasonLabel", () => {
  it("defaults to English when no locale is given", () => {
    expect(reasonLabel("GRANTED")).toBe("Access granted");
  });

  it("maps GRANTED to a human-readable label", () => {
    expect(reasonLabel("GRANTED", "en")).toBe("Access granted");
  });

  it("maps AGENT_REVOKED to a human-readable label", () => {
    expect(reasonLabel("AGENT_REVOKED", "en")).toBe("Agent revoked or unknown");
  });

  it("maps MISMATCH_ON_RECORD to a human-readable label", () => {
    expect(reasonLabel("MISMATCH_ON_RECORD", "en")).toBe("Disputed history on record");
  });

  it("maps INSUFFICIENT_HISTORY to a human-readable label", () => {
    expect(reasonLabel("INSUFFICIENT_HISTORY", "en")).toBe("No verified history yet");
  });

  it("falls back to the raw reason string for an unrecognized value", () => {
    expect(reasonLabel("SOME_FUTURE_REASON", "en")).toBe("SOME_FUTURE_REASON");
  });

  it("maps all four reasons in Chinese", () => {
    expect(reasonLabel("GRANTED", "zh")).toBe("准入通过");
    expect(reasonLabel("AGENT_REVOKED", "zh")).toBe("Agent 已注销或不存在");
    expect(reasonLabel("MISMATCH_ON_RECORD", "zh")).toBe("存在有争议的历史记录");
    expect(reasonLabel("INSUFFICIENT_HISTORY", "zh")).toBe("暂无已验证的历史记录");
  });

  it("falls back to the raw reason string in Chinese too", () => {
    expect(reasonLabel("SOME_FUTURE_REASON", "zh")).toBe("SOME_FUTURE_REASON");
  });
});
