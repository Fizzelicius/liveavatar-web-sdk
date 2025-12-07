"use client";

import { createTheme } from "@mui/material/styles";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007AFF", // A vibrant, Apple-like blue
    },
    secondary: {
      main: "#FF3B30", // An accent color for actions like 'stop'
    },
    background: {
      default: "#f4f4f8", // A very light grey for the main background
      paper: "#ffffff",
    },
    text: {
      primary: "#1d1d1f",
      secondary: "#6e6e73",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Softer, more rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // More subtle button text
          fontWeight: 600,
          boxShadow: "none", // No shadow for a flatter look
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "0 4px 12px rgba(0, 122, 255, 0.2)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(0, 122, 255, 0.25)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", // Softer, more subtle shadows
          border: "1px solid rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        },
      },
    },
  },
});

export default theme;
