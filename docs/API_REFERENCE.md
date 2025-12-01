# API Reference: AI Data Narrator

This document provides a reference for the backend API endpoints of the AI Data Narrator application. The API is built using Next.js API Routes within the `apps/demo` package.

---

## Base URL

All API routes are prefixed with `/api`.

- **Development:** `http://localhost:3001/api`
- **Production:** `https://your-production-domain/api`

## Authentication

All endpoints that handle user data require a valid JWT from Supabase Auth. The token should be included in the `Authorization` header of the request.

**Header Format:**
`Authorization: Bearer <SUPABASE_JWT>`

---

## 1. Main Endpoint: `/narrate`

This is the primary endpoint for the application. It accepts a user query, orchestrates the RAG and AI processing, and streams back a structured JSON response.

- **Route:** `/api/narrate`
- **Method:** `POST`
- **Runtime:** Edge (for optimal streaming performance)

### 1.1. Request Body

The request body should be a JSON object containing the user's query.

**Shape:**

```json
{
  "query": "What was the revenue for the X-4 Chip in Q3, and what was its growth?",
  "chatHistory": [
    {
      "role": "user",
      "parts": [{ "text": "Previous user message" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Previous model response" }]
    }
  ]
}
```

| Field         | Type     | Required | Description                                                                                                 |
| :------------ | :------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| `query`       | `string` | `true`   | The current question from the user.                                                                         |
| `chatHistory` | `array`  | `false`  | An optional array of previous messages in the conversation, for maintaining context in follow-up questions. |

### 1.2. Response (Streaming)

The endpoint streams the response using Server-Sent Events (SSE). The response is a series of JSON objects, with the final message containing the complete data. Each event is a JSON string that can be parsed on the client.

**Content-Type:** `text/event-stream`

**Events Stream:**

Each message in the stream will be a JSON object that conforms to the schema defined in `PROMPT_ENGINEERING.md`. The `partial` flag indicates if the response is still in progress.

**Example Stream:**

```
data: {"answer":"The revenue for the X-4 Chip in Q3 was","visualization":{"type":"none"},"sources":[],"confidence":0,"partial":true}

data: {"answer":"The revenue for the X-4 Chip in Q3 was $50 million, an 18% increase year-over-year.","visualization":{"type":"none"},"sources":[],"confidence":0,"partial":true}

data: {"answer":"The revenue for the X-4 Chip in Q3 was $50 million, an 18% increase year-over-year.","visualization":{"type":"insight","insight":{"value":"18%","label":"YoY Growth"}},"sources":[{"source_id":"chunk-001","title":"Q3 2025 Earnings Call Transcript","text_span":"revenue increase to $50 million, up 18% year-over-year","similarity":0.92}],"confidence":0.95,"partial":false}
```

- The client listens to the stream and continuously updates the UI state with the incoming data.
- The `partial: true` flag can be used to show a typing indicator or smoothly render the text as it arrives.
- The final message with `partial: false` signifies the end of the stream and contains the complete, final data for the visualization and sources.

### 1.3. Error Handling

In case of an error, the server will send a JSON object with an `error` key.

**Example Error Response:**

```json
{
  "error": "An internal server error occurred.",
  "details": "Could not connect to the database."
}
```

| Status Code | Meaning               | Description                                                                                          |
| :---------- | :-------------------- | :--------------------------------------------------------------------------------------------------- |
| `400`       | Bad Request           | The request body is missing the `query` field or is otherwise malformed.                             |
| `401`       | Unauthorized          | The `Authorization` header is missing or the JWT is invalid.                                         |
| `429`       | Too Many Requests     | The user has exceeded the rate limit.                                                                |
| `500`       | Internal Server Error | A generic error occurred on the server (e.g., failed to call Gemini, could not connect to Supabase). |
| `503`       | Service Unavailable   | A third-party service (like Gemini or Supabase) is down or unresponsive.                             |

---

## 2. Other Potential Endpoints

_(This section can be expanded as new features are added.)_

- **/api/documents/upload**: `POST` - An endpoint for uploading new documents to Supabase Storage. This would handle authentication and trigger the processing pipeline.
- **/api/session/heygen**: `GET` - An endpoint to retrieve a new session token for the HeyGen avatar.
