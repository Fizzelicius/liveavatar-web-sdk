"use client";

import { useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import AdjustOutlinedIcon from "@mui/icons-material/AdjustOutlined";
import { HeyGenLogo } from "./HeyGenLogo";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [mode, setMode] = useState<"FULL" | "CUSTOM">("FULL");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async (startFn: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await startFn();
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const startFullSession = async () => {
    const res = await fetch("/api/start-session", {
      method: "POST",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to start full session");
    }
    const { session_token } = await res.json();
    setSessionToken(session_token);
    setMode("FULL");
  };

  const startCustomSession = async () => {
    const res = await fetch("/api/start-custom-session", {
      method: "POST",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to start custom session");
    }
    const { session_token } = await res.json();
    setSessionToken(session_token);
    setMode("CUSTOM");
  };

  const onSessionStopped = () => {
    setSessionToken("");
  };

  if (sessionToken) {
    return (
      <LiveAvatarSession
        mode={mode}
        sessionAccessToken={sessionToken}
        onSessionStopped={onSessionStopped}
      />
    );
  }

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ width: "100%", p: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="center" mb={3}>
              <HeyGenLogo />
            </Box>
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              align="center"
              fontWeight="700"
            >
              Live Avatar SDK
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mt: 2, mb: 2, borderRadius: "8px" }}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayCircleOutlinedIcon />}
                onClick={() => handleStart(startFullSession)}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Start Full Avatar Session"
                )}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AdjustOutlinedIcon />}
                onClick={() => handleStart(startCustomSession)}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Start Custom Avatar Session"
                )}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
