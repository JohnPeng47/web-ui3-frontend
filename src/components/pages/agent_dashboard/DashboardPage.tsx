"use client";

import { Box, Card, CardContent, CardHeader, Container, Typography, Grid, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HeaderBar from "../../common/HeaderBar";
import SpiderStatsCard from "./SpiderStatsCard";
import { useParams } from "react-router-dom";
import { useAgentPageDataQuery } from "../../../features/agent/queries/useAgentPageDataQuery";
import { useExploitAgentSteps } from "../../../features/agent/queries/useExploitAgentQueries";

export default function DashboardPage() {
  const { engagementId } = useParams<{ engagementId: string }>();
  const { data: agentData } = useAgentPageDataQuery(engagementId, { intervalMs: 5000 });
  const { exploitAgents, agentStatus, exploitAgentData, stepsStatus, stepsError } = useExploitAgentSteps(engagementId, {
    findIntervalMs: 2000,
    afterFoundIntervalMs: 30000,
    keepWatchingAgents: true,
    stepsIntervalMs: 2000
  });

  const siteTreeLines = agentData?.siteTreeLines ?? ["/"];
  const stats = agentData?.spiderStats ?? { pages: 0, requests: 0 };

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
          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Exploit Agents"
              subheader={`Agents: ${exploitAgents?.length ?? 0} • Agent status: ${agentStatus} • Steps status: ${stepsStatus}`}
            />
            <CardContent>
              {stepsError ? (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {(stepsError as Error).message}
                </Typography>
              ) : null}
              {!exploitAgentData?.length ? (
                <Typography variant="body2" color="text.secondary">Waiting for exploit agent…</Typography>
              ) : null}
            </CardContent>
          </Card>

          {exploitAgentData?.map((agent) => (
            <Card key={agent.agentId} sx={{ mt: 2 }}>
              <CardHeader
                title={agent.agentName}
                subheader={`Agent ID: ${agent.agentId} • ${agent.agentSteps.length} steps`}
              />
              <CardContent>
                {agent.agentSteps.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No steps yet.</Typography>
                ) : (
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {agent.agentSteps.map((s) => (
                      <Accordion key={s.step_num} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2">
                            {`Step ${s.step_num}: ${s.reflection}`}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                            {s.reflection}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              display: "block",
                              whiteSpace: "pre-wrap",
                              bgcolor: "action.hover",
                              p: 1,
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            {s.script}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              display: "block",
                              whiteSpace: "pre-wrap",
                              bgcolor: "action.hover",
                              p: 1,
                              borderRadius: 1
                            }}
                          >
                            {s.execution_output}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
}
