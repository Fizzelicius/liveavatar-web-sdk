# Data Model: AI Data Narrator

This document details the database schema for the AI Data Narrator, hosted on Supabase. The schema is designed to support the storage, chunking, embedding, and efficient retrieval of documents for the RAG (Retrieval-Augmented Generation) system.

## Tools & Extensions

- **Database:** PostgreSQL 15+
- **Vector Store:** `pg_vector` extension for PostgreSQL.
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage

Before creating the tables, ensure the `vector` extension is enabled in your Supabase project:

```sql
-- Run this once in the Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 1. Table Schema

The data is organized into three main tables: `documents`, `document_chunks`, and `document_embeddings`. This normalized structure separates document metadata from its content and vector representations, which is efficient for storage and querying.

### 1.1. `documents`

Stores high-level metadata about each uploaded source document.

**Columns:**

| Column         | Type          | Constraints                                | Description                                                                                        |
| :------------- | :------------ | :----------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `id`           | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the document.                                                                |
| `title`        | `text`        | `NOT NULL`                                 | The display title of the document (e.g., "Q3 2025 Financial Report").                              |
| `mime_type`    | `text`        |                                            | The MIME type of the uploaded file (e.g., `application/pdf`, `text/plain`).                        |
| `pii_flag`     | `boolean`     | `NOT NULL`, `DEFAULT false`                | Flag indicating if the document was detected to contain Personally Identifiable Information (PII). |
| `uploader_id`  | `uuid`        | `REFERENCES auth.users(id)`                | Foreign key to the user who uploaded the document. Used for RLS policies.                          |
| `created_at`   | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Timestamp of when the document record was created.                                                 |
| `storage_path` | `text`        |                                            | The path to the raw file in Supabase Storage.                                                      |

### 1.2. `document_chunks`

Stores individual text chunks extracted from the documents. Chunking is necessary for the embedding model, which has a token limit.

**Columns:**

| Column        | Type          | Constraints                                              | Description                                                                  |
| :------------ | :------------ | :------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `id`          | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`               | Unique identifier for the chunk.                                             |
| `document_id` | `uuid`        | `NOT NULL`, `REFERENCES documents(id) ON DELETE CASCADE` | Foreign key to the parent document.                                          |
| `content`     | `text`        | `NOT NULL`                                               | The actual text content of the chunk.                                        |
| `chunk_index` | `integer`     | `NOT NULL`                                               | The 0-based index of the chunk within the document, for ordering.            |
| `char_range`  | `int4range`   |                                                          | The character start and end range of the chunk within the original document. |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                              | Timestamp of when the chunk was created.                                     |

### 1.3. `document_embeddings`

Stores the vector embeddings for each text chunk. This table is the foundation of the vector similarity search.

**Columns:**

| Column       | Type           | Constraints                                                              | Description                                                                                            |
| :----------- | :------------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `id`         | `uuid`         | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                               | Unique identifier for the embedding record.                                                            |
| `chunk_id`   | `uuid`         | `NOT NULL`, `UNIQUE`, `REFERENCES document_chunks(id) ON DELETE CASCADE` | Foreign key to the corresponding document chunk. Ensures one embedding per chunk.                      |
| `embedding`  | `vector(1536)` | `NOT NULL`                                                               | The vector embedding of the chunk's content. The dimension (e.g., 1536) must match the model's output. |
| `created_at` | `timestamptz`  | `NOT NULL`, `DEFAULT now()`                                              | Timestamp of when the embedding was generated.                                                         |

---

## 2. SQL Schema Definition

Below is the complete SQL script to create the tables and relationships. This can be run in the Supabase SQL Editor.

```sql
-- 1. Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  mime_type TEXT,
  pii_flag BOOLEAN NOT NULL DEFAULT false,
  uploader_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  storage_path TEXT
);

-- 2. Document Chunks Table
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  char_range INT4RANGE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Document Embeddings Table
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL UNIQUE REFERENCES document_chunks(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL, -- Ensure dimension matches your embedding model
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. Vector Index & Search Function

For fast similarity searches, we need to create an index on the `embedding` column and a function to perform the search.

### Index

An IVFFlat index is a good choice for a balance of speed and accuracy. The `lists` parameter should be chosen based on the number of rows (a common rule of thumb is `sqrt(number_of_rows)`).

```sql
-- Create an IVFFlat index on the embeddings table
-- This should be run AFTER you have populated the table with some data
CREATE INDEX ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); -- Adjust 'lists' based on the size of your dataset
```

### Search Function

This function will take a query embedding and return the `k` most similar document chunks.

```sql
-- Function to search for similar document chunks
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM
    document_embeddings de
  JOIN
    document_chunks dc ON de.chunk_id = dc.id
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 4. Row-Level Security (RLS) Policies

RLS is critical for ensuring users can only access documents they are permitted to.

```sql
-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies: Users can only see their own documents and related chunks/embeddings
CREATE POLICY "Allow select on own documents"
ON documents FOR SELECT
USING (auth.uid() = uploader_id);

CREATE POLICY "Allow select on chunks of own documents"
ON document_chunks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_chunks.document_id
      AND documents.uploader_id = auth.uid()
  )
);

CREATE POLICY "Allow select on embeddings of own document chunks"
ON document_embeddings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE dc.id = document_embeddings.chunk_id
      AND d.uploader_id = auth.uid()
  )
);

-- Note: You will also need policies for INSERT, UPDATE, DELETE as required
-- by your application's data management features. For a read-only system,
-- SELECT is sufficient for the query pipeline.
```
