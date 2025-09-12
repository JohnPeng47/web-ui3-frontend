"use client";

import { Card, CardContent, CardHeader, Typography, Grid } from "@mui/material";
import ProgressStat from "../../common/ProgressStat";
import SiteTree from "../../common/SiteTree";
import type { SpiderStats } from "./types";

export interface SpiderStatsCardProps {
  stats: SpiderStats;
  progressPercent: number;
  siteTreeLines: string[];
}

export default function SpiderStatsCard({ stats, progressPercent, siteTreeLines }: SpiderStatsCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader title={<Typography variant="h6">Spider Agent</Typography>} subheader="Active" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <ProgressStat label="Pages" value={stats.pages} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <ProgressStat label="Links" value={stats.links} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <ProgressStat label="Requests" value={stats.requests} />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ProgressStat label="Progress" value={`${Math.round(progressPercent)}%`} percent={progressPercent} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SiteTree lines={siteTreeLines} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
