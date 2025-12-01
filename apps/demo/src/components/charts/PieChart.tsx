"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
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

const COLORS = [
  themeColors.chart.color1,
  themeColors.chart.color2,
  themeColors.chart.color3,
  themeColors.chart.color4,
  themeColors.chart.color5,
];

export const PieChart = ({ data }: ChartProps) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: themeColors.background.dark,
            borderColor: themeColors.primary.dark,
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
