import React, { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Paper, Typography, Select, MenuItem, Alert,
} from "@mui/material";
import api from "../services/api";

interface Template {
  id: string;
  templateName: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export default function QuickApplyPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    to: "",
    cc: "",
    templateId: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    api.get<{ data: Template[] }>("/templates?isActive=true").then((res) => {
      setTemplates(res.data.data || []);
    }).catch(() => { });
  }, []);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setForm({
      ...form,
      templateId,
      subject: template ? template.subjectTemplate : form.subject,
      body: template ? template.bodyTemplate : form.body,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSending(true);
    try {
      const res = await api.post<{
        message: string;
        messageId: string;
        recruiters: Array<{ id: string; email: string }>;
        applicationIds: string[];
      }>("/email/quick-apply", {
        to: form.to,
        cc: form.cc,
        subject: form.subject,
        body: form.body,
        templateId: form.templateId || undefined,
      });
      setStatus({
        type: "success",
        message: `${res.data.message} — ${res.data.recruiters.length} recruiter(s) saved and a follow-up scheduled.`,
      });
      setForm({ to: "", cc: "", templateId: "", subject: "", body: "" });
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Failed to send Quick Apply email",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ pt: 4 }}>
        <Typography variant="h4" component="h1">Quick Apply</Typography>
      </Box>

      {status && (
        <Alert severity={status.type} sx={{ mb: 2 }} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Send Quick Apply Email</Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Recipients are automatically saved as recruiters, and a follow-up is scheduled 7 days out.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 600 }}>
          <TextField
            fullWidth
            label="To (comma-separated emails)"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            helperText="e.g., recruiter1@company.com, recruiter2@company.com"
          />
          <TextField
            fullWidth
            label="Cc (comma-separated emails)"
            value={form.cc}
            onChange={(e) => setForm({ ...form, cc: e.target.value })}
            helperText="e.g., hiring.manager@company.com"
          />

          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Optional: Select a template for pre-filled Subject and Body
          </Typography>

          <Select
            fullWidth
            value={form.templateId}
            onChange={(e) => handleTemplateChange(e.target.value as string)}
          >
            <MenuItem value="">-- Select Template --</MenuItem>
            {templates.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.templateName}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Body (optional - will use template if selected)"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Enter email body content..."
          />

          <Button type="submit" variant="contained" disabled={sending} sx={{ mt: 2 }}>
            {sending ? "Sending..." : "Apply & Send Email"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
