import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ConnectionQuality,
  LiveAvatarSession,
  SessionState,
  SessionEvent,
  VoiceChatEvent,
  VoiceChatState,
  AgentEventsEnum,
} from "@heygen/liveavatar-web-sdk";
import { LiveAvatarSessionMessage } from "./types";

type HeyGenContextProps = {
  sessionRef: React.RefObject<LiveAvatarSession>;

  isMuted: boolean;
  voiceChatState: VoiceChatState;

  sessionState: SessionState;
  isStreamReady: boolean;
  connectionQuality: ConnectionQuality;

  isUserTalking: boolean;
  isAvatarTalking: boolean;

  messages: LiveAvatarSessionMessage[]; // To be implemented later for chat history

  // Consent-related
  hasConsent: boolean;
  giveConsent: () => void;

  // Session Token related
  sessionAccessToken: string | null;
  isSessionTokenLoading: boolean;
};

export const HeyGenContext = createContext<HeyGenContextProps>({
  sessionRef: {
    current: null,
  } as unknown as React.RefObject<LiveAvatarSession>,
  connectionQuality: ConnectionQuality.UNKNOWN,
  isMuted: true,
  voiceChatState: VoiceChatState.INACTIVE,
  sessionState: SessionState.DISCONNECTED,
  isStreamReady: false,
  isUserTalking: false,
  isAvatarTalking: false,
  messages: [],
  hasConsent: false,
  giveConsent: () => {},
  sessionAccessToken: null,
  isSessionTokenLoading: false,
});

type HeyGenSessionProviderProps = {
  children: React.ReactNode;
};

const useSessionState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [sessionState, setSessionState] = useState<SessionState>(
    sessionRef.current?.state || SessionState.INACTIVE,
  );
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
    sessionRef.current?.connectionQuality || ConnectionQuality.UNKNOWN,
  );
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);

  useEffect(() => {
    const currentSession = sessionRef.current;
    if (currentSession) {
      const handleStateChange = (state: SessionState) => {
        setSessionState(state);
        if (state === SessionState.DISCONNECTED) {
          currentSession.removeAllListeners();
          currentSession.voiceChat.removeAllListeners();
          setIsStreamReady(false);
        }
      };
      const handleStreamReady = () => setIsStreamReady(true);
      const handleConnectionQualityChange = (quality: ConnectionQuality) =>
        setConnectionQuality(quality);

      currentSession.on(SessionEvent.SESSION_STATE_CHANGED, handleStateChange);
      currentSession.on(SessionEvent.SESSION_STREAM_READY, handleStreamReady);
      currentSession.on(
        SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED,
        handleConnectionQualityChange,
      );

      return () => {
        currentSession.off(
          SessionEvent.SESSION_STATE_CHANGED,
          handleStateChange,
        );
        currentSession.off(
          SessionEvent.SESSION_STREAM_READY,
          handleStreamReady,
        );
        currentSession.off(
          SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED,
          handleConnectionQualityChange,
        );
      };
    }
  }, [sessionRef]);

  return { sessionState, isStreamReady, connectionQuality };
};

const useVoiceChatState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [isMuted, setIsMuted] = useState(true);
  const [voiceChatState, setVoiceChatState] = useState<VoiceChatState>(
    sessionRef.current?.voiceChat.state || VoiceChatState.INACTIVE,
  );

  useEffect(() => {
    const currentVoiceChat = sessionRef.current?.voiceChat;
    if (currentVoiceChat) {
      const handleMuted = () => setIsMuted(true);
      const handleUnmuted = () => setIsMuted(false);
      const handleStateChange = (state: VoiceChatState) =>
        setVoiceChatState(state);

      currentVoiceChat.on(VoiceChatEvent.MUTED, handleMuted);
      currentVoiceChat.on(VoiceChatEvent.UNMUTED, handleUnmuted);
      currentVoiceChat.on(VoiceChatEvent.STATE_CHANGED, handleStateChange);

      return () => {
        currentVoiceChat.off(VoiceChatEvent.MUTED, handleMuted);
        currentVoiceChat.off(VoiceChatEvent.UNMUTED, handleUnmuted);
        currentVoiceChat.off(VoiceChatEvent.STATE_CHANGED, handleStateChange);
      };
    }
  }, [sessionRef]);

  return { isMuted, voiceChatState };
};

