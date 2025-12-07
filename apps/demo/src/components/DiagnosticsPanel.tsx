"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Typography,
  styled,
} from "@mui/material";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface DiagnosticsPanelProps {
  sessionState: SessionState;
  connectionQuality: string;
  isUserTalking: boolean;
  isAvatarTalking: boolean;
  voiceChatActive: boolean;
  voiceChatLoading: boolean;
  isMuted: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: 320,
  backdropFilter: "blur(12px)",
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
}));

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const diagnosticData = [
    { label: "Session State", value: props.sessionState },
    { label: "Connection", value: props.connectionQuality },
    { label: "User Talking", value: props.isUserTalking ? "Yes" : "No" },
    { label: "Avatar Talking", value: props.isAvatarTalking ? "Yes" : "No" },
    {
      label: "Voice Chat",
      value: props.voiceChatActive ? "Active" : "Inactive",
    },
    { label: "VC Loading", value: props.voiceChatLoading ? "Yes" : "No" },
    { label: "Muted", value: props.isMuted ? "Yes" : "No" },
  ];

  return (
    <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
      <Chip
        icon={<InfoOutlinedIcon />}
        label={isOpen ? "Hide Diagnostics" : "Show Diagnostics"}
        onClick={() => setIsOpen(!isOpen)}
        variant="outlined"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(10px)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          },
        }}
      />
      <Collapse in={isOpen}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Session Diagnostics
            </Typography>
            <Box
              component="dl"
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 1,
                rowGap: 1.5,
                m: 0,
              }}
            >
              {diagnosticData.map((item, index) => (
                <React.Fragment key={index}>
                  <Box
                    component="dt"
                    sx={{ color: "text.secondary", fontWeight: 500, m: 0 }}
                  >
                    <Typography
                      variant="body2"
                      color="inherit"
                      fontWeight="inherit"
                    >
                      {item.label}
                    </Typography>
                  </Box>
                  <Box
                    component="dd"
                    sx={{ textAlign: "right", fontWeight: 500, m: 0 }}
                  >
                    <Typography
                      variant="body2"
                      color="inherit"
                      fontWeight="inherit"
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </CardContent>
        </StyledCard>
      </Collapse>
    </Box>
  );
};
