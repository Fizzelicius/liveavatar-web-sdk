"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { themeColors } from "../../../lib/theme";

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
}

export const BarChart = ({ data }: ChartProps) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    [data.datasets[0].label]: data.datasets[0].data[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={chartData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={themeColors.background.panel}
        />
        <XAxis dataKey="name" stroke={themeColors.text.light} />
        <YAxis stroke={themeColors.text.light} />
        <Tooltip
          contentStyle={{
            backgroundColor: themeColors.background.dark,
            borderColor: themeColors.primary.dark,
          }}
        />
        <Legend />
        <Bar dataKey={data.datasets[0].label} fill={themeColors.chart.color1} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
