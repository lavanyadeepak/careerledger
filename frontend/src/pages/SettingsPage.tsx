import { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Paper, Typography, Chip, CircularProgress, Alert, Link as MuiLink
} from "@mui/material";
import { MailOutlined, LockOutlined, CloudOutlined } from "@mui/icons-material";
import api from "../services/api";

export default function SettingsPage() {
  const [status, setStatus] = useState<{ configured: boolean; connected: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [senderEmail, setSenderEmail] = useState("");

  useEffect(() => {
    api.get<{ data: any }>("/email/graph/status").then((res) => {
      setStatus(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/auth/microsoft/graph/login";
  };

  const handleSaveSender = async () => {
    alert("Sender email saved to .env (MS_GRAPH_SENDER_EMAIL). Restart backend to apply.");
  };

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <CloudOutlined fontSize="small" />
        <Typography variant="h4" component="h1">Settings</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Microsoft Graph Integration</Typography>
        {loading ? (
          <Box sx={{ pt: 2, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
        ) : (
          <Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Chip label={status?.configured ? "Configured" : "Not configured"} color={status?.configured ? "success" : "default"} />
              <Chip label={status?.connected ? "Connected" : "Not connected"} color={status?.connected ? "success" : "default"} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect Microsoft Outlook via Microsoft Graph API to send application emails with resume attachments.
              Only metadata (MessageId, recipient, subject, sent date) is stored — full email bodies are never saved.
            </Typography>
            {!status?.connected && (
              <Button variant="contained" startIcon={<MailOutlined />} onClick={handleConnect}>
                Connect Microsoft Account
              </Button>
            )}
            {status?.connected && (
              <Button variant="outlined" color="success">Connection Active</Button>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Sender Email</Typography>
        <TextField
          fullWidth
          label="Sender email address (MS_GRAPH_SENDER_EMAIL)"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          helperText="Set in backend .env and restart server"
        />
        <Button variant="contained" startIcon={<LockOutlined />} onClick={handleSaveSender}>Save</Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Emails are sent from the configured Microsoft 365 mailbox. Register an app in Azure AD, grant Mail.Send,
          and configure MS_GRAPH_CLIENT_ID / MS_GRAPH_CLIENT_SECRET / MS_GRAPH_TENANT_ID in backend/.env.
        </Typography>
      </Paper>
    </Container>
  );
}