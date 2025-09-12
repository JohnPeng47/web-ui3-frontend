"use client";

import { Box, Typography } from "@mui/material";

export interface SiteTreeProps {
  lines: string[]; // formatted lines, e.g., "├─ /login"
  maxHeight?: number;
}

export default function SiteTree({ lines, maxHeight = 320 }: SiteTreeProps) {
  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 1, p: 2, maxHeight, overflowY: "auto" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Site Structure</Typography>
      <Box component="pre" sx={{ m: 0, fontFamily: "monospace", fontSize: 13, color: "text.secondary" }}>
        {lines.join("\n")}
      </Box>
    </Box>
  );
}

