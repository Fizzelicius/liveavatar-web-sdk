// apps/demo/lib/theme.ts

/**
 * Defines the color palette and theming for the AI Data Narrator application.
 *
 * This object can be extended to include typography, spacing, or other theme-related variables.
 * For Tailwind CSS integration, these colors can be mapped in `tailwind.config.cjs`.
 */
export const themeColors = {
  // Primary accent color for buttons, highlights, etc.
  primary: {
    DEFAULT: "#2B6CB0", // Tailwind's blue-700 equivalent
    light: "#4299E1", // Tailwind's blue-500
    dark: "#2C5282", // Tailwind's blue-800
  },
  // Secondary color, often used for less prominent actions or backgrounds.
  secondary: {
    DEFAULT: "#718096", // Tailwind's gray-500
    light: "#A0AEC0", // Tailwind's gray-300
    dark: "#4A5568", // Tailwind's gray-700
  },
  // Text colors
  text: {
    DEFAULT: "#2D3748", // Tailwind's gray-800
    light: "#4A5568", // Tailwind's gray-700
    dark: "#E2E8F0", // Tailwind's gray-200 (for dark mode backgrounds)
    inverted: "#FFFFFF", // White text for dark backgrounds
  },
  // Background colors
  background: {
    DEFAULT: "#F7FAFC", // Tailwind's gray-100
    light: "#FFFFFF", // White
    dark: "#1A202C", // Tailwind's gray-900 (for dark mode)
    panel: "#EDF2F7", // Tailwind's gray-200 (for panel backgrounds)
  },
  // Accent colors for data visualization, alerts, etc.
  accent: {
    success: "#38A169", // Green
    warning: "#D69E2E", // Yellow
    error: "#E53E3E", // Red
    info: "#3182CE", // Blue
  },
  // Specific colors for chat bubbles
  chat: {
    user: "#2B6CB0", // Primary blue for user messages
    bot: "#E2E8F0", // Light gray for bot messages
    botText: "#2D3748", // Dark text on bot messages
    userText: "#FFFFFF", // White text on user messages
  },
  // Chart specific colors (can be extended)
  chart: {
    color1: "#4299E1", // Blue
    color2: "#9F7AEA", // Purple
    color3: "#F6AD55", // Orange
    color4: "#4FD1C5", // Teal
    color5: "#F56565", // Red
  },
};

// Exporting a type definition for theme colors can be useful for type safety
export type ThemeColors = typeof themeColors;
