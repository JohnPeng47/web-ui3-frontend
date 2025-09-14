"use client";

import { Box, Typography } from "@mui/material";

export interface HeaderBarProps {
  title: string;
}

export default function HeaderBar({ title }: HeaderBarProps) {
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
    </Box>
  );
}

