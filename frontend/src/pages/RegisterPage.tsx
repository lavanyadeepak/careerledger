import { useState } from "react";
import { Box, Container, Paper, Avatar, Typography, TextField, Button, Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LockOutlined, EmailOutlined, PersonOutlined } from "@mui/icons-material";
import api from "../services/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, name });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400, display: "flex", flexDirection: "column", gap: 3 }}>
        <Avatar sx={{ m: "auto", bgcolor: "secondary.main" }}><PersonOutlined /></Avatar>
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>Create Account</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            required
            fullWidth
            name="name"
            label="Full Name"
            autoFocus
            startAdornment={<PersonOutlined />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            required
            fullWidth
            name="email"
            label="Email Address"
            type="email"
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
            startAdornment={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2, color: "text.secondary" }}>
          Already have an account?{" "}
          <Link component="button" href="/login" sx={{ color: "primary.main", cursor: "pointer", fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}