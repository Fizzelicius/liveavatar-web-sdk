"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  styled,
} from "@mui/material";

import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";

interface SessionControlsProps {
  mode: "FULL" | "CUSTOM";
  isVoiceChatActive: boolean;
  isVoiceChatLoading: boolean;
  isMuted: boolean;
  onStartVoiceChat: () => void;
  onStopVoiceChat: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onInterrupt: () => void;
  onRepeat: () => void;
  onSendMessage: (message: string) => void;
  onKeepAlive: () => void;
}

const LargeIconButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
}));

export const SessionControls: React.FC<SessionControlsProps> = (props) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleToggleListening = () => {
    if (isListening) {
      props.onStopListening();
    } else {
      props.onStartListening();
    }
    setIsListening(!isListening);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      props.onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <Card
      sx={{
        mt: 3,
        background: "transparent",
        boxShadow: "none",
        border: "none",
      }}
    >
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          {/* Text Input */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to the avatar..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "white",
                  },
                }}
              />
              <Tooltip title="Send Message">
                <IconButton
                  onClick={handleSendMessage}
                  color="primary"
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                    borderRadius: "12px",
                    px: 2,
                  }}
                >
                  <SendOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>

          {/* Controls */}
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {props.mode === "FULL" && (
                <>
                  <Tooltip title={props.isMuted ? "Unmute" : "Mute"}>
                    <span>
                      <LargeIconButton
                        onClick={props.isMuted ? props.onUnmute : props.onMute}
                        disabled={!props.isVoiceChatActive}
                      >
                        {props.isMuted ? (
                          <MicOffOutlinedIcon />
                        ) : (
                          <MicOutlinedIcon />
                        )}
                      </LargeIconButton>
                    </span>
                  </Tooltip>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={props.isVoiceChatActive}
                        onChange={
                          props.isVoiceChatActive
                            ? props.onStopVoiceChat
                            : props.onStartVoiceChat
                        }
                        disabled={props.isVoiceChatLoading}
                      />
                    }
                    label="Voice Chat"
                  />
                </>
              )}
              <Tooltip
                title={isListening ? "Stop Listening" : "Start Listening"}
              >
                <LargeIconButton onClick={handleToggleListening}>
                  {isListening ? (
                    <PauseOutlinedIcon />
                  ) : (
                    <PlayArrowOutlinedIcon />
                  )}
                </LargeIconButton>
              </Tooltip>
              <Tooltip title="Interrupt Avatar">
                <LargeIconButton onClick={props.onInterrupt}>
                  <StopCircleOutlinedIcon color="error" />
                </LargeIconButton>
              </Tooltip>
              <Tooltip title="Repeat Last Message">
                <LargeIconButton onClick={props.onRepeat}>
                  <ReplayOutlinedIcon />
                </LargeIconButton>
              </Tooltip>
              <Tooltip title="Keep Session Alive">
                <LargeIconButton onClick={props.onKeepAlive}>
                  <PowerSettingsNewOutlinedIcon color="success" />
                </LargeIconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
