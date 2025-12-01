// apps/demo/app/api/narrate/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"; // Removed afterEach
import { POST } from "./narrate/route"; // Adjust path based on actual location
import { NextRequest } from "next/server";
import * as ragService from "../../../lib/rag/rag_service";
import * as llmClientModule from "../../../lib/llm";
import { LLMClient } from "../../../lib/llm/types";

// Mock the ragService and llmClientModule
vi.mock("../../../lib/rag/rag_service", () => ({
  getRagContext: vi.fn(() =>
    Promise.resolve({
      context: [
        {
          id: "mock_chunk_id",
          document_id: "mock_doc_id",
          content: "mocked context content",
          similarity: 0.99,
          title: "Mock Document",
        },
      ],
      formattedContext: "Mocked formatted context",
    }),
  ),
}));

vi.mock("../../../lib/llm", () => ({
  getLlmClient: vi.fn(() => ({
    generateContentStream: vi.fn(async function* () {
      yield '{"answer":"This is a ';
      yield 'streamed response.", "visualization":{"type":"none"}}';
    }),
  })),
}));

describe("Narrate API Route (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if query is missing", async () => {
    const req = new NextRequest("http://localhost/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatHistory: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Query is required" });
  });

  it("should call RAG and LLM services and stream the response", async () => {
    const mockQuery = "What is the capital of France?";
    const req = new NextRequest("http://localhost/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mockQuery, chatHistory: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");

    expect(ragService.getRagContext).toHaveBeenCalledWith(mockQuery);
    expect(llmClientModule.getLlmClient).toHaveBeenCalled();

    const llmClient = llmClientModule.getLlmClient() as LLMClient;
    expect(llmClient.generateContentStream).toHaveBeenCalledOnce();

    // Read the streamed response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let receivedData = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      receivedData += decoder.decode(value);
    }

    const expectedPromptPart = `User Question:
<USER_QUESTION>
${mockQuery}
</USER_QUESTION>`;
    expect(llmClient.generateContentStream).toHaveBeenCalledWith(
      expect.stringContaining(expectedPromptPart),
    );
    expect(llmClient.generateContentStream).toHaveBeenCalledWith(
      expect.stringContaining("Mocked formatted context"),
    );

    // Expecting one data event for the streamed JSON (our mock yields two chunks)
    const dataEvents = receivedData
      .split("\n\n")
      .filter((line) => line.startsWith("data:"));
    expect(dataEvents.length).toBe(1); // Our mock yields into one coherent string.

    const finalJson = JSON.parse(dataEvents[0].substring(5));
    expect(finalJson).toEqual({
      answer: "This is a streamed response.",
      visualization: { type: "none" }, // Default from mock
      partial: false,
    });
  });

  it("should handle errors from RAG service", async () => {
    (ragService.getRagContext as vi.Mock).mockRejectedValueOnce(
      new Error("RAG failure"),
    );

    const req = new NextRequest("http://localhost/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "error query" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({
      error: "An internal server error occurred",
      details: "RAG failure",
    });
  });

  it("should handle errors from LLM service", async () => {
    (llmClientModule.getLlmClient as vi.Mock).mockReturnValueOnce({
      generateContentStream: vi.fn(async function* () {
        throw new Error("LLM stream failed");
      }),
    });

    const req = new NextRequest("http://localhost/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "error query" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200); // SSE streams always return 200, error is in the data

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let receivedData = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      receivedData += decoder.decode(value);
    }

    const dataEvents = receivedData
      .split("\n\n")
      .filter((line) => line.startsWith("data:"));
    expect(dataEvents.length).toBe(1);
    const errorJson = JSON.parse(dataEvents[0].substring(5));
    expect(errorJson).toEqual({
      error: "Failed to get response from AI model.",
      details: "LLM stream failed",
      partial: false,
    });
  });
});
