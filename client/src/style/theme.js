import { createTheme } from "@mui/material/styles";

const sharedTheme = {
  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",

    h1: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },

    h2: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },

    h3: {
      fontWeight: 600,
    },

    h4: {
      fontWeight: 600,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    body1: {
      lineHeight: 1.6,
    },

    body2: {
      lineHeight: 1.6,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          paddingInline: 18,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
};

export const lightTheme = createTheme({
  ...sharedTheme,

  palette: {
    mode: "light",

    primary: {
      main: "#2563eb",
    },

    secondary: {
      main: "#059669",
    },

    success: {
      main: "#16a34a",
    },

    warning: {
      main: "#d97706",
    },

    error: {
      main: "#dc2626",
    },

    info: {
      main: "#0284c7",
    },

    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },

    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },

    divider: "#e2e8f0",
  },
});

export const darkTheme = createTheme({
  ...sharedTheme,

  palette: {
    mode: "dark",

    primary: {
      main: "#60a5fa",
    },

    secondary: {
      main: "#34d399",
    },

    success: {
      main: "#22c55e",
    },

    warning: {
      main: "#fbbf24",
    },

    error: {
      main: "#f87171",
    },

    info: {
      main: "#38bdf8",
    },

    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },

    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },

    divider: "#334155",
  },
});