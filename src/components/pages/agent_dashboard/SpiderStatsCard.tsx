"use client";

import { Card, CardContent, CardHeader, Typography, Grid } from "@mui/material";
import SiteTree from "../../common/SiteTree";
import type { SpiderStats } from "./types";

export interface SpiderStatsCardProps {
  stats: SpiderStats;
  siteTreeLines: string[];
}

export default function SpiderStatsCard({ stats, siteTreeLines }: SpiderStatsCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader title={<Typography variant="h6">Spider Agent</Typography>} subheader="Active" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2">Pages</Typography>
                <Typography variant="h6">{stats.pages}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2">Requests</Typography>
                <Typography variant="h6">{stats.requests}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SiteTree lines={siteTreeLines} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
