import { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField, CircularProgress, Typography
} from "@mui/material";
import { Add, Edit, Delete, Search, Person } from "@mui/icons-material";
import api, { Recruiter } from "../services/api";
import { MenuItem } from "@mui/material";

export default function RecruitersPage({ setSnack }: { setSnack: (msg: string) => void }) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recruiter | null>(null);
  const [form, setForm] = useState({ name: "", email: "", designation: "", company: "", linkedInUrl: "", phone: "", source: "DirectRecruiter" as const, notes: "" });

  useEffect(() => { load(); }, [search]);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ data: Recruiter[]; pagination: any }>("/recruiters", { params: { search } });
    setRecruiters(res.data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/recruiters/${editing.id}`, form);
        setSnack("Recruiter updated");
      } else {
        await api.post("/recruiters", form);
        setSnack("Recruiter created");
      }
      setOpen(false);
      setEditing(null);
      setForm({ name: "", email: "", designation: "", company: "", linkedInUrl: "", phone: "", source: "DirectRecruiter", notes: "" });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save recruiter");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this recruiter?")) return;
    await api.delete(`/recruiters/${id}`);
    setSnack("Recruiter deleted");
    load();
  };

  const sources = ["LinkedIn", "Naukri", "Foundit", "Referral", "DirectRecruiter", "CompanyWebsite", "XTwitter", "WhatsApp"];

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person fontSize="small" />
          <Typography variant="h4" component="h1">Recruiters</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({ name: "", email: "", designation: "", company: "", linkedInUrl: "", phone: "", source: "DirectRecruiter", notes: "" }); setOpen(true); }}>
          Add Recruiter
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <TextField fullWidth sm={12} md="auto" label="Search name, email, company" value={search} onChange={(e) => setSearch(e.target.value)} startAdornment={<Search />} size="small" />
      </Box>

      {loading ? (
        <Box sx={{ pt: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Source</TableCell>
                <TableCell style={{ textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recruiters.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell><Typography component="span" variant="body2">{r.name}</Typography></TableCell>
                  <TableCell>{r.company || "-"}</TableCell>
                  <TableCell>{r.designation || "-"}</TableCell>
                  <TableCell>{r.email || "-"}</TableCell>
                  <TableCell>{r.phone || "-"}</TableCell>
                  <TableCell><Chip size="small" label={r.source || "DirectRecruiter"} /></TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <IconButton size="small" onClick={() => { setForm({ name: r.name, email: r.email || "", designation: r.designation || "", company: r.company || "", linkedInUrl: r.linkedInUrl || "", phone: r.phone || "", source: (r.source as any) || "DirectRecruiter", notes: r.notes || "" }); setEditing(r); setOpen(true); }}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {recruiters.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No recruiters found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Recruiter" : "Add Recruiter"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <form onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>
            <MuiTextField required fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <MuiTextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <MuiTextField fullWidth label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            <MuiTextField fullWidth label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <MuiTextField fullWidth label="LinkedIn URL" value={form.linkedInUrl} onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })} />
            <MuiTextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <MuiTextField select fullWidth label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as any })}>
              {sources.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
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