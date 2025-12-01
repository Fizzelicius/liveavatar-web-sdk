import { NextRequest, NextResponse } from "next/server";
import { getRagContext } from "../../lib/rag/rag_service";
import { getLlmClient } from "../../lib/llm";

// Opt-in to the edge runtime for streaming.
export const runtime = "edge";

// Define the expected JSON schema as a string.
// This is used to instruct the LLM to return structured data.
const JSON_SCHEMA = `
{
  "type": "object",
  "required": ["answer", "visualization", "sources", "confidence"],
  "properties": {
    "answer": { "type": "string" },
    "visualization": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "enum": ["chart", "insight", "none"] },
        "chart": {
          "type": "object",
          "properties": {
            "type": { "enum": ["bar", "line", "pie"] },
            "labels": { "type": "array", "items": { "type": "string" } },
            "data": { "type": "array", "items": { "type": "number" } },
            "title": { "type": "string" }
          }
        },
        "insight": {
          "type": "object",
          "properties": { "value": { "type": "string" }, "label": { "type": "string" } }
        }
      }
    },
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "source_id": { "type": "string" },
          "title": { "type": "string" },
          "text_span": { "type": "string" },
          "similarity": { "type": "number" }
        }
      }
    },
    "confidence": { "type": "number" },
    "partial": { "type": "boolean" }
  }
}
`;

/**
 * The main API endpoint for the AI Data Narrator.
 * It accepts a user query, orchestrates RAG and AI processing,
 * and streams back a structured JSON response via Server-Sent Events (SSE).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, chatHistory: _chatHistory } = body; // chatHistory is not used yet but kept for context

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Get the appropriate LLM client (OpenAI or Gemini) based on environment variables
    const llmClient = getLlmClient();

    // Perform RAG to get relevant context
    const { formattedContext } = await getRagContext(query);

    // Construct the prompt for the LLM
    const fullPrompt = `
      You are an expert financial analyst and data visualization specialist. Your task is to answer a user's question based *only* on the provided context. You must return a single, valid JSON object that conforms to the schema below. Do not add any explanatory text or markdown formatting before or after the JSON object.

      **JSON Schema:**
      <SCHEMA>
      ${JSON_SCHEMA}
      </SCHEMA>

      **Context:**
      Here are the relevant data snippets. Base your answer entirely on these.
      <CONTEXT>
      ${formattedContext}
      </CONTEXT>

      **Rules & Guidelines:**
      1.  **Analyze the Data:** If the context contains numerical data relevant to the user's question, create a visualization.
          -   Use a "bar" chart for comparisons.
          -   Use a "line" chart for trends.
          -   Use a "pie" chart for composition.
          -   Use an "insight" for a single, powerful number.
          -   If no numerical data is relevant, set the visualization type to "none".
      2.  **Answer Succinctly:** Formulate a concise, human-readable answer in the "answer" field.
      3.  **Cite Sources:** In the "sources" array, include an entry for each context snippet used. The 'source_id' must map to the 'id' of the chunk in the provided context.
      4.  **Assess Confidence:** Provide a score from 0.0 to 1.0 for your confidence in the answer. If confidence is below 0.6, the answer should be a request for clarification, and the visualization type must be "none".

      **User Question:**
      <USER_QUESTION>
      ${query}
      </USER_QUESTION>
    `;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendData = (data: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}

`),
          );
        };

        let accumulatedContent = "";

        try {
          const llmStream = llmClient.generateContentStream(fullPrompt);

          for await (const chunk of llmStream) {
            accumulatedContent += chunk;
          }

          // At this point, `accumulatedContent` should be a complete JSON string.
          // In a real-world scenario with more complex streaming, you might parse
          // the stream chunk-by-chunk to provide partial updates to the UI.
          // For simplicity here, we wait for the full response and then send it.

          // Attempt to parse the final accumulated content.
          const finalParsed = JSON.parse(accumulatedContent);
          sendData({ ...finalParsed, partial: false });
        } catch (llmError) {
          console.error("[LLM Stream Error]", llmError);
          sendData({
            error: "Failed to get response from AI model.",
            details: (llmError as Error).message,
            partial: false,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Narrate API Error]", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "An internal server error occurred", details: errorMessage },
      { status: 500 },
    );
  }
}
