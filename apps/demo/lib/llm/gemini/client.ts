// apps/demo/lib/llm/gemini/client.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMClient } from "../types";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error(
    "GEMINI_API_KEY environment variable is not set. Please check your .env.local file.",
  );
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

class GeminiClient implements LLMClient {
  private model: string;
  private embeddingModel: string;

  constructor(
    model: string = "gemini-pro",
    embeddingModel: string = "embedding-001",
  ) {
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  async *generateContentStream(prompt: string): AsyncIterable<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          responseMimeType: "application/json", // Instruct Gemini to return JSON
        },
      });

      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error("Error generating content from Gemini:", error);
      throw new Error(
        `Failed to generate content from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = genAI.getGenerativeModel({ model: this.embeddingModel });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      if (!embedding) {
        throw new Error(
          "Failed to generate embedding: embedding values are null or undefined.",
        );
      }

      return embedding;
    } catch (error) {
      console.error("Error generating embedding from Gemini:", error);
      throw new Error(
        `Failed to generate embedding from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export const getGeminiClient = (model?: string, embeddingModel?: string) => {
  return new GeminiClient(model, embeddingModel);
};

// Also export a standalone embedding function for convenience, which uses the client internally
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = new GeminiClient();
  return client.generateEmbedding(text);
}
