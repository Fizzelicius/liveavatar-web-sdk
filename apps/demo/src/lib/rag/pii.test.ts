// apps/demo/src/lib/rag/pii.test.ts
import { describe, it, expect } from "vitest";
import { redactPii } from "./pii";

describe("redactPii", () => {
  it("should return the original text as it is a placeholder", async () => {
    const text =
      "This is a test string with some PII like John Doe and 123-456-7890.";
    const redactedText = await redactPii(text);
    expect(redactedText).toBe(text);
  });

  it("should handle empty strings", async () => {
    const text = "";
    const redactedText = await redactPii(text);
    expect(redactedText).toBe("");
  });

  it("should handle strings with only PII-like patterns (currently passes through)", async () => {
    const text = "secret@example.com 123 Main St.";
    const redactedText = await redactPii(text);
    expect(redactedText).toBe(text);
  });
});
