"use client";

import { Chip } from "@mui/material";
import type { Severity } from "../pages/agent_dashboard/types";

function colorFor(severity: Severity): "error" | "warning" | "info" {
  switch (severity) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
    default:
      return "info";
  }
}

export interface SeverityChipProps {
  severity: Severity;
  size?: "small" | "medium";
}

export default function SeverityChip({ severity, size = "small" }: SeverityChipProps) {
  return <Chip label={severity.toUpperCase()} color={colorFor(severity)} size={size} variant="outlined" />;
}

