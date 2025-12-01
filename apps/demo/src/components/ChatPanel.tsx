"use client";

import React, { useState, useRef } from "react";
import { useHeyGenSession } from "../liveavatar/useHeyGenSession";
import { Visualization } from "./InsightsPanel"; // Import Visualization type

// Placeholder type for a chat message
type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
};

// Placeholder data for demonstration
const initialMessages: Message[] = [
  { id: 1, role: "bot", text: "Hello! Ask me a question about your data." },
];

interface ChatPanelProps {
  onNewResponse: (
    answer: string,
    visualization?: Visualization,
    confidence?: number,
    isLoading?: boolean,
    _sources?: unknown[],
  ) => void;
}

export const ChatPanel = ({ onNewResponse }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentBotMessageRef = useRef<number | null>(null);

  const { messageAvatar, hasConsent } = useHeyGenSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userQuery = inputValue;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: userQuery,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add a placeholder bot message
    const newBotMessageId = Date.now() + 1;
    currentBotMessageRef.current = newBotMessageId;
    setMessages((prev) => [
      ...prev,
      { id: newBotMessageId, role: "bot", text: "..." },
    ]);

    setInputValue("");
    setIsLoading(true);
    onNewResponse("", undefined, undefined, true); // Indicate loading state for insights

    try {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok || !response.body) {
        throw new Error(response.statusText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedChunks = "";
      let accumulatedAnswer = "";
      let fullVisualization: Visualization | undefined = undefined;
      let finalConfidence: number | undefined = undefined;
      let finalSources: unknown[] | undefined = undefined; // Changed from any[]

      // Reset bot message text for streaming
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentBotMessageRef.current ? { ...msg, text: "" } : msg,
        ),
      );

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        accumulatedChunks += decoder.decode(value, { stream: true });

        // Process each complete SSE 'data:' line
        const lines = accumulatedChunks.split("\n\n");
        accumulatedChunks = lines.pop() || ""; // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonString = line.substring(5).trim();
              const parsedData = JSON.parse(jsonString);

              // Update accumulated answer and visualization
              if (parsedData.answer) {
                accumulatedAnswer = parsedData.answer;
              }
              if (parsedData.visualization) {
                fullVisualization = parsedData.visualization;
              }
              if (parsedData.confidence) {
                finalConfidence = parsedData.confidence;
              }
              if (parsedData.sources) {
                finalSources = parsedData.sources;
              }

              // Update the latest bot message with streaming text
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === currentBotMessageRef.current
                    ? { ...msg, text: accumulatedAnswer }
                    : msg,
                ),
              );

              // Update insights panel with partial data
              onNewResponse(
                accumulatedAnswer,
                fullVisualization,
                finalConfidence,
                parsedData.partial,
                finalSources,
              );
            } catch (error) {
              console.error("Error parsing SSE data:", error);
            }
          }
        }
      }

      // After streaming, make the avatar speak if consent is given
      if (hasConsent && accumulatedAnswer) {
        messageAvatar(accumulatedAnswer);
      }
    } catch (error) {
      console.error("API call failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentBotMessageRef.current
            ? { ...msg, text: `Error: ${errorMessage}` } // Use errorMessage here
            : msg,
        ),
      );
      onNewResponse(
        `Error: ${errorMessage}`, // Use errorMessage here
        undefined,
        undefined,
        false,
      );
    } finally {
      setIsLoading(false);
      currentBotMessageRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-panel p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-chat-user text-chat-userText"
                  : "bg-chat-bot text-chat-botText"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? "Thinking..." : "Type your question..."}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-background-light text-text-default"
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
};
