// apps/demo/vitest.setup.ts
// This file can be used to set up global mocks or configurations for Vitest.
// For example:
// import '@testing-library/jest-dom';
// import { beforeAll, afterEach, afterAll } from 'vitest';
// import { cleanup } from '@testing-library/react';

// afterEach(() => {
//   cleanup();
// });

// Global mock for process.env in tests
import { vi } from "vitest";

// Mock environment variables for testing purposes
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://mock.supabase.url");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "mock_supabase_anon_key");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "mock_supabase_service_role_key");
vi.stubEnv("GEMINI_API_KEY", "mock_gemini_api_key");
vi.stubEnv("OPENAI_API_KEY", "mock_openai_api_key");
vi.stubEnv("NEXT_PUBLIC_HEYGEN_API_URL", "http://mock.heygen.api.url");
vi.stubEnv("HEYGEN_API_KEY", "mock_heygen_api_key");
vi.stubEnv("HEYGEN_API_SECRET", "mock_heygen_api_secret");
vi.stubEnv("LLM_PROVIDER", "openai"); // Default to openai for tests
