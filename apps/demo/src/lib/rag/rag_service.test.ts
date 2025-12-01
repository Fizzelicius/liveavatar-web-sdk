// apps/demo/src/lib/rag/rag_service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRagContext } from "./rag_service";
import * as piiModule from "./pii";
import * as geminiClientModule from "../llm/gemini/client"; // Corrected import for generateEmbedding
import * as retrievalModule from "./retrieval";

// Mock dependencies
vi.mock("./pii", () => ({
  redactPii: vi.fn((text) => Promise.resolve(`redacted_${text}`)),
}));

vi.mock("../llm/gemini/client", () => ({
  generateEmbedding: vi.fn(() => Promise.resolve([0.4, 0.5, 0.6])),
}));

vi.mock("./retrieval", () => ({
  retrieveDocumentChunks: vi.fn(() =>
    Promise.resolve([
      {
        id: "chunk1",
        document_id: "doc1",
        content: "content of chunk 1",
        similarity: 0.9,
        title: "Doc Title 1",
      },
      {
        id: "chunk2",
        document_id: "doc1",
        content: "content of chunk 2",
        similarity: 0.8,
        title: "Doc Title 1",
      },
    ]),
  ),
}));

describe("getRagContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should orchestrate PII redaction, embedding generation, and document retrieval", async () => {
    const query = "user query with pii";
    const mockOptions = { matchCount: 3, matchThreshold: 0.7 };

    const { context, formattedContext } = await getRagContext(
      query,
      mockOptions,
    );

    expect(piiModule.redactPii).toHaveBeenCalledWith(query);
    expect(geminiClientModule.generateEmbedding).toHaveBeenCalledWith(
      `redacted_${query}`,
    ); // Corrected module usage
    expect(retrievalModule.retrieveDocumentChunks).toHaveBeenCalledWith(
      [0.4, 0.5, 0.6],
      mockOptions.matchCount,
      mockOptions.matchThreshold,
    );

    expect(context).toEqual([
      {
        id: "chunk1",
        document_id: "doc1",
        content: "content of chunk 1",
        similarity: 0.9,
        title: "Doc Title 1",
      },
      {
        id: "chunk2",
        document_id: "doc1",
        content: "content of chunk 2",
        similarity: 0.8,
        title: "Doc Title 1",
      },
    ]);

    const expectedFormattedContext = JSON.stringify(
      [
        {
          id: "chunk1",
          document_id: "doc1",
          document_title: "Doc Title 1",
          text: "content of chunk 1",
        },
        {
          id: "chunk2",
          document_id: "doc1",
          document_title: "Doc Title 1",
          text: "content of chunk 2",
        },
      ],
      null,
      2,
    );
    expect(formattedContext).toBe(expectedFormattedContext);
  });

  it("should handle no retrieved chunks gracefully", async () => {
    vi.mocked(retrievalModule.retrieveDocumentChunks).mockResolvedValueOnce([]);

    const query = "no match query";
    const { context, formattedContext } = await getRagContext(query);

    expect(context).toEqual([]);
    expect(formattedContext).toBe("No relevant context found.");
  });
});
