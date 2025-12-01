// apps/demo/src/lib/rag/retrieval.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { retrieveDocumentChunks } from "./retrieval";
import { supabaseServerClient } from "../supabase/client";

// Mock the Supabase client
vi.mock("../supabase/client", () => ({
  supabaseServerClient: {
    rpc: vi.fn(() => ({
      select: vi.fn(() => ({})), // Mock select to return a chainable object
    })),
  },
}));

describe("retrieveDocumentChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call Supabase rpc with correct parameters and return formatted chunks", async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockMatchCount = 3;
    const mockMatchThreshold = 0.8;
    const mockSupabaseData = [
      {
        id: "1",
        document_id: "doc1",
        content: "chunk1",
        similarity: 0.9,
        documents: { title: "Doc Title 1" },
      },
      {
        id: "2",
        document_id: "doc2",
        content: "chunk2",
        similarity: 0.85,
        documents: { title: "Doc Title 2" },
      },
    ];

    (supabaseServerClient.rpc as vi.Mock).mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({ data: mockSupabaseData, error: null }),
    });

    const result = await retrieveDocumentChunks(
      mockEmbedding,
      mockMatchCount,
      mockMatchThreshold,
    );

    expect(supabaseServerClient.rpc).toHaveBeenCalledWith(
      "match_document_chunks",
      {
        query_embedding: mockEmbedding,
        match_count: mockMatchCount,
        match_threshold: mockMatchThreshold,
      },
    );

    expect(result).toEqual([
      {
        id: "1",
        document_id: "doc1",
        content: "chunk1",
        similarity: 0.9,
        title: "Doc Title 1",
      },
      {
        id: "2",
        document_id: "doc2",
        content: "chunk2",
        similarity: 0.85,
        title: "Doc Title 2",
      },
    ]);
  });

  it("should use default matchCount and matchThreshold if not provided", async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    (supabaseServerClient.rpc as vi.Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    await retrieveDocumentChunks(mockEmbedding);

    expect(supabaseServerClient.rpc).toHaveBeenCalledWith(
      "match_document_chunks",
      {
        query_embedding: mockEmbedding,
        match_count: 5, // Default
        match_threshold: 0.75, // Default
      },
    );
  });

  it("should throw an error if Supabase returns an error", async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockError = { message: "Supabase error" };

    (supabaseServerClient.rpc as vi.Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    await expect(retrieveDocumentChunks(mockEmbedding)).rejects.toThrow(
      `Supabase RAG retrieval failed: ${mockError.message}`,
    );
  });
});
