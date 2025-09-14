"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, CardHeader, Container, Typography, Grid } from "@mui/material";
import HeaderBar from "../../common/HeaderBar";
import ActivityLog from "../../common/ActivityLog";
import SpiderStatsCard from "./SpiderStatsCard";
import VulnerabilityList from "./VulnerabilityList";
import type { DashboardData, LogEntry } from "./types";
import { getDemoData, getDashboardData } from "../../../lib/api";
import { useParams } from "react-router-dom";
import { useAgentPageDataQuery } from "../../../features/agent/queries/useAgentPageDataQuery";

export default function DashboardPage() {
  const { engagementId } = useParams<{ engagementId: string }>();
  const [data, setData] = useState<DashboardData>(() => getDemoData());
  const { data: agentData } = useAgentPageDataQuery(engagementId, { intervalMs: 5000 });

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
          spiderStats: {
            pages: prev.spiderStats.pages + Math.floor(Math.random() * 3),
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

  const siteTreeLines = agentData?.siteTreeLines ?? ["/"];
  const stats = agentData?.spiderStats ?? data.spiderStats;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <HeaderBar title="Pentest Agent Dashboard" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SpiderStatsCard
            stats={stats}
            siteTreeLines={siteTreeLines}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <VulnerabilityList items={data.vulnerabilities} />
        </Grid>
      </Grid>
    </Container>
  );
}
