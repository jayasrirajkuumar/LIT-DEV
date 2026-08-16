import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6F2DBD",
      light: "#8E44D9",
      dark: "#35145C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#A66CFF",
      light: "#C4A0FF",
      dark: "#6F2DBD",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0288d1",
      light: "#03a9f4",
      dark: "#01579b",
      contrastText: "#ffffff",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
      dark: "#16a34a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#171717",
      paper: "#202020",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B8B8B8",
      disabled: "#777777",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          transition: "all 0.3s ease",
        },
        contained: {
          background: "linear-gradient(135deg, #4A1975, #6F2DBD)",
          border: "1px solid rgba(166, 108, 255, 0.45)",
          boxShadow: "0 4px 15px rgba(111, 45, 189, 0.15)",
          "&:hover": {
            background: "linear-gradient(135deg, #35145C, #4A1975)",
            boxShadow: "0 6px 20px rgba(111, 45, 189, 0.22)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: "rgba(142, 68, 217, 0.65)",
          color: "#FFFFFF",
          "&:hover": {
            background: "rgba(111, 45, 189, 0.12)",
            borderColor: "#8E44D9",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#202020",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#202020",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#1A1A1A",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.10)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(142, 68, 217, 0.35)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8E44D9",
              boxShadow: "0 0 0 2px rgba(142, 68, 217, 0.12)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
