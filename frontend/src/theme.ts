import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0",
      contrastText: "#fff",
    },
    secondary: {
      main: "#424242",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    error: {
      main: "#c62828",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ef6c00",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, Roboto, sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
});