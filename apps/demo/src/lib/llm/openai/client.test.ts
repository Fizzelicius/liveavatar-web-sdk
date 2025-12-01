// apps/demo/src/lib/llm/openai/client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOpenAIClient } from "./client";
import OpenAI from "openai";
import { LLMClient } from "../types";

// Mock the openai module
vi.mock("openai", () => {
  const mockCreateChatCompletionStream = vi.fn(async function* () {
    yield { choices: [{ delta: { content: "partial " } }] };
    yield { choices: [{ delta: { content: "response" } }] };
  });
  const mockChat = {
    completions: {
      create: mockCreateChatCompletionStream,
    },
  };
  return {
    default: vi.fn(() => ({
      chat: mockChat,
    })),
  };
});

describe("OpenAIClient", () => {
  let openaiClient: LLMClient;
  const mockApiKey = "test-openai-api-key";

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = mockApiKey; // Ensure API key is set for client initialization
    openaiClient = getOpenAIClient();
  });

  it("should be an instance of LLMClient", () => {
    expect(openaiClient).toHaveProperty("generateContentStream");
  });

  it("should call OpenAI with the correct API key", () => {
    // Client is instantiated in beforeEach
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
  });

  it("should call chat completions create with the correct model and prompt", async () => {
    const prompt = "Test prompt for OpenAI";
    const stream = openaiClient.generateContentStream(prompt);
    let accumulatedText = "";
    for await (const chunk of stream) {
      accumulatedText += chunk;
    }

    expect(OpenAI().chat.completions.create).toHaveBeenCalledWith({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      stream: true,
      response_format: { type: "json_object" },
    });
    expect(accumulatedText).toBe("partial response");
  });
});
