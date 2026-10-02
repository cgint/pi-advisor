import { afterEach, describe, expect, it } from "vitest";
import {
  clampWords,
  parseAdvisorEntry,
  redactSecrets,
  resolveAdvisorChain,
  type AdvisorConfig,
} from "../src/advisor.js";

const ORIGINAL_ENV = { ...process.env };

function baseConfig(): AdvisorConfig {
  return {
    provider: "google",
    model: "gemini-3.5-flash",
    requireAllow: false,
    allowed: true,
    redact: true,
    maxPerTurn: 10,
    defaultMaxWords: 600,
    reasoningEffort: "medium",
    cacheRetention: "short",
  };
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("parseAdvisorEntry", () => {
  it("parses provider, model, and reasoning effort", () => {
    expect(parseAdvisorEntry("google/gemini-3.5-flash:medium", "off")).toEqual({
      provider: "google",
      model: "gemini-3.5-flash",
      reasoningEffort: "medium",
    });
  });

  it("splits model on the last colon only", () => {
    expect(parseAdvisorEntry("proxy/model:with:colon:high", "off")).toEqual({
      provider: "proxy",
      model: "model:with:colon",
      reasoningEffort: "high",
    });
  });

  it("rejects malformed entries", () => {
    expect(parseAdvisorEntry("missing-slash", "medium")).toBeNull();
    expect(parseAdvisorEntry("/missing-provider", "medium")).toBeNull();
    expect(parseAdvisorEntry("provider/", "medium")).toBeNull();
  });
});

describe("resolveAdvisorChain", () => {
  it("uses the built-in default chain when PI_ADVISOR_MODELS is unset", () => {
    delete process.env.PI_ADVISOR_MODELS;

    expect(resolveAdvisorChain(baseConfig())).toEqual([
      {
        provider: "8081-twins",
        model: "qwen36-27b-nvidia-nvfp4",
        reasoningEffort: "off",
      },
      {
        provider: "google",
        model: "gemini-3.6-flash",
        reasoningEffort: "medium",
      },
    ]);
  });

  it("uses the configured chain and fills missing effort from config", () => {
    process.env.PI_ADVISOR_MODELS = "local/qwen:off#google/gemini-3.5-flash";

    expect(resolveAdvisorChain(baseConfig())).toEqual([
      { provider: "local", model: "qwen", reasoningEffort: "off" },
      { provider: "google", model: "gemini-3.5-flash", reasoningEffort: "medium" },
    ]);
  });

  it("falls back to legacy provider/model when configured entries are invalid", () => {
    process.env.PI_ADVISOR_MODELS = "bad#also-bad";

    expect(resolveAdvisorChain(baseConfig())).toEqual([
      { provider: "google", model: "gemini-3.5-flash", reasoningEffort: "medium" },
    ]);
  });
});

describe("redactSecrets", () => {
  it("redacts common token shapes and Authorization bearer headers", () => {
    const text = [
      "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456",
      "Authorization: Bearer secret-token-value",
      "github_pat_abcdefghijklmnopqrstuvwxyz1234567890",
    ].join("\n");

    const redacted = redactSecrets(text, true);

    expect(redacted).toContain("OPENAI_API_KEY=[REDACTED]");
    expect(redacted).toContain("Authorization: Bearer [REDACTED]");
    expect(redacted).toContain("[REDACTED_GITHUB_TOKEN]");
    expect(redacted).not.toContain("secret-token-value");
  });

  it("can be disabled", () => {
    const text = "Authorization: Bearer secret-token-value";
    expect(redactSecrets(text, false)).toBe(text);
  });
});

describe("clampWords", () => {
  it("clamps to the supported advisor word range", () => {
    expect(clampWords(10, 600)).toBe(80);
    expect(clampWords(2_000, 600)).toBe(1_200);
    expect(clampWords(333.9, 600)).toBe(333);
    expect(clampWords("bad", 600)).toBe(600);
  });
});
