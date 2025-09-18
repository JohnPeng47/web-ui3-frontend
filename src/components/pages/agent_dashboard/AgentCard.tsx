import { Box, Card, CardContent, CardHeader, Typography, Accordion, AccordionSummary, AccordionDetails, Button, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useMemo } from "react";
import type { AgentOut, ExploitAgentStep } from "../../../api/agent/types";
import { isMockDataEnabled } from "../../../config";
import { acceptMockAgent, denyMockAgent } from "../../../features/mock/mockAgentsBus";

export interface AgentCardProps {
  agent: AgentOut;
  name?: string;
  steps: ExploitAgentStep[];
}

export default function AgentCard({ agent, name, steps }: AgentCardProps) {
  const [showSteps, setShowSteps] = useState(false);

  const title = agent.vulnerability_title || name || agent.agent_name || agent.id;
  const totalPlanned = agent.max_steps ?? undefined;
  const numSteps = steps.length;

  const isPending = agent.agent_status === "pending_approval";
  const isRunning = agent.agent_status === "running";

  const cardSx = useMemo(() => ({
    mt: 2,
    borderLeft: 4,
    borderLeftColor: isPending ? "info.main" : isRunning ? "success.main" : "divider",
    bgcolor: isPending ? "info.light" : isRunning ? "success.light" : undefined
  }), [isPending, isRunning]);

  const handleAccept = () => {
    if (isMockDataEnabled()) acceptMockAgent(agent.id);
  };
  const handleDeny = () => {
    if (isMockDataEnabled()) denyMockAgent(agent.id);
  };

  if (isPending) {
    return (
      <Card sx={cardSx}>
        <CardHeader
          title={title}
          titleTypographyProps={{ variant: "subtitle1", noWrap: true }}
          subheader={`${agent.page_url || ""} • ${agent.agent_status}`}
          subheaderTypographyProps={{ noWrap: true }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" color="primary" size="small" onClick={handleAccept}>Accept</Button>
              <Button variant="outlined" color="primary" size="small" onClick={handleDeny}>Deny</Button>
            </Box>
          }
        />
      </Card>
    );
  }

  return (
    <Card sx={cardSx}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: "subtitle1", noWrap: true }}
        subheader={`Agent ID: ${agent.id} • Status: ${agent.agent_status}${totalPlanned ? ` • Steps: ${numSteps}/${totalPlanned}` : ` • Steps: ${numSteps}`}`}
        subheaderTypographyProps={{ noWrap: true }}
        action={
          <Button
            variant="text"
            color={isRunning ? "success" : "inherit"}
            size="small"
            onClick={() => setShowSteps((s) => !s)}
          >
            {showSteps ? "Hide steps" : totalPlanned ? `Agent steps ${numSteps}/${totalPlanned}` : `Agent steps ${numSteps}`}
          </Button>
        }
      />
      <Collapse in={showSteps} timeout="auto" unmountOnExit>
        <CardContent>
          {steps.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No steps yet.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {steps.map((s: ExploitAgentStep) => (
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
      </Collapse>
    </Card>
  );
}


