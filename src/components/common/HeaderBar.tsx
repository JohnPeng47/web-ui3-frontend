"use client";

import { Box, Chip, Typography } from "@mui/material";

export interface HeaderBarProps {
  title: string;
  target: string;
  scanning: boolean;
}

export default function HeaderBar({ title, target, scanning }: HeaderBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        mb: 2
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Target:</Typography>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{target}</Typography>
        <Chip label={scanning ? "SCANNING" : "IDLE"} color={scanning ? "success" : "default"} variant="outlined" />
      </Box>
    </Box>
  );
}

