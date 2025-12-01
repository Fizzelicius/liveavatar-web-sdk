// apps/demo/src/lib/llm/gemini/client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGeminiClient } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMClient } from "../types";

// Mock the GoogleGenerativeAI module
vi.mock("@google/generative-ai", () => {
  const mockGenerateContentStream = vi.fn(async function* () {
    yield { text: () => '{"answer":"partial ' };
    yield { text: () => 'response", "visualization":{"type":"none"}}' };
  });
  const mockGenerateContent = vi.fn(() => ({
    stream: mockGenerateContentStream(),
  }));
  const mockGetGenerativeModel = vi.fn(() => ({
    generateContent: mockGenerateContent,
    embedContent: vi.fn(() => ({
      embedding: { values: [0.1, 0.2, 0.3] },
    })),
  }));
  return {
    GoogleGenerativeAI: vi.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

describe("GeminiClient", () => {
  let geminiClient: LLMClient;
  const mockApiKey = "test-gemini-api-key";

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = mockApiKey; // Ensure API key is set for client initialization
    geminiClient = getGeminiClient();
  });

  it("should be an instance of LLMClient", () => {
    expect(geminiClient).toHaveProperty("generateContentStream");
  });

  it("should call GoogleGenerativeAI with the correct API key", () => {
    // Client is instantiated in beforeEach
    expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
  });

  it("should call getGenerativeModel with the specified model", () => {
    getGeminiClient("test-model");
    expect(GoogleGenerativeAI().getGenerativeModel).toHaveBeenCalledWith({
      model: "test-model",
    });
  });

  it("generateContentStream should call Gemini API with the correct prompt and return stream", async () => {
    const prompt = "Test prompt for Gemini";
    const stream = geminiClient.generateContentStream(prompt);
    let accumulatedText = "";
    for await (const chunk of stream) {
      accumulatedText += chunk;
    }

    expect(GoogleGenerativeAI().getGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-pro",
      generationConfig: { responseMimeType: "application/json" },
    });
    expect(
      GoogleGenerativeAI().getGenerativeModel("gemini-pro").generateContent,
    ).toHaveBeenCalledWith({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    expect(accumulatedText).toBe(
      '{"answer":"partial response", "visualization":{"type":"none"}}',
    );
  });

  it("generateEmbedding should call Gemini embedding API with correct text", async () => {
    const text = "text for embedding";
    // This is from the standalone generateEmbedding function in gemini/client.ts
    const { generateEmbedding: geminiGenerateEmbedding } = await import(
      "./client"
    );
    const embedding = await geminiGenerateEmbedding(text);

    expect(GoogleGenerativeAI().getGenerativeModel).toHaveBeenCalledWith({
      model: "embedding-001",
    });
    expect(
      GoogleGenerativeAI().getGenerativeModel("embedding-001").embedContent,
    ).toHaveBeenCalledWith(text);
    expect(embedding).toEqual([0.1, 0.2, 0.3]);
  });
});
