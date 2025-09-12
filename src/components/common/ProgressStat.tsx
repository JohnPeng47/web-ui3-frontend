"use client";

import { Box, LinearProgress, Typography } from "@mui/material";
import type { StatProps } from "./types";

interface ProgressStatProps extends StatProps {
  percent?: number; // 0..100
}

export default function ProgressStat({ label, value, percent }: ProgressStatProps) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
      {typeof percent === "number" && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={percent} />
        </Box>
      )}
    </Box>
  );
}

