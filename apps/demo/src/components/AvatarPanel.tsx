"use client";

import React, { useEffect, useRef } from "react";
import { useHeyGenSession } from "../liveavatar/useHeyGenSession";
import { SessionState } from "@heygen/liveavatar-web-sdk";

export const AvatarPanel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    sessionState,
    isStreamReady,
    attachElement,
    hasConsent,
    giveConsent,
    startSession,
    isSessionTokenLoading,
  } = useHeyGenSession();

  const isConnected = sessionState === SessionState.CONNECTED;
  const isConnectingToHeyGen =
    sessionState === SessionState.CONNECTING ||
    sessionState === SessionState.INACTIVE;

  useEffect(() => {
    if (videoRef.current && isStreamReady && hasConsent) {
      attachElement(videoRef.current);
      console.log("Attaching video element to HeyGen stream.");
    }
  }, [videoRef, isStreamReady, attachElement, hasConsent]);

  // Automatically attempt to start HeyGen session if consent is given and token is ready
  useEffect(() => {
    // Only attempt to start session if consent is given, token is loaded, and session is inactive
    if (
      hasConsent &&
      !isSessionTokenLoading &&
      sessionState === SessionState.INACTIVE
    ) {
      startSession().catch((err) =>
        console.error("Failed to auto-start HeyGen session:", err),
      );
    }
  }, [hasConsent, isSessionTokenLoading, sessionState, startSession]);

  if (!hasConsent) {
    return (
      <div className="w-full h-full bg-background-light flex flex-col items-center justify-center p-4">
        <p className="text-center text-lg mb-4 text-text-default">
          To enable the AI avatar, please consent to the use of the HeyGen
          LiveAvatar service. Your text input will be processed to generate
          spoken audio and an avatar video.
        </p>
        <button
          onClick={giveConsent}
          className="bg-primary-DEFAULT hover:bg-primary-dark text-text-inverted font-bold py-2 px-4 rounded"
        >
          I Consent
        </button>
      </div>
    );
  }

  // Determine the display message
  let displayMessage = "";
  if (isSessionTokenLoading) {
    displayMessage = "Fetching HeyGen token...";
  } else if (
    !isConnectingToHeyGen &&
    !isConnected &&
    !isSessionTokenLoading &&
    sessionState === SessionState.DISCONNECTED
  ) {
    displayMessage = "HeyGen Session Disconnected";
  } else if (!isConnected) {
    displayMessage = "Connecting to HeyGen...";
  } else if (isConnected && !isStreamReady) {
    displayMessage = "Waiting for HeyGen stream...";
  } else if (isConnected && isStreamReady) {
    displayMessage = "HeyGen Connected";
  }

  return (
    <div className="w-full h-full bg-background-light flex items-center justify-center relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute initially to prevent audio feedback loops
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm p-2 rounded">
        {displayMessage}
      </div>
    </div>
  );
};
