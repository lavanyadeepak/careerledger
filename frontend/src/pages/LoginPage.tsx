import { useState } from "react";
import { Box, Container, Paper, Avatar, Typography, TextField, Button, FormControl, FormHelperText, Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LockOutlined, EmailOutlined, PersonOutlined } from "@mui/icons-material";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, display: "flex", flexDirection: "column", gap: 3 }}>
        <Avatar sx={{ m: "auto", bgcolor: "primary.primary" }}><LockOutlined /></Avatar>
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>Welcome back</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            required
            fullWidth
            name="email"
            label="Email Address"
            type="email"
            autoFocus
            startAdornment={<EmailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            startAdornment={<PersonOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl>
            <FormHelperText>
              Default seed credentials: user@example.com / ChangeMe123!
            </FormHelperText>
          </FormControl>
          <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2, color: "text.secondary" }}>
          Don't have an account?{" "}
          <Link component="button" href="/register" sx={{ color: "primary.main", cursor: "pointer", fontWeight: 600 }}>
            Create one
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}