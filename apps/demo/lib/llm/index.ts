// apps/demo/lib/llm/index.ts
import { LLMClient } from "./types";
import { getGeminiClient } from "./gemini/client";
import { getOpenAIClient } from "./openai/client";

export type LLMProvider = "openai" | "gemini";

/**
 * Factory function to get an instance of an LLM client based on the provider.
 * The provider is determined by the LLM_PROVIDER environment variable.
 * Defaults to 'openai' if the environment variable is not set or is invalid.
 *
 * @returns An instance of a class that implements the LLMClient interface.
 */
export function getLlmClient(): LLMClient {
  const provider = process.env.LLM_PROVIDER?.toLowerCase() as
    | LLMProvider
    | undefined;

  switch (provider) {
    case "gemini":
      console.log("Using Gemini LLM client.");
      return getGeminiClient();
    case "openai":
    default:
      console.log("Using OpenAI LLM client.");
      return getOpenAIClient();
  }
}
