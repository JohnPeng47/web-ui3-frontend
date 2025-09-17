import { Box, Card, CardContent, CardHeader, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface ExploitStep {
  step_num: number;
  reflection: string;
  script: string;
  execution_output: string;
}

export interface AgentCardProps {
  id: string;
  name: string;
  steps: ExploitStep[];
}

export default function AgentCard({ id, name, steps }: AgentCardProps) {
  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title={name}
        subheader={`Agent ID: ${id} • ${steps.length} steps`}
      />
      <CardContent>
        {steps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No steps yet.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {steps.map((s: ExploitStep) => (
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
}


