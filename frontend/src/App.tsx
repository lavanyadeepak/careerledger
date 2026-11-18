import { useEffect, useState } from "react";
import { Box, Container, CssBaseline, Toolbar, AppBar, Typography, IconButton, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Snackbar, Alert } from "@mui/material";
import { Menu as MenuIcon, Logout, Home, People, Mail, Description, ContactPage, Event, DashboardCustomize, Assessment, Settings, FilterList, CloudDownload } from "@mui/icons-material";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { theme } from "./theme";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RecruitersPage from "./pages/RecruitersPage";
import TemplatesPage from "./pages/TemplatesPage";
import ResumesPage from "./pages/ResumesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import FollowupsPage from "./pages/FollowupsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const { user, accessToken, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const location = useLocation();

  const drawer = (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      sx={{ width: { md: 260 }, flexShrink: { md: 0 } }}
    >
      <Toolbar sx={{ pt: 1, pb: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: theme.palette.primary.main }}>
          ResumeTracker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {([["/", "Dashboard", DashboardCustomize], ["/recruiters", "Recruiters", People], ["/templates", "Templates", Description], ["/resumes", "Resumes", ContactPage], ["/applications", "Applications", Assessment], ["/followups", "Follow-ups", Event], ["/settings", "Settings", Settings]] as [string, string, React.ElementType][]).map(([path, label, Icon]) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={path}
              activeClassName="active"
              sx={{
                color: location.pathname === path ? theme.palette.primary.main : "inherit",
                "&.active": { fontWeight: 600, color: theme.palette.primary.main, backgroundColor: "#e3f2fd" },
              }}
            >
              <ListItemIcon><Icon /></ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { logout(); setMobileOpen(false); }}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );

  const handleLogout = () => { logout(); };

  if (isLoading) return null;

  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" sx={{ zIndex: { xs: 1200, md: 1100 } }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "inherit" }}>
              ResumeTracker
            </Typography>
            {accessToken && (
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            )}
          </Toolbar>
        </AppBar>
        {drawer}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 8, width: { md: `calc(100% - 260px)` } }}
        >
          <Container maxWidth="xl">
            {accessToken ? (
              <>
                <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                  <Alert severity="success" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
                </Snackbar>
                <Routes>
                  <Route path="/" element={<DashboardPage setSnack={setSnackMsg} />} />
                  <Route path="/recruiters" element={<RecruitersPage setSnack={setSnackMsg} />} />
                  <Route path="/templates" element={<TemplatesPage setSnack={setSnackMsg} />} />
                  <Route path="/resumes" element={<ResumesPage setSnack={setSnackMsg} />} />
                  <Route path="/applications" element={<ApplicationsPage setSnack={setSnackMsg} />} />
                  <Route path="/followups" element={<FollowupsPage setSnack={setSnackMsg} />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </>
            ) : (
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<NavigateToLogin />} />
              </Routes>
            )}
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

function NavigateToLogin() {
  return <Navigate to="/login" replace />;
}
