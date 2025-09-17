"use client";

/**
 * DashboardPage - Pentest Agent Dashboard
 * 
 * This component supports both live API mode and mock data mode.
 * Mock data mode is enabled when MOCK_DATA: true is set in config.json
 * 
 * To run in mock mode:
 * 1. Run `npm run test:mock` to start with mock data
 * 2. Or manually copy public/test_config.json to public/config.json
 * 
 * Mock mode demonstrates dynamic agent discovery and step progression
 * with realistic penetration testing scenarios.
 */

import { Card, CardContent, CardHeader, Container, Typography, Grid } from "@mui/material";
import HeaderBar from "../../common/HeaderBar";
import SpiderStatsCard from "./SpiderStatsCard";
import AgentCard from "./AgentCard";
import { useParams } from "react-router-dom";
import { useAgentPageDataQuery } from "../../../features/agent/queries/useAgentPageDataQuery";
import { useExploitAgentSteps } from "../../../features/agent/queries/useExploitAgentQueries";
import { ExploitDataBridge } from "../../../features/agent/bridge/ExploitDataBridge";
import { useExploitSelectors } from "../../../features/agent/store/exploitStore";

export default function DashboardPage() {
  const { engagementId } = useParams<{ engagementId: string }>();
  const { data: agentData } = useAgentPageDataQuery(engagementId, { intervalMs: 5000 });
  const { exploitAgentIds, agentsById, stepsByAgentId, agentNames, agentsPhase, stepsPhase, stepsError } = useExploitSelectors();

  const siteTreeLines = agentData?.siteTreeLines ?? ["/"];
  const stats = agentData?.spiderStats ?? { pages: 0, requests: 0 };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <ExploitDataBridge engagementId={engagementId} />
      <HeaderBar title="Pentest Agent Dashboard" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SpiderStatsCard
            stats={stats}
            siteTreeLines={siteTreeLines}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Exploit Agents"
              subheader={`Agents: ${exploitAgentIds.length} • Agent status: ${agentsPhase} • Steps status: ${stepsPhase}`}
            />
            <CardContent>
              {stepsError ? (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {(stepsError as Error).message}
                </Typography>
              ) : null}
              {!exploitAgentIds.length ? (
                <Typography variant="body2" color="text.secondary">Waiting for exploit agent…</Typography>
              ) : null}
            </CardContent>
          </Card>

          {exploitAgentIds.map((id: string) => {
            const agent = agentsById[id];
            const steps = stepsByAgentId[id] || [];
            const name = agentNames[id] || agent?.id || id;
            return (
              <AgentCard key={id} id={id} name={name} steps={steps} />
            );
          })}
        </Grid>
      </Grid>
    </Container>
  );
}
