// apps/demo/lib/rag/retrieval.ts
import { supabaseServerClient } from "../supabase/client";

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
  title: string; // Assuming we'll join with documents to get title
}

/**
 * Retrieves relevant document chunks from Supabase using vector similarity search.
 * @param embedding The query embedding to search for.
 * @param matchCount The maximum number of chunks to return (default: 5).
 * @param matchThreshold The minimum similarity threshold for a chunk to be returned (default: 0.75).
 * @returns A Promise that resolves to an array of relevant DocumentChunk objects.
 */
export async function retrieveDocumentChunks(
  embedding: number[],
  matchCount: number = 5,
  matchThreshold: number = 0.75,
): Promise<DocumentChunk[]> {
  try {
    const { data, error } = await supabaseServerClient
      .rpc("match_document_chunks", {
        query_embedding: embedding,
        match_count: matchCount,
        match_threshold: matchThreshold,
      })
      .select("id, document_id, content, similarity, documents!inner(title)"); // Join with documents to get title

    if (error) {
      console.error("Error retrieving document chunks from Supabase:", error);
      throw new Error(`Supabase RAG retrieval failed: ${error.message}`);
    }

    // Map the data to the DocumentChunk interface, extracting title from the joined table
    const documentChunks: DocumentChunk[] = data.map(
      (item: {
        id: string;
        document_id: string;
        content: string;
        similarity: number;
        documents: { title: string };
      }) => ({
        id: item.id,
        document_id: item.document_id,
        content: item.content,
        similarity: item.similarity,
        title: item.documents.title, // Access title from the joined 'documents' object
      }),
    );

    return documentChunks;
  } catch (error) {
    console.error("Error in retrieveDocumentChunks:", error);
    throw new Error(
      `Failed to retrieve document chunks: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
