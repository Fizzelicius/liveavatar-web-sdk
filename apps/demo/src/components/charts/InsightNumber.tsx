"use client";

import React from "react";

interface InsightNumberProps {
  data: {
    value: string;
    label: string;
  };
}

export const InsightNumber = ({ data }: InsightNumberProps) => {
  return (
    <div className="p-4 text-center">
      <div className="text-5xl font-bold text-primary-dark">{data.value}</div>
      <div className="text-lg text-text-light mt-2">{data.label}</div>
    </div>
  );
};
