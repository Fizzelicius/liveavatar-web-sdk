# Prompt Engineering Guide: AI Data Narrator

This document outlines the strategies and structure for the prompts sent to the Google Gemini model. Effective prompt engineering is critical for ensuring the model's responses are accurate, relevant, and strictly adhere to the required JSON output schema.

## 1. Core Objectives of the Prompt

The master prompt is designed to achieve the following:

1.  **Strict JSON Output:** Force the model to generate a response that validates against a specific JSON schema. This is non-negotiable for system stability.
2.  **Contextual Grounding:** Ensure the model's answer is based _only_ on the provided document chunks (the context) from the RAG system.
3.  **Data Analysis & Visualization:** Instruct the model to analyze the context for numerical data and decide on an appropriate visualization (chart, insight, or none).
4.  **Source Attribution:** Require the model to cite the sources it used from the context.
5.  **Confidence Scoring:** Compel the model to self-evaluate and provide a confidence score for its answer.

---

## 2. Master Prompt Structure

The prompt is constructed from several dynamic parts. Below is a template illustrating the structure.

```
You are an expert financial analyst and data visualization specialist. Your task is to answer a user's question based *only* on the provided context. You must return a single, valid JSON object and nothing else. Do not add any explanatory text before or after the JSON object.

**JSON Schema:**
Your output MUST strictly conform to the following JSON schema. Do not deviate from this structure.
<SCHEMA>
{
  "type": "object",
  "required": ["answer", "visualization", "sources", "confidence", "partial"],
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
</SCHEMA>

**Context:**
Here are the relevant data snippets. Base your answer entirely on these.
<CONTEXT>
[
  {
    "id": "chunk-001",
    "document_title": "Q3 2025 Earnings Call Transcript",
    "text": "In the third quarter, our flagship product, the X-4 Chip, saw a revenue increase to $50 million, up 18% year-over-year. The European market contributed $30 million of this total."
  },
  {
    "id": "chunk-002",
    "document_title": "Q3 2025 Financial Report",
    "text": "Total revenue for Q3 was $120 million. The semiconductor division, led by the X-4 Chip, accounted for 41.6% of this total revenue."
  },
  ...
]
</CONTEXT>

**Rules & Guidelines:**
1.  **Analyze the Data:** If the context contains numerical data relevant to the user's question, create a visualization.
    -   Use a "bar" chart for comparisons (e.g., revenue by product).
    -   Use a "line" chart for trends over time.
    -   Use a "pie" chart for composition (e.g., market share).
    -   Use an "insight" for a single, powerful number (e.g., "18% growth").
    -   If no numerical data is relevant, or if you cannot create a meaningful visualization, set the visualization type to "none".
2.  **Answer Succinctly:** Formulate a concise, human-readable answer in the "answer" field.
3.  **Cite Sources:** In the "sources" array, you MUST include an entry for each context snippet you used to formulate the answer. Include a short "text_span" that is directly relevant.
4.  **Assess Confidence:** In the "confidence" field, provide a score from 0.0 to 1.0 representing your confidence that the answer is accurate and complete based on the provided context.
    -   If confidence is below 0.6, the answer should be a request for clarification, and the visualization type should be "none".
5.  **Partial Flag:** Set "partial" to `true` if you are streaming the response and it is not yet complete. Set it to `false` for the final message.

**User Question:**
<USER_QUESTION>
What was the revenue for the X-4 Chip in Q3, and what was its growth?
</USER_QUESTION>
```

---

## 3. Key Prompting Techniques

### 3.1. Role-Playing

The prompt begins with "You are an expert financial analyst and data visualization specialist." This puts the model in a specific role, which primes it to perform the requested tasks with a higher degree of quality and relevance.

### 3.2. Zero-Shot CoT (Chain-of-Thought)

By providing a structured set of rules and guidelines, we are implicitly asking the model to "think step-by-step." It must first analyze the data, then decide on a visualization, then formulate an answer, and so on. This structured thinking process leads to more reliable and logical outputs.

### 3.3. Schema Enforcement

The JSON schema is provided directly in the prompt. This is a powerful technique to force the model's output into a desired format. The instruction "Your output MUST strictly conform..." is a direct command that reduces the likelihood of deviation.

### 3.4. Grounding Instructions

The phrase "based _only_ on the provided context" is repeated to prevent the model from hallucinating or using its general knowledge. This is the core principle of a reliable RAG system.

## 4. Handling Low Confidence

The rules explicitly state how to handle low confidence scenarios (< 0.6). This is a critical guardrail. Instead of providing a potentially incorrect answer, the system is instructed to default to a safe response, ask for clarification, and refuse to generate a visualization. This builds user trust and improves system robustness.
