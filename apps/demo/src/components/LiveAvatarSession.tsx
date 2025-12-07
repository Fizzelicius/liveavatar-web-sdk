"use client";

import React, { useEffect, useRef } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
  useVoiceChat,
} from "../liveavatar";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import { useAvatarActions } from "../liveavatar/useAvatarActions";
import { Box, Button, Card, Container } from "@mui/material";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { SessionControls } from "./SessionControls";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import { HeyGenLogo } from "./HeyGenLogo";

const LiveAvatarSessionComponent: React.FC<{
  mode: "FULL" | "CUSTOM";
  onSessionStopped: () => void;
}> = ({ mode, onSessionStopped }) => {
  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    connectionQuality,
    keepAlive,
    attachElement,
  } = useSession();
  const {
    isAvatarTalking,
    isUserTalking,
    isMuted,
    isActive: isVoiceChatActive,
    isLoading: isVoiceChatLoading,
    start: startVoiceChat,
    stop: stopVoiceChat,
    mute,
    unmute,
  } = useVoiceChat();

  const { interrupt, repeat, startListening, stopListening } =
    useAvatarActions(mode);

  const { sendMessage } = useTextChat(mode);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [attachElement, isStreamReady]);

  useEffect(() => {
    if (sessionState === SessionState.INACTIVE) {
      startSession();
    }
  }, [startSession, sessionState]);

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 }, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <HeyGenLogo />
      </Box>

      <Card
        sx={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden" }}
      >
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "black",
          }}
        />
        <DiagnosticsPanel
          sessionState={sessionState}
          connectionQuality={connectionQuality}
          isUserTalking={isUserTalking}
          isAvatarTalking={isAvatarTalking}
          voiceChatActive={isVoiceChatActive}
          voiceChatLoading={isVoiceChatLoading}
          isMuted={isMuted}
        />
      </Card>

      <SessionControls
        mode={mode}
        isVoiceChatActive={isVoiceChatActive}
        isVoiceChatLoading={isVoiceChatLoading}
        isMuted={isMuted}
        onStartVoiceChat={startVoiceChat}
        onStopVoiceChat={stopVoiceChat}
        onMute={mute}
        onUnmute={unmute}
        onStartListening={startListening}
        onStopListening={stopListening}
        onInterrupt={interrupt}
        onRepeat={() => repeat("")}
        onSendMessage={sendMessage}
        onKeepAlive={keepAlive}
      />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="text"
          color="secondary"
          startIcon={<StopCircleOutlinedIcon />}
          onClick={stopSession}
        >
          Stop Session
        </Button>
      </Box>
    </Container>
  );
};

export const LiveAvatarSession: React.FC<{
  mode: "FULL" | "CUSTOM";
  sessionAccessToken: string;
  onSessionStopped: () => void;
}> = ({ mode, sessionAccessToken, onSessionStopped }) => {
  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <LiveAvatarSessionComponent
        mode={mode}
        onSessionStopped={onSessionStopped}
      />
    </LiveAvatarContextProvider>
  );
};
