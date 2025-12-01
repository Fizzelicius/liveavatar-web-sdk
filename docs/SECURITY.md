# Security Overview: AI Data Narrator

This document outlines the security architecture and best practices implemented in the AI Data Narrator application. The system is designed with a defense-in-depth approach to protect data, manage access, and mitigate threats.

---

## 1. Authentication & Authorization

- **Authentication:** User authentication is handled by Supabase Auth. It provides secure user registration, login, and management. All communication with Supabase Auth endpoints is over HTTPS.
- **Authorization:** Access to data is governed by a robust authorization model enforced at the database level using PostgreSQL's Row-Level Security (RLS).
  - **RLS Policies:** As detailed in `DATA_MODEL.md`, RLS policies ensure that users can only access the `documents` they have uploaded and the associated `document_chunks` and `document_embeddings`.
  - **Role-Based Access Control (RBAC):** While the initial implementation relies on ownership (`uploader_id`), the schema can be extended to support more complex RBAC by adding roles and permissions tables if required.

## 2. Data Security & Privacy

### 2.1. PII Detection and Redaction

- **Objective:** To prevent Personally Identifiable Information (PII) from being stored in the vector database or sent to the Gemini large language model.
- **Implementation:**
  1.  **Pipeline Integration:** A PII detection and redaction step is integrated into the document processing pipeline. Before a document chunk is sent to the embedding model, its content is scanned.
  2.  **Tooling:** A dedicated library (e.g., Google's DLP API, or an open-source NLP library like `presidio`) will be used to identify PII entities such as names, addresses, phone numbers, and financial information.
  3.  **Redaction:** Detected PII is either masked (e.g., `[REDACTED_PERSON]`) or replaced with a placeholder.
  4.  **Flagging:** Documents from which PII was redacted are marked with `pii_flag = true` in the `documents` table for auditing purposes.

### 2.2. Data in Transit

- **HTTPS/TLS:** All communication between the client (browser), the Next.js backend, and third-party APIs (Supabase, Gemini, HeyGen) is encrypted using HTTPS/TLS. This is standard for Next.js and Supabase.
- **Secure WebSockets:** Communication with the HeyGen avatar platform uses the secure WebSocket protocol (`wss://`).

### 2.3. Data at Rest

- **Supabase:** Supabase provides encryption at rest for all data stored in its PostgreSQL database and Storage buckets.
- **Environment Variables:** No sensitive data (e.g., connection strings, API keys) is stored in the database.

## 3. API & Application Security

### 3.1. API Key Management

- **Environment Variables:** All API keys, database URLs, and other secrets are managed exclusively through environment variables on the Next.js server.
- **No Frontend Exposure:** Secrets are loaded on the server-side (`process.env`) and are never exposed to the client-side browser. The frontend communicates with our own backend API (`/api/narrate`), which then securely uses these keys to communicate with other services.
- **`.env.local.template`:** A template file (`.env.local.template`) is provided in `apps/demo` to list all required environment variables, ensuring developers know what secrets are needed without exposing any values in the repository.

### 3.2. Input Sanitization and Output Escaping

- **Input Sanitization:** All user-provided input (e.g., chat messages) is sanitized on the backend before being processed or stored. This helps prevent Cross-Site Scripting (XSS) and other injection attacks.
- **Output Escaping:** Data rendered in the React frontend is automatically escaped by the framework, mitigating the risk of XSS attacks from data returned by the API.

### 3.3. Rate Limiting

- **Objective:** To prevent abuse and ensure service availability for all users.
- **Implementation:** A rate-limiting middleware is applied to the primary `/api/narrate` endpoint.
  - **Strategy:** A token bucket algorithm (e.g., using a library like `upstash/ratelimit`) is used, allowing for a certain number of requests per user over a given time window.
  - **User Identification:** Rate limits are applied on a per-user basis, identified by their authenticated user ID or IP address for anonymous users.

### 3.4. CORS

- **Configuration:** Cross-Origin Resource Sharing (CORS) policies are configured in Next.js to restrict which domains can access the API endpoints. By default, only the application's own domain is allowed.

## 4. Logging and Monitoring

- **Audit Logging:** A logging system is in place to record key events for security and debugging purposes.
- **No Sensitive Data in Logs:** Logs are configured to **never** record sensitive information. This includes:
  - User-provided chat content
  - API keys or secrets
  - PII
- **Logged Events:** Examples of logged events include user logins, document uploads, API errors, and rate-limit triggers.
- **Monitoring:** The application's health, performance, and error rates are monitored using a service like Vercel Analytics or a third-party observability platform.

## 5. User Consent

- **HeyGen Avatar Usage:** Before the HeyGen avatar is activated for the first time, the user is presented with a clear and explicit consent dialog.
- **Consent Text:** The dialog informs the user that their text input will be processed to generate spoken audio and a corresponding avatar video.
- **Persistence:** The user's consent choice is stored to avoid showing the dialog on subsequent visits.
