import { useState, useEffect } from "react";
import {
  Box, Container, TextField as MuiTextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Typography, MenuItem, Stack,
} from "@mui/material";
import { Add, Edit, Delete, MailOutlined, FilterList, CloudDownload } from "@mui/icons-material";
import api, { Application, Recruiter, Template, Resume, ApplicationStatus, ApplicationSource } from "../services/api";

export const noop = (_msg: string) => { /* noop, replaced by parent */ };

export default function ApplicationsPage({ setSnack }: { setSnack: (msg: string) => void }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  const [filter, setFilter] = useState({ company: "", recruiter: "", position: "", status: "", source: "", startDate: "", endDate: "" });

  const [form, setForm] = useState({
    recruiterId: "", templateId: "", templateVersion: "", resumeId: "", position: "", location: "",
    source: "DirectRecruiter" as ApplicationSource, appliedDate: "", status: "Draft" as ApplicationStatus,
    nextFollowupDate: "", remarks: "", mergeData: {},
  });

  useEffect(() => {
    Promise.all([
      api.get<{ data: Recruiter[] }>("/recruiters?limit=100"),
      api.get<{ data: Template[] }>("/templates?isActive=true"),
      api.get<{ data: Resume[] }>("/resumes"),
    ]).then(([r, t, re]) => {
      setRecruiters(r.data.data);
      setTemplates(t.data.data);
      setResumes(re.data.data);
      loadApplications();
    }).catch(() => setLoading(false));
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const res = await api.get<{ data: Application[]; pagination: any }>("/applications", { params: { ...filter, limit: 100 } });
    setApplications(res.data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        templateVersion: form.templateVersion ? parseInt(form.templateVersion) : undefined,
        appliedDate: form.appliedDate || new Date().toISOString(),
        nextFollowupDate: form.nextFollowupDate || undefined,
        mergeData: form.mergeData,
      };
      if (editing) {
        await api.put(`/applications/${editing.id}`, payload);
        setSnack("Application updated");
      } else {
        await api.post("/applications", payload);
        setSnack("Application created");
      }
      setOpen(false);
      setEditing(null);
      setForm({ recruiterId: "", templateId: "", templateVersion: "", resumeId: "", position: "", location: "", source: "DirectRecruiter", appliedDate: "", status: "Draft", nextFollowupDate: "", remarks: "", mergeData: {} });
      loadApplications();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save application");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this application?")) return;
    await api.delete(`/applications/${id}`);
    setSnack("Application deleted");
    loadApplications();
  };

  const statuses: ApplicationStatus[] = ["Draft", "Applied", "FollowupDue", "FollowupSent", "InterviewScheduled", "TechnicalRound", "HRRound", "OfferReceived", "Rejected", "Closed"];

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MailOutlined fontSize="small" />
          <Typography variant="h4" component="h1">Applications</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({ recruiterId: "", templateId: "", templateVersion: "", resumeId: "", position: "", location: "", source: "DirectRecruiter", appliedDate: "", status: "Draft", nextFollowupDate: "", remarks: "", mergeData: {} }); setOpen(true); }}>
            Add Application
          </Button>
          <Button startIcon={<CloudDownload />} href="/api/export/csv" target="_blank" rel="noopener">Export CSV</Button>
          <Button startIcon={<CloudDownload />} href="/api/export/excel" target="_blank" rel="noopener">Export Excel</Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <MuiTextField fullWidth label="Company" value={filter.company} onChange={(e) => setFilter({ ...filter, company: e.target.value })} size="small" sx={{ maxWidth: 200 }} />
        <MuiTextField fullWidth label="Recruiter" value={filter.recruiter} onChange={(e) => setFilter({ ...filter, recruiter: e.target.value })} size="small" sx={{ maxWidth: 200 }} />
        <MuiTextField fullWidth label="Position" value={filter.position} onChange={(e) => setFilter({ ...filter, position: e.target.value })} size="small" sx={{ maxWidth: 200 }} />
        <MuiTextField select fullWidth label="Status" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} size="small" sx={{ maxWidth: 200 }}>
          <MenuItem value="">All</MenuItem>
          {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </MuiTextField>
        <MuiTextField select fullWidth label="Source" value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })} size="small" sx={{ maxWidth: 200 }}>
          <MenuItem value="">All</MenuItem>
          {["LinkedIn", "Naukri", "Foundit", "Referral", "DirectRecruiter", "CompanyWebsite", "XTwitter", "WhatsApp"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </MuiTextField>
        <MuiTextField type="date" fullWidth label="From" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} size="small" sx={{ maxWidth: 200 }} InputLabelProps={{ shrink: true }} />
        <MuiTextField type="date" fullWidth label="To" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} size="small" sx={{ maxWidth: 200 }} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" startIcon={<FilterList />} onClick={loadApplications}>Filter</Button>
      </Box>

      {loading ? (
        <Box sx={{ pt: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Company / Recruiter</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied</TableCell>
                <TableCell>Next Follow-up</TableCell>
                <TableCell style={{ textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell><Typography component="span" variant="body2">{a.position}</Typography></TableCell>
                  <TableCell>{a.recruiter?.company || a.recruiter?.name || "-"}</TableCell>
                  <TableCell><Chip size="small" label={a.source || "DirectRecruiter"} /></TableCell>
                  <TableCell><Chip size="small" label={a.status} color={a.status === "OfferReceived" ? "success" : a.status === "Rejected" ? "error" : "default"} /></TableCell>
                  <TableCell>{new Date(a.appliedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{a.nextFollowupDate ? new Date(a.nextFollowupDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <IconButton size="small" onClick={() => { setEditing(a); setForm({ recruiterId: a.recruiterId, templateId: a.templateId || "", templateVersion: a.templateVersion?.toString() || "", resumeId: a.resumeId || "", position: a.position, location: a.location || "", source: (a.source as any) || "DirectRecruiter", appliedDate: a.appliedDate, status: a.status, nextFollowupDate: a.nextFollowupDate || "", remarks: a.remarks || "", mergeData: a.mergeData || {} }); setOpen(true); }}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No applications found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "Edit Application" : "Log New Application"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box component="form" id="application-form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 420 }}>
            <MuiTextField select required fullWidth label="Recruiter" value={form.recruiterId} onChange={(e) => setForm({ ...form, recruiterId: e.target.value })}>
              <MenuItem value="">Select recruiter</MenuItem>
              {recruiters.map((r) => <MenuItem key={r.id} value={r.id}>{r.name} - {r.company}</MenuItem>)}
            </MuiTextField>
            <MuiTextField select fullWidth label="Template (optional)" value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {templates.map((t) => <MenuItem key={t.id} value={t.id}>{t.templateName} (v{t.version})</MenuItem>)}
            </MuiTextField>
            <MuiTextField select fullWidth label="Resume (optional)" value={form.resumeId} onChange={(e) => setForm({ ...form, resumeId: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {resumes.map((r) => <MenuItem key={r.id} value={r.id}>{r.resumeName} (v{r.version}) {r.isDefault ? "- default" : ""}</MenuItem>)}
            </MuiTextField>
            <MuiTextField required fullWidth label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            <MuiTextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <MuiTextField select fullWidth label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as ApplicationSource })}>
              {["LinkedIn", "Naukri", "Foundit", "Referral", "DirectRecruiter", "CompanyWebsite", "XTwitter", "WhatsApp"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </MuiTextField>
            <MuiTextField select required fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </MuiTextField>
            <MuiTextField type="date" fullWidth label="Applied Date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} />
            <MuiTextField type="date" fullWidth label="Next Follow-up Date (auto: applied + 7 days)" value={form.nextFollowupDate} onChange={(e) => setForm({ ...form, nextFollowupDate: e.target.value })} />
            <MuiTextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            <Typography component="span" variant="caption">Follow-up defaults to Applied + 7 days when not specified.</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" type="submit" form="application-form">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}