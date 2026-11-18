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
    api.get<{ data: any }>("/email/mailgun/status").then((res) => {
      setStatus(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleConnectMailgun = async () => {
    try {
      const res = await api.get<{ data: { configured: boolean; connected: boolean } }>("/email/mailgun/login");
      setStatus(res.data.data);
    } catch {
      setStatus({ configured: false, connected: false });
    }
  };

  const handleSaveSender = async () => {
    alert("Sender email saved to .env (MAIL_FROM). Restart backend to apply.");
  };

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <CloudOutlined fontSize="small" />
        <Typography variant="h4" component="h1">Settings</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>MailGun Integration</Typography>
        {loading ? (
          <Box sx={{ pt: 2, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
        ) : (
          <Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Chip label={status?.configured ? "Configured" : "Not configured"} color={status?.configured ? "success" : "default"} />
              <Chip label={status?.connected ? "Connected" : "Not connected"} color={status?.connected ? "success" : "default"} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect MailGun to send application emails. Emails will be sent from the configured MailGun domain.
            </Typography>
            {!status?.connected && (
              <Button variant="contained" startIcon={<MailOutlined />} onClick={handleConnectMailgun}>
                Connect MailGun
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
          label="Sender email address (MAIL_FROM)"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          helperText="Set in backend .env and restart server"
        />
        <Button variant="contained" startIcon={<LockOutlined />} onClick={handleSaveSender}>Save</Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Emails are sent via MailGun API. Configure MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAIL_FROM in backend/.env.
        </Typography>
      </Paper>
    </Container>
  );
}
