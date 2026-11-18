import { useEffect, useState } from "react";
import {
  Box, Container, Grid, Typography, Card, CardContent, CardHeader, Chip, Button, Link as MuiLink, CircularProgress
} from "@mui/material";
import {
  DashboardCustomize as DashboardIcon,
  People as PeopleIcon,
  Mail as MailIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  ArrowRight,
} from "@mui/icons-material";
import { Bar, Pie } from "react-chartjs-2";
import api, { DashboardStats, FollowupGroup, MonthStat, CompanyStat, StatusDist, Followup } from "../services/api";

export default function DashboardPage({ setSnack }: { setSnack: (msg: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [followups, setFollowups] = useState<FollowupGroup>({ overdue: [], today: [], upcoming: [] });
  const [months, setMonths] = useState<MonthStat[]>([]);
  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: DashboardStats }>("/dashboard/stats"),
      api.get<{ data: FollowupGroup }>("/dashboard/followups"),
      api.get<{ data: MonthStat[] }>("/dashboard/charts/applications-by-month"),
      api.get<{ data: CompanyStat[] }>("/dashboard/charts/company-wise"),
      api.get<{ data: StatusDist[] }>("/dashboard/charts/status-distribution"),
    ]).then(([s, f, m, c, sd]) => {
      setStats(s.data.data);
      setFollowups(f.data.data);
      setMonths(m.data.data);
      setCompanies(c.data.data);
      setStatusDist(sd.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const monthChartData = {
    labels: months.map((m) => m.month),
    datasets: [{ label: "Applications", data: months.map((m) => m.count), backgroundColor: "#1565c0" }],
  };
  const statusChartData = {
    labels: statusDist.map((s) => s.status),
    datasets: [{ data: statusDist.map((s) => s.count), backgroundColor: ["#1565c0", "#424242", "#ef6c00", "#2e7d32", "#c62828"] }],
  };

  if (loading) return (
    <Container sx={{ pt: 4, minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CircularProgress />
    </Container>
  );

  return (
    <Container sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>Dashboard</Typography>
      </Box>

      {stats && (
        <Grid container spacing={2} mb={4}>
          {([["Applications Sent", stats.totalApplications, MailIcon], ["Interviews", stats.interviewsScheduled, AssessmentIcon], ["Offers", stats.offersReceived, PeopleIcon], ["Rejections", stats.rejections, AssessmentIcon], ["Pending Followups", stats.pendingFollowups, EventIcon]] as [string, number, React.ElementType][]).map(([label, value, Icon]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="p">{label}</Typography>
                  <Typography variant="h4" component="p">{value}</Typography>
                </CardContent>
                <Icon sx={{ fontSize: 40, color: "primary.main" }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2 }}>
            <CardHeader title="Applications by Month" action={<Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Last 12 months</Box>} />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ height: 300, width: "100%" }}><Bar data={monthChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2 }}>
            <CardHeader title="Status Distribution" />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ height: 300, width: "100%" }}><Pie data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} /></Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2 }}>
            <CardHeader title="Company-wise Applications" />
            <CardContent sx={{ pt: 0, maxHeight: 400, overflow: "auto" }}>
              {companies.map((c) => (
                <Box key={c.company} sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="body2" component="span">{c.company}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.recruiter}</Typography>
                  </Box>
                  <Chip label={c.count} size="small" color="primary" />
                </Box>
              ))}
              {companies.length === 0 && <Typography color="text.secondary">No data</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2 }}>
            <CardHeader title="Follow-Up Engine" action={<Chip label={followups.overdue.length + followups.today.length + followups.upcoming.length} size="small" color={followups.overdue.length ? "error" : "default"} />} />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip label={`Overdue: ${followups.overdue.length}`} color="error" size="small" variant={followups.overdue.length ? "filled" : "outlined"} />
                <Chip label={`Today: ${followups.today.length}`} color="warning" size="small" variant={followups.today.length ? "filled" : "outlined"} />
                <Chip label={`Next 7 days: ${followups.upcoming.length}`} color="info" size="small" variant={followups.upcoming.length ? "filled" : "outlined"} />
              </Box>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {[...followups.overdue, ...followups.today, ...followups.upcoming].slice(0, 8).map((f) => (
                  <Box key={f.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 1, mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="body2" component="span">{f.application?.position}</Typography>
                      <Typography variant="caption" color="text.secondary">{f.application?.recruiter?.company || f.application?.recruiter?.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{new Date(f.followupDate).toLocaleDateString()}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button size="small" component={MuiLink} href="/followups">View all follow-ups <ArrowRight /></Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
