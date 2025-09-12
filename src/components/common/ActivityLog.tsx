"use client";

import { Box, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import type { LogEntry } from "../pages/agent_dashboard/types";

export interface ActivityLogProps {
  entries: LogEntry[];
  maxHeight?: number;
}

export default function ActivityLog({ entries, maxHeight = 360 }: ActivityLogProps) {
  return (
    <Box sx={{ maxHeight, overflowY: "auto" }}>
      <List dense disablePadding>
        {entries.map((e) => (
          <ListItem key={e.id} sx={{ py: 0.5 }}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                    {e.time}
                  </Typography>
                  <Chip
                    size="small"
                    label={e.agent.toUpperCase()}
                    color={e.agent === "spider" ? "info" : "secondary"}
                    variant="outlined"
                  />
                  <Typography variant="body2">{e.message}</Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

