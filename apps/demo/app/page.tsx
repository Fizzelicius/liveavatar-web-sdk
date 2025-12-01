"use client";

import { useState } from "react";
import { ChatPanel } from "../src/components/ChatPanel";
import { AvatarPanel } from "../src/components/AvatarPanel";
import { InsightsPanel, Visualization } from "../src/components/InsightsPanel";

export default function Home() {
  const [currentVisualization, setCurrentVisualization] = useState<
    Visualization | undefined
  >(undefined);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [currentConfidence, setCurrentConfidence] = useState<
    number | undefined
  >(undefined);

  const handleNewResponse = (
    answer: string,
    visualization?: Visualization,
    confidence?: number,
    isLoading?: boolean,
    _sources?: unknown[], // sources not used directly here, but could be passed to InsightsPanel
  ) => {
    setIsInsightsLoading(isLoading || false);
    if (visualization) {
      setCurrentVisualization(visualization);
    }
    if (confidence !== undefined) {
      setCurrentConfidence(confidence);
    }
    // console.log("New Response in Page:", { answer, visualization, confidence, isLoading, sources });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 h-full w-full">
      {/* Left Panel: Chat */}
      <div className="md:col-span-1 h-full overflow-y-auto border-r border-gray-200">
        <ChatPanel onNewResponse={handleNewResponse} />
      </div>

      {/* Center Panel: Avatar */}
      <div className="md:col-span-2 h-full">
        <AvatarPanel />
      </div>

      {/* Right Panel: Insights */}
      <div className="md:col-span-1 h-full overflow-y-auto border-l border-gray-200">
        <InsightsPanel
          isLoading={isInsightsLoading}
          visualization={currentVisualization}
          confidence={currentConfidence}
        />
      </div>
    </div>
  );
}