const useTalkingState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  useEffect(() => {
    const currentSession = sessionRef.current;
    if (currentSession) {
      const handleUserSpeakStarted = () => setIsUserTalking(true);
      const handleUserSpeakEnded = () => setIsUserTalking(false);
      const handleAvatarSpeakStarted = () => setIsAvatarTalking(true);
      const handleAvatarSpeakEnded = () => setIsAvatarTalking(false);

      currentSession.on(
        AgentEventsEnum.USER_SPEAK_STARTED,
        handleUserSpeakStarted,
      );
      currentSession.on(AgentEventsEnum.USER_SPEAK_ENDED, handleUserSpeakEnded);
      currentSession.on(
        AgentEventsEnum.AVATAR_SPEAK_STARTED,
        handleAvatarSpeakStarted,
      );
      currentSession.on(
        AgentEventsEnum.AVATAR_SPEAK_ENDED,
        handleAvatarSpeakEnded,
      );

      return () => {
        currentSession.off(
          AgentEventsEnum.USER_SPEAK_STARTED,
          handleUserSpeakStarted,
        );
        currentSession.off(
          AgentEventsEnum.USER_SPEAK_ENDED,
          handleUserSpeakEnded,
        );
        currentSession.off(
          AgentEventsEnum.AVATAR_SPEAK_STARTED,
          handleAvatarSpeakStarted,
        );
        currentSession.off(
          AgentEventsEnum.AVATAR_SPEAK_ENDED,
          handleAvatarSpeakEnded,
        );
      };
    }
  }, [sessionRef]);

  return { isUserTalking, isAvatarTalking };
};

export const HeyGenSessionProvider = ({
  children,
}: HeyGenSessionProviderProps) => {
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("heygen_consent_given") === "true";
    }
    return false;
  });

  const giveConsent = useCallback(() => {
    setHasConsent(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("heygen_consent_given", "true");
    }
  }, []);

  const [sessionAccessToken, setSessionAccessToken] = useState<string | null>(
    null,
  );
  const [isSessionTokenLoading, setIsSessionTokenLoading] = useState(false);

  const fetchSessionAccessToken = useCallback(async () => {
    if (sessionAccessToken || isSessionTokenLoading) return;

    setIsSessionTokenLoading(true);
    try {
      const response = await fetch("/api/start-session", { method: "POST" });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch HeyGen session token: ${response.statusText}`,
        );
      }
      const data = await response.json();
      setSessionAccessToken(data.session_token);
    } catch (error) {
      console.error("Error fetching HeyGen session token:", error);
      setSessionAccessToken(null);
    } finally {
      setIsSessionTokenLoading(false);
    }
  }, [sessionAccessToken, isSessionTokenLoading]);

  // Fetch token on mount if consent is given
  useEffect(() => {
    if (hasConsent && !sessionAccessToken && !isSessionTokenLoading) {
      fetchSessionAccessToken();
    }
  }, [
    hasConsent,
    sessionAccessToken,
    isSessionTokenLoading,
    fetchSessionAccessToken,
  ]);

  const sessionRef = useRef<LiveAvatarSession | null>(null);

  useEffect(() => {
    // Validate NEXT_PUBLIC_HEYGEN_API_URL before initializing
    const heygenApiUrl = process.env.NEXT_PUBLIC_HEYGEN_API_URL;
    if (!heygenApiUrl) {
      console.error(
        "NEXT_PUBLIC_HEYGEN_API_URL is not set in environment variables.",
      );
      // Optionally, you could set an error state here to display to the user
      return;
    }

    // Initialize LiveAvatarSession only if consent is given and token is available
    if (hasConsent && sessionAccessToken && !sessionRef.current) {
      const config = {
        voiceChat: true, // Default voice chat on
        apiUrl: heygenApiUrl,
      };
      sessionRef.current = new LiveAvatarSession(sessionAccessToken, config);
      console.log("HeyGen LiveAvatarSession initialized.");

      // Automatically start the session once initialized
      sessionRef.current.start().catch((error) => {
        console.error(
          "Failed to start HeyGen LiveAvatarSession automatically:",
          error,
        );
      });
    }

    return () => {
      // Clean up session on unmount
      if (
        sessionRef.current &&
        sessionRef.current.state !== SessionState.DISCONNECTED
      ) {
        sessionRef.current.stop();
        console.log("HeyGen LiveAvatarSession stopped on unmount.");
      }
      sessionRef.current = null;
    };
  }, [hasConsent, sessionAccessToken]); // Re-run effect if consent or sessionAccessToken changes

  const { sessionState, isStreamReady, connectionQuality } = useSessionState(
    sessionRef as React.RefObject<LiveAvatarSession>,
  );

  const { isMuted, voiceChatState } = useVoiceChatState(
    sessionRef as React.RefObject<LiveAvatarSession>,
  );
  const { isUserTalking, isAvatarTalking } = useTalkingState(
    sessionRef as React.RefObject<LiveAvatarSession>,
  );

  return (
    <HeyGenContext.Provider
      value={{
        sessionRef: sessionRef as React.RefObject<LiveAvatarSession>,
        sessionState,
        isStreamReady,
        connectionQuality,
        isMuted,
        voiceChatState,
        isUserTalking,
        isAvatarTalking,
        messages: [], // TODO - properly implement chat history
        hasConsent,
        giveConsent,
        sessionAccessToken,
        isSessionTokenLoading,
      }}
    >
      {children}
    </HeyGenContext.Provider>
  );
};

export const useHeyGenContext = () => {
  const context = useContext(HeyGenContext);
  if (context === undefined) {
    throw new Error(
      "useHeyGenContext must be used within a HeyGenSessionProvider",
    );
  }
  return context;
};
