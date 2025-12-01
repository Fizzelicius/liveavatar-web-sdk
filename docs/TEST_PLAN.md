# Test Plan: AI Data Narrator

This document outlines the testing strategy for the AI Data Narrator application. The goal is to ensure the application is reliable, secure, performant, and provides an excellent user experience. Our testing approach is layered, covering everything from individual functions to the complete end-to-end user flow.

## 1. Testing Frameworks & Tools

- **Unit & Integration Testing:** [Vitest](https://vitest.dev/) will be used as it integrates well with the existing Vite-based tooling in the monorepo. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) will be used for testing React components.
- **End-to-End (E2E) Testing:** [Playwright](https://playwright.dev/) will be used for E2E testing. It provides robust automation across modern browsers and has excellent features for handling dynamic, real-time web applications.
- **CI/CD:** All tests will be run automatically on every pull request and merge to the main branch using GitHub Actions.

---

## 2. Unit Testing

**Scope:** Individual functions and React components in isolation.
**Location:** `*.test.ts` or `*.test.tsx` files co-located with the source files.

### Backend (`apps/demo/src/lib` and `/api`)

| Component/Function          | Test Cases                                                                                                                                                                                                                                                                                           |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RAG Query Logic**         | - Given a query embedding, verify that the `match_document_chunks` function is called with the correct parameters.<br>- Mock the Supabase client to return a set of document chunks; ensure the logic correctly formats them as context.<br>- Test with an empty context returned from the database. |
| **Prompt Construction**     | - Ensure the master prompt is correctly assembled with the user query and retrieved context.<br>- Test that special characters in the user query are handled correctly.                                                                                                                              |
| **PII Redaction**           | - Test with text containing common PII (names, emails, phone numbers) and verify that it is correctly redacted.<br>- Test with text containing no PII and ensure it remains unchanged.                                                                                                               |
| **API Response Validation** | - Test the logic that validates the JSON response from Gemini against the strict schema.<br>- Test how the system handles an invalid or malformed JSON response from the LLM.                                                                                                                        |

### Frontend (`apps/demo/src/components`)

| Component            | Test Cases                                                                                                                                                                                                                                                        |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ChatPanel`**      | - Render the component and simulate a user typing and submitting a message.<br>- Verify that the `onSubmit` function is called with the correct query.<br>- Test that chat history is displayed correctly.                                                        |
| **`InsightsPanel`**  | - Test that the correct chart type (`bar`, `line`, `pie`) is rendered based on the API response.<br>- Test that the "Insight" number component is displayed for insight visualizations.<br>- Test that nothing is rendered when the visualization type is `none`. |
| **Chart Components** | - Test that charts render correctly with mock data.<br>- Ensure charts are responsive.                                                                                                                                                                            |

---

## 3. Integration Testing

**Scope:** Testing the interaction between different parts of the application, such as a component and an API endpoint.

| Scenario                          | Test Steps                                                                                                                                                                                                                                                                                                                                                                                                         |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Endpoint (`/api/narrate`)** | - Send a `POST` request to the `/api/narrate` endpoint with a mock query.<br>- Mock the Supabase, Gemini, and HeyGen clients to test the orchestration logic in isolation.<br>- Verify that the streamed response is a valid SSE stream and the final JSON is correct.<br>- Test error handling by mocking a failure in one of the downstream services and asserting that the correct HTTP error code is returned. |
| **Component to API**              | - Test a React component that fetches data (e.g., via a custom hook) by mocking the `fetch` API.<br>- Ensure the component correctly handles loading, success, and error states based on the mock API response.                                                                                                                                                                                                    |

---

## 4. End-to-End (E2E) Testing

**Scope:** Full user journeys simulated in a real browser using Playwright.
**Location:** A separate `e2e` or `tests` directory at the `apps/demo` level.

### Key User Journeys

1.  **Successful Q&A with Chart:**
    - Launch the application.
    - Type a question that is known to produce a chart visualization.
    - Submit the question.
    - **Assert:** A streaming text answer appears in the chat panel.
    - **Assert:** A chart visualization appears in the insights panel.
    - **Assert:** The HeyGen avatar starts playing and speaking.
    - **Assert:** Source citations are displayed correctly.

2.  **Low-Confidence Query:**
    - Type a vague or nonsensical question.
    - Submit the question.
    - **Assert:** The "Low confidence" message appears in the chat panel.
    - **Assert:** No visualization is rendered in the insights panel.

3.  **Rate Limiting:**
    - Rapidly send multiple queries in a loop.
    - **Assert:** After a certain number of requests, an error message is displayed indicating that the rate limit has been exceeded.

4.  **Input Validation:**
    - Attempt to submit an empty query.
    - **Assert:** The UI prevents the submission or shows a user-friendly message.

---

## 5. QA Validation Checklist (Manual & Automated)

This checklist corresponds to the high-level requirements from the project brief.

| Category          | Item                                        | Validation Method                                                |
| :---------------- | :------------------------------------------ | :--------------------------------------------------------------- |
| **Functional**    | Chat → response → visualization flow        | E2E Test #1                                                      |
|                   | STT & TTS flow                              | Manual Test (if STT/TTS is implemented)                          |
|                   | HeyGen fallback (avatar offline → TTS only) | Manual Test / E2E test with mocked HeyGen failure                |
| **Data Accuracy** | Visualization numbers match extracted data  | E2E Test & Manual verification                                   |
|                   | Sources include text spans and similarity   | E2E Test #1                                                      |
| **Security**      | No keys leaked to frontend                  | Inspect browser network traffic in E2E tests for any secrets.    |
|                   | PII redaction pipeline works                | Unit Test                                                        |
|                   | RLS policies applied                        | Integration Test (attempt to query data for another user)        |
| **Performance**   | 95th percentile latency target specified    | Load testing (e.g., using k6) against a staging environment.     |
|                   | Streaming works correctly                   | E2E Test #1                                                      |
| **Resilience**    | Supabase down → degrade gracefully          | Integration Test (mock Supabase client to throw an error)        |
|                   | Gemini down → cached results/error message  | Integration Test (mock Gemini client to throw an error)          |
| **Accessibility** | ARIA labels present                         | E2E tests with accessibility checks (`@axe-core/playwright`).    |
|                   | Keyboard navigation                         | Manual Test & E2E tests simulating keyboard inputs (tab, enter). |
|                   | High contrast mode                          | Manual Test (if implemented).                                    |
