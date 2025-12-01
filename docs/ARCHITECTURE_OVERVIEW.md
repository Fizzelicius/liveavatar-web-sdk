# Architecture Overview: AI Data Narrator

This document outlines the architecture of the AI Data Narrator application, which is integrated into the `apps/demo` package of the `liveavatar-web-sdk` monorepo.

## Guiding Principles

- **Modular & Scalable:** Components are designed to be modular and decoupled, facilitating independent development, testing, and scaling.
- **Enterprise-Grade Security:** Security is a primary concern, with measures implemented at every layer of the stack, from the database to the frontend.
- **Real-time & Responsive:** The user experience is designed to be real-time and interactive, with low latency and responsive UI updates.
- **Convention-over-Configuration:** The architecture leverages the existing structure of the Next.js and `pnpm` workspace, following best practices.

## System Components

The application is comprised of several key components working in concert:

1.  **Frontend (Next.js App):** The user-facing interface located in `apps/demo`.
2.  **Backend (Next.js API Routes):** A set of serverless functions that orchestrate the application's core logic.
3.  **Database & RAG (Supabase):** The data persistence layer, responsible for storing documents, metadata, and vector embeddings for Retrieval-Augmented Generation.
4.  **AI Engine (Google Gemini):** The core intelligence, responsible for understanding queries, generating answers, and creating data visualizations.
5.  **Avatar Platform (HeyGen):** Provides the real-time AI avatar that speaks the generated responses.

---

## 1. Frontend Architecture (`apps/demo`)

The frontend is a Next.js 15 application using the App Router, TypeScript, and TailwindCSS.

### UI Layout

The UI is structured into a responsive three-panel layout:

- **Left Panel (`ChatPanel`):** Displays the conversation history, user input field (text and voice), and typing indicators.
- **Center Panel (`AvatarPanel`):** Renders the HeyGen avatar video stream. Handles avatar state (e.g., loading, speaking, idle).
- **Right Panel (`InsightsPanel`):** A dynamic area that renders visualizations (`charts`, `insights`) returned from the Gemini API.

### Key Components (`apps/demo/src/components`)

- `ChatPanel.tsx`: Manages chat state, user input, and message display.
- `AvatarPanel.tsx`: Integrates with the HeyGen Web SDK.
- `InsightsPanel.tsx`: Conditionally renders child components based on the `visualization` object from the API.
- `charts/BarChart.tsx`, `charts/LineChart.tsx`, `charts/PieChart.tsx`: Reusable chart components built with `Recharts` or `Chart.js`.
- `insights/InsightNumber.tsx`: Displays a single, large metric.

### State Management

- **UI State:** Managed locally within components or through React Context for shared state (e.g., theme, user settings).
- **Server State:** Managed via custom hooks that wrap `fetch` calls to the backend API. Libraries like `SWR` or `React Query` may be used to handle caching, revalidation, and streaming data.

---

## 2. Backend Architecture (Next.js API Routes)

The backend logic resides in `apps/demo/src/app/api`.

### Main Endpoint: `/api/narrate`

- **Method:** `POST`
- **Streaming:** Uses Server-Sent Events (SSE) to stream the JSON response object as it's being constructed. This allows the UI to update progressively.
- **Orchestration Flow:**
  1.  **Input:** Receives a user query (text or transcribed voice).
  2.  **Sanitization:** The input is sanitized to prevent injection attacks.
  3.  **PII Redaction:** The query is scanned for PII, which is redacted before being sent to the RAG system.
  4.  **RAG Query:** The sanitized query is converted to an embedding and used to search for relevant document chunks in Supabase (vector search).
  5.  **Prompt Construction:** A detailed prompt is constructed for Gemini, including the user query and the retrieved context from the RAG.
  6.  **Gemini Call:** The prompt is sent to the Gemini API. The model is instructed to return a JSON object matching the strict schema.
  7.  **Response Streaming:** As Gemini streams back the response, the backend validates and forwards the JSON object in chunks via SSE.
  8.  **HeyGen Task (Parallel):** Once the `answer` text is available, a request is sent to the HeyGen API to generate the avatar video stream. The video stream URL or session data is sent to the frontend.

### Supporting Libraries (`apps/demo/src/lib`)

- `supabase/client.ts`: Initializes and exports a singleton Supabase client.
- `gemini/client.ts`: A client for interacting with the Google Gemini API, including prompt construction and response parsing.
- `heygen/client.ts`: A client for the HeyGen API.
- `rag.ts`: Contains the core RAG logic (embedding generation, Supabase query, context formatting).

---

## 3. Data & RAG Architecture (Supabase)

Supabase provides the database, vector store, and authentication.

### Data Model

- **`documents`:** Stores metadata about uploaded files (e.g., `title`, `mime_type`, `uploader_id`).
- **`chunks`:** Stores processed text chunks from the documents. Includes a foreign key to the `documents` table.
- **`embeddings`:** Stores vector embeddings for each chunk, generated by a Google embedding model. A vector index (`ivfflat` or `hnsw`) is used for efficient similarity searches.

_(See `DATA_MODEL.md` for the full schema)._

### Data Flow

1.  **Upload:** Documents are uploaded to Supabase Storage.
2.  **Processing:** A Supabase Function (or a separate process) is triggered on upload. It parses the document, splits it into chunks, and redacts PII.
3.  **Embedding:** Each chunk is sent to a Gemini embedding model.
4.  **Storage:** The chunks and their corresponding embeddings are stored in the Supabase tables.

### Security (RLS)

Row-Level Security (RLS) policies are enforced on all tables to ensure data isolation and prevent unauthorized access.

---

## 4. Real-time Communication

- **Client-to-Server:** Standard HTTPS requests (`POST /api/narrate`).
- **Server-to-Client:** Server-Sent Events (SSE) are used to push data from the backend to the frontend. This is a one-way channel that is ideal for streaming the Gemini response without the complexity of WebSockets. The `Edge` runtime is preferred for the API route to enable efficient streaming.

---

## 5. Authentication & Authorization

- If user-specific data is required, Supabase Auth will be used.
- API keys for external services (Gemini, HeyGen) are stored securely in environment variables and are only accessed by the backend.
- RLS policies in Supabase control data access based on the authenticated user's role or ID.
