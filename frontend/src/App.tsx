import React, { useState } from "react";
import {
  Box,
  Container,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout,
  DashboardCustomize,
  People,
  Description,
  ContactPage,
  Event,
  Assessment,
  Settings,
} from "@mui/icons-material";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

function AppContent() {
  const { accessToken, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const triggerSnack = (msg: string) => {
    setSnackMsg(msg);
    setSnackOpen(true);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const navItems: [string, string, React.ElementType][] = [
    ["/", "Dashboard", DashboardCustomize],
    ["/recruiters", "Recruiters", People],
    ["/templates", "Templates", Description],
    ["/resumes", "Resumes", ContactPage],
    ["/applications", "Applications", Assessment],
    ["/followups", "Follow-ups", Event],
    ["/settings", "Settings", Settings],
  ];

  const drawer = (
    <Drawer
      anchor="left"
      variant={isDesktop ? "permanent" : "temporary"}
      open={isDesktop || mobileOpen}
      onClose={() => setMobileOpen(false)}
      sx={{
        width: { md: 260 },
        flexShrink: { md: 0 },
        "& .MuiDrawer-paper": {
          width: 260,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar sx={{ pt: 1, pb: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700, color: theme.palette.primary.main }}
        >
          ResumeTracker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map(([path, label, Icon]) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={path}
              onClick={() => setMobileOpen(false)}
              sx={{
                color:
                  location.pathname === path
                    ? theme.palette.primary.main
                    : "inherit",
                "&.active": {
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );

  if (isLoading) return null;

  return (
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
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: "inherit" }}
          >
            ResumeTracker
          </Typography>
          {accessToken && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {accessToken && drawer}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { md: accessToken ? `calc(100% - 260px)` : "100%" },
        }}
      >
        <Container maxWidth="xl">
          {accessToken ? (
            <>
              <Snackbar
                open={snackOpen}
                autoHideDuration={3000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <Alert severity="success" onClose={() => setSnackOpen(false)}>
                  {snackMsg}
                </Alert>
              </Snackbar>
              <Routes>
                <Route path="/" element={<DashboardPage setSnack={triggerSnack} />} />
                <Route path="/recruiters" element={<RecruitersPage setSnack={triggerSnack} />} />
                <Route path="/templates" element={<TemplatesPage setSnack={triggerSnack} />} />
                <Route path="/resumes" element={<ResumesPage setSnack={triggerSnack} />} />
                <Route path="/applications" element={<ApplicationsPage setSnack={triggerSnack} />} />
                <Route path="/followups" element={<FollowupsPage setSnack={triggerSnack} />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
