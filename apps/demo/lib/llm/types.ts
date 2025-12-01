// apps/demo/lib/llm/types.ts

/**
 * Defines the common interface for an LLM client.
 * This allows for easy swapping between different LLM providers (e.g., Gemini, OpenAI).
 */
export interface LLMClient {
  /**
   * Generates content based on a given prompt, with streaming support.
   * @param prompt The full prompt to send to the model.
   * @returns An AsyncIterable<string> that yields chunks of the response.
   */
  generateContentStream(prompt: string): AsyncIterable<string>;
}
