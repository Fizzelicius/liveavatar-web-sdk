"use client";

import React from "react";
import { HeyGenSessionProvider } from "../liveavatar/context";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component to wrap the entire application with necessary contexts.
 * This includes HeyGen session context, chat context, etc.
 */
export const Providers = ({ children }: ProvidersProps) => {
  return <HeyGenSessionProvider>{children}</HeyGenSessionProvider>;
};
