import { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField, CircularProgress, Typography
} from "@mui/material";
import { Add, Edit, Delete, Description, CloudUpload } from "@mui/icons-material";
import api, { Resume } from "../services/api";

export default function ResumesPage({ setSnack }: { setSnack: (msg: string) => void }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [form, setForm] = useState({ resumeName: "", version: "1.0", filePath: "", isDefault: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ data: Resume[] }>("/resumes");
    setResumes(res.data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/resumes/${editing.id}`, form);
        setSnack("Resume updated");
      } else {
        await api.post("/resumes", form);
        setSnack("Resume added");
      }
      setOpen(false);
      setEditing(null);
      setForm({ resumeName: "", version: "1.0", filePath: "", isDefault: false });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save resume");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resume?")) return;
    await api.delete(`/resumes/${id}`);
    setSnack("Resume deleted");
    load();
  };

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CloudUpload fontSize="small" />
          <Typography variant="h4" component="h1">Resume Repository</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({ resumeName: "", version: "1.0", filePath: "", isDefault: false }); setOpen(true); }}>
          Add Resume
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
                <TableCell>Version</TableCell>
                <TableCell>File Path</TableCell>
                <TableCell>Default</TableCell>
                <TableCell style={{ textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resumes.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.resumeName}</TableCell>
                  <TableCell>{r.version}</TableCell>
                  <TableCell>{r.filePath}</TableCell>
                  <TableCell><Chip size="small" label={r.isDefault ? "Yes" : "No"} color={r.isDefault ? "primary" : "default"} /></TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <IconButton size="small" onClick={() => { setForm({ resumeName: r.resumeName, version: r.version, filePath: r.filePath, isDefault: r.isDefault }); setEditing(r); setOpen(true); }}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {resumes.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No resumes found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Resume" : "Add Resume"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <form onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 400 }}>
            <MuiTextField required fullWidth label="Resume Name" value={form.resumeName} onChange={(e) => setForm({ ...form, resumeName: e.target.value })} />
            <MuiTextField fullWidth label="Version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            <MuiTextField required fullWidth label="File Path (e.g. ./uploads/resumes/architect.pdf)" value={form.filePath} onChange={(e) => setForm({ ...form, filePath: e.target.value })} />
            <Typography component="span" variant="caption">Only metadata (path) is stored; files live on disk.</Typography>
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