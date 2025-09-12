"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, CardHeader, Container, Typography, Grid } from "@mui/material";
import HeaderBar from "../../common/HeaderBar";
import ActivityLog from "../../common/ActivityLog";
import SpiderStatsCard from "./SpiderStatsCard";
import VulnerabilityList from "./VulnerabilityList";
import type { DashboardData, LogEntry } from "./types";
import { getDemoData, getDashboardData } from "../../../lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(() => getDemoData());

  // Simulated client-side updates to mirror the original behavior (remove once polling wired)
  useEffect(() => {
    // Try to fetch initial data from API; fall back to demo data if it fails
    const controller = new AbortController();
    getDashboardData(controller.signal)
      .then((d) => setData(d))
      .catch(() => {
        // keep demo data if API not available
      });

    const logTimer = setInterval(() => {
      setData((prev) => {
        const agents: Array<"spider" | "scanner"> = ["spider", "scanner"];
        const agent = agents[Math.floor(Math.random() * agents.length)];
        const messages = {
          spider: [
            "New endpoint discovered: /api/v3/users",
            "Crawling depth increased to level 4",
            "Form submission point identified",
            "JavaScript file analysis in progress",
            "Hidden parameter found in response"
          ],
          scanner: [
            "Testing for CSRF vulnerabilities",
            "Analyzing session management",
            "Fuzzing input parameters",
            "Checking for XML injection",
            "Validating SSL/TLS configuration"
          ]
        } as const;

        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        const message = messages[agent][Math.floor(Math.random() * messages[agent].length)];

        const newEntry: LogEntry = {
          id: Date.now().toString(),
          time,
          agent,
          message
        };

        return {
          ...prev,
          logEntries: [newEntry, ...prev.logEntries].slice(0, 30),
          progressPercent: Math.min(prev.progressPercent + Math.random() * 2, 100),
          spiderStats: {
            pages: prev.spiderStats.pages + Math.floor(Math.random() * 3),
            links: prev.spiderStats.links + Math.floor(Math.random() * 3),
            requests: prev.spiderStats.requests + Math.floor(Math.random() * 3)
          }
        };
      });
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(logTimer);
    };
  }, []);

  const siteTreeLines = useMemo(
    () => [
      "/",
      "├─ /login",
      "│  ├─ POST /api/auth",
      "│  └─ GET /api/session",
      "├─ /dashboard",
      "│  ├─ GET /api/user",
      "│  └─ GET /api/stats",
      "├─ /products",
      "│  ├─ GET /api/products",
      "│  └─ GET /api/categories",
      "├─ /admin",
      "│  ├─ GET /api/admin/users",
      "│  └─ POST /api/admin/config",
      "└─ /api/v2",
      "   ├─ GET /api/v2/search",
      "   └─ POST /api/v2/upload"
    ],
    []
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <HeaderBar title="Pentest Agent Dashboard" target={data.targetUrl} scanning={data.scanning} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SpiderStatsCard
            stats={data.spiderStats}
            progressPercent={data.progressPercent}
            siteTreeLines={siteTreeLines}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <VulnerabilityList items={data.vulnerabilities} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader title={<Typography variant="h6">Activity Log</Typography>} subheader="Real-time" />
            <CardContent>
              <ActivityLog entries={data.logEntries} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
