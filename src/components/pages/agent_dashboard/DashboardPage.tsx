"use client";

import { Box, Card, CardContent, CardHeader, Container, Typography, Grid, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HeaderBar from "../../common/HeaderBar";
import SpiderStatsCard from "./SpiderStatsCard";
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
              <Card key={id} sx={{ mt: 2 }}>
                <CardHeader
                  title={name}
                  subheader={`Agent ID: ${id} • ${steps.length} steps`}
                />
                <CardContent>
                  {steps.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No steps yet.</Typography>
                  ) : (
                    <Box sx={{ display: "grid", gap: 1 }}>
                      {steps.map((s: { step_num: number; reflection: string; script: string; execution_output: string }) => (
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
            );
          })}
        </Grid>
      </Grid>
    </Container>
  );
}
