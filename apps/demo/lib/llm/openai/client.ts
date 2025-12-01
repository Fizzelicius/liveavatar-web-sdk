// apps/demo/lib/llm/openai/client.ts
import OpenAI from "openai";
import { LLMClient } from "../types";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error(
    "OPENAI_API_KEY environment variable is not set. Please check your .env.local file.",
  );
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

class OpenAIClient implements LLMClient {
  private model: string;

  constructor(model: string = "gpt-4-turbo-preview") {
    this.model = model;
  }

  async *generateContentStream(prompt: string): AsyncIterable<string> {
    try {
      const stream = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        // Instruct OpenAI to return JSON
        response_format: { type: "json_object" },
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error("Error generating content from OpenAI:", error);
      throw new Error(
        `Failed to generate content from OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export const getOpenAIClient = (model?: string) => {
  return new OpenAIClient(model);
};
