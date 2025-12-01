// apps/demo/lib/rag/rag_service.ts
import { generateEmbedding } from "../llm/gemini/client";
import { retrieveDocumentChunks, DocumentChunk } from "./retrieval";
import { redactPii } from "./pii";

/**
 * Orchestrates the RAG (Retrieval-Augmented Generation) process.
 * This includes PII redaction, embedding generation, document retrieval,
 * and formatting the context for the LLM.
 */
export async function getRagContext(
  query: string,
  options?: {
    matchCount?: number;
    matchThreshold?: number;
  },
): Promise<{ context: DocumentChunk[]; formattedContext: string }> {
  // 1. Redact PII from the user query
  const cleanedQuery = await redactPii(query);

  // 2. Generate embedding for the cleaned query
  const queryEmbedding = await generateEmbedding(cleanedQuery);

  // 3. Retrieve relevant document chunks from Supabase
  const retrievedChunks = await retrieveDocumentChunks(
    queryEmbedding,
    options?.matchCount,
    options?.matchThreshold,
  );

  // 4. Format the retrieved chunks into a string suitable for the LLM prompt
  const formattedContext = formatChunksForPrompt(retrievedChunks);

  return {
    context: retrievedChunks,
    formattedContext: formattedContext,
  };
}

/**
 * Formats the retrieved document chunks into a string that can be inserted
 * directly into the LLM prompt.
 * @param chunks An array of DocumentChunk objects.
 * @returns A string representing the formatted context.
 */
function formatChunksForPrompt(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context found.";
  }

  // Example formatting: JSON array of objects.
  // This format makes it easy for the LLM to parse and refer to sources.
  return JSON.stringify(
    chunks.map((chunk) => ({
      id: chunk.id,
      document_id: chunk.document_id, // Including document_id for source linking
      document_title: chunk.title,
      text: chunk.content,
    })),
    null,
    2,
  );
}
