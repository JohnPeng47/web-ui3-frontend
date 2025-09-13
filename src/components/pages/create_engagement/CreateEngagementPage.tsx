import { useState } from "react";
import { Box, Button, Card, CardContent, CardHeader, Container, Stack, TextField, Typography } from "@mui/material";
import type { EngagementCreate } from "../../../api/engagement/types";
import { http } from "../../../api/http";
import { useNavigate } from "react-router-dom";

export default function CreateEngagementPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<EngagementCreate>({ name: "", base_url: "", description: "", scopes_data: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await http.createEngagement(form);
      // Navigate to dashboard with engagementId
      navigate(`/dashboard/${created.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create engagement";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box width="100%">
        <Card variant="outlined">
          <CardHeader title={<Typography variant="h6">Create Engagement</Typography>} />
          <CardContent>
            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2} alignItems="stretch">
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Base URL"
                  value={form.base_url}
                  onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  multiline
                  minRows={2}
                  fullWidth
                />
                {error ? (
                  <Typography color="error" variant="body2">{error}</Typography>
                ) : null}
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}


