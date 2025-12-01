import { useCallback } from "react";
import { useHeyGenContext } from "./context";

export const useHeyGenSession = () => {
  const {
    sessionRef,
    sessionState,
    isStreamReady,
    connectionQuality,
    hasConsent,
    giveConsent,
  } = useHeyGenContext();

  const startSession = useCallback(async () => {
    if (!sessionRef.current) {
      console.error("HeyGen session not initialized.");
      return;
    }
    return await sessionRef.current.start();
  }, [sessionRef]);

  const stopSession = useCallback(async () => {
    if (!sessionRef.current) {
      console.error("HeyGen session not initialized.");
      return;
    }
    return await sessionRef.current.stop();
  }, [sessionRef]);

  const keepAlive = useCallback(async () => {
    if (!sessionRef.current) {
      console.error("HeyGen session not initialized.");
      return;
    }
    return await sessionRef.current.keepAlive();
  }, [sessionRef]);

  const attachElement = useCallback(
    (element: HTMLMediaElement) => {
      if (!sessionRef.current) {
        console.error("HeyGen session not initialized.");
        return;
      }
      return sessionRef.current.attach(element);
    },
    [sessionRef],
  );

  const messageAvatar = useCallback(
    (message: string) => {
      if (!sessionRef.current) {
        console.error("HeyGen session not initialized.");
        return;
      }
      sessionRef.current.message(message);
    },
    [sessionRef],
  );

  return {
    sessionState,
    isStreamReady,
    connectionQuality,
    hasConsent,
    giveConsent,
    startSession,
    stopSession,
    keepAlive,
    attachElement,
    messageAvatar,
  };
};
