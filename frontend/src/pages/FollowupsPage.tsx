import { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField, CircularProgress, Typography, Select, MenuItem, Tabs, Tab
} from "@mui/material";
import { Event, Schedule, ArrowRight, MailOutlined, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import api, { Followup } from "../services/api";

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box>{children}</Box> : null;
}

export default function FollowupsPage({ setSnack }: { setSnack: (msg: string) => void }) {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Followup | null>(null);
  const [form, setForm] = useState({ applicationId: "", followupDate: "", status: "Pending", notes: "" });

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    let kind = "all";
    if (tab === 0) kind = "overdue";
    if (tab === 1) kind = "today";
    if (tab === 2) kind = "upcoming";
    const res = await api.get<{ data: Followup[] }>("/followups", { params: { [kind]: "true" } });
    setFollowups(res.data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/followups/${editing.id}`, form);
        setSnack("Follow-up updated");
      } else {
        await api.post("/followups", form);
        setSnack("Follow-up created");
      }
      setOpen(false);
      setEditing(null);
      setForm({ applicationId: "", followupDate: "", status: "Pending", notes: "" });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save follow-up");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this follow-up?")) return;
    await api.delete(`/followups/${id}`);
    setSnack("Follow-up deleted");
    load();
  };

  const markSent = async (id: string) => {
    await api.put(`/followups/${id}`, { status: "Sent", sentDate: new Date().toISOString() });
    setSnack("Marked as sent");
    load();
  };

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Schedule fontSize="small" />
          <Typography variant="h4" component="h1">Follow-Ups</Typography>
        </Box>
        <Button variant="contained" startIcon={<MailOutlined />} onClick={() => { setEditing(null); setForm({ applicationId: "", followupDate: "", status: "Pending", notes: "" }); setOpen(true); }}>
          Add Follow-up
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overdue" icon={<Event />} />
        <Tab label="Today" icon={<Schedule />} />
        <Tab label="Next 7 Days" icon={<ArrowRight />} />
      </Tabs>

      {loading ? (
        <Box sx={{ pt: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Company / Recruiter</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell style={{ textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {followups.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.application?.position || "-"}</TableCell>
                  <TableCell>{f.application?.recruiter?.company || f.application?.recruiter?.name || "-"}</TableCell>
                  <TableCell>{new Date(f.followupDate).toLocaleDateString()}</TableCell>
                  <TableCell><Chip size="small" label={f.status} color={f.status === "Pending" ? "warning" : "success"} /></TableCell>
                  <TableCell>{f.notes || "-"}</TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {f.status === "Pending" && (
                      <Button size="small" variant="outlined" startIcon={<MailOutlined />} onClick={() => markSent(f.id)}>Mark Sent</Button>
                    )}
                    <IconButton size="small" onClick={() => { setForm({ applicationId: f.applicationId, followupDate: f.followupDate, status: f.status, notes: f.notes || "" }); setEditing(f); setOpen(true); }}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(f.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {followups.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No follow-ups</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Follow-up" : "Add Follow-up"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <form onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 400 }}>
            <MuiTextField select required fullWidth label="Application" value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })}>
              <MenuItem value="">Select application</MenuItem>
            </MuiTextField>
            <MuiTextField type="datetime-local" required fullWidth label="Follow-up Date" value={form.followupDate} onChange={(e) => setForm({ ...form, followupDate: e.target.value })} />
            <MuiTextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Sent">Sent</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Skipped">Skipped</MenuItem>
            </MuiTextField>
            <MuiTextField multiline rows={2} fullWidth label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" type="submit" form>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}