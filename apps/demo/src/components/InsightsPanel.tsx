"use client";

import React from "react";
import { BarChart, LineChart, PieChart, InsightNumber } from "./charts";

// Placeholder type for the visualization data from the API
export type Visualization = {
  type: "chart" | "insight" | "none";
  chart?: {
    type: "bar" | "line" | "pie";
    title: string;
    labels: string[];
    data: number[];
  };
  insight?: {
    value: string;
    label: string;
  };
};

interface InsightsPanelProps {
  visualization?: Visualization;
  isLoading: boolean;
  confidence?: number;
}

export const InsightsPanel = ({
  visualization,
  isLoading,
  confidence,
}: InsightsPanelProps) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-text-light">
          Generating insights...
        </div>
      );
    }

    if (confidence !== undefined && confidence < 0.6) {
      return (
        <div className="text-center text-accent-warning">
          Low confidence – please refine your question.
        </div>
      );
    }

    if (!visualization || visualization.type === "none") {
      return (
        <div className="text-center text-text-light">
          No visualization available.
        </div>
      );
    }

    if (visualization.type === "insight" && visualization.insight) {
      return <InsightNumber data={visualization.insight} />;
    }

    if (visualization.type === "chart" && visualization.chart) {
      const { type, title, labels, data } = visualization.chart;
      const chartData = { labels, datasets: [{ label: title, data }] };

      switch (type) {
        case "bar":
          return <BarChart data={chartData} />;
        case "line":
          return <LineChart data={chartData} />;
        case "pie":
          return <PieChart data={chartData} />;
        default:
          return (
            <div className="text-center text-accent-error">
              Unknown chart type.
            </div>
          );
      }
    }

    return null;
  };

  return (
    <div className="h-full bg-background-panel p-4 flex flex-col">
      <h1 className="font-bold text-lg mb-4 border-b pb-2 text-text-default">
        Insights
      </h1>
      <div className="flex-1 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};
