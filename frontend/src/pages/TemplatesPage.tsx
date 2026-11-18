import { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField, CircularProgress, Typography, Switch, FormControlLabel
} from "@mui/material";
import { Add, Edit, Delete, Description, MailOutlined } from "@mui/icons-material";
import api, { Template } from "../services/api";
import { MenuItem } from "@mui/material";

export default function TemplatesPage({ setSnack }: { setSnack: (msg: string) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ templateName: "", subjectTemplate: "", bodyTemplate: "", version: 1, isActive: true });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ data: Template[] }>("/templates");
    setTemplates(res.data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/templates/${editing.id}`, form);
        setSnack("Template updated");
      } else {
        await api.post("/templates", form);
        setSnack("Template created");
      }
      setOpen(false);
      setEditing(null);
      setForm({ templateName: "", subjectTemplate: "", bodyTemplate: "", version: 1, isActive: true });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this template?")) return;
    await api.delete(`/templates/${id}`);
    setSnack("Template deleted");
    load();
  };

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MailOutlined fontSize="small" />
          <Typography variant="h4" component="h1">Email Templates</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({ templateName: "", subjectTemplate: "", bodyTemplate: "", version: 1, isActive: true }); setOpen(true); }}>
          Add Template
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ pt: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Active</TableCell>
                <TableCell style={{ textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.templateName}</TableCell>
                  <TableCell>{t.subjectTemplate}</TableCell>
                  <TableCell>{t.version}</TableCell>
                  <TableCell><Chip size="small" label={t.isActive ? "Active" : "Inactive"} color={t.isActive ? "success" : "default"} /></TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <IconButton size="small" onClick={() => { setForm({ templateName: t.templateName, subjectTemplate: t.subjectTemplate, bodyTemplate: t.bodyTemplate, version: t.version, isActive: t.isActive }); setEditing(t); setOpen(true); }}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No templates found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "Edit Template" : "Add Template"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <form onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 400 }}>
            <MuiTextField required fullWidth label="Template Name" value={form.templateName} onChange={(e) => setForm({ ...form, templateName: e.target.value })} />
            <MuiTextField required fullWidth label="Subject Template (use {RecruiterName}, {Company}, {Position}, {Location})" value={form.subjectTemplate} onChange={(e) => setForm({ ...form, subjectTemplate: e.target.value })} />
            <MuiTextField required multiline rows={6} fullWidth label="Body Template" value={form.bodyTemplate} onChange={(e) => setForm({ ...form, bodyTemplate: e.target.value })} />
            <MuiTextField type="number" fullWidth label="Version" value={form.version} onChange={(e) => setForm({ ...form, version: parseInt(e.target.value) || 1 })} />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
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