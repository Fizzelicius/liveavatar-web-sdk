"use client";

import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

export const HeyGenLogo = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    viewBox="0 0 100 28"
    sx={{ width: 100, height: 28, ...props.sx }}
  >
    <path d="M14 0H0V28H14V0Z" fill="#007AFF" />
    <path d="M32 0H18V28H32V0Z" fill="#007AFF" />
    <path d="M50 0H36V28H50V0Z" fill="#007AFF" fillOpacity="0.6" />
    <path d="M68 0H54V28H68V0Z" fill="#007AFF" fillOpacity="0.4" />
    <path d="M86 0H72V28H86V0Z" fill="#007AFF" fillOpacity="0.2" />
  </SvgIcon>
);
