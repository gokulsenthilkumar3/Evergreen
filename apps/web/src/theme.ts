import { createTheme, type PaletteMode } from '@mui/material/styles';

const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#10b981' : '#059669', // Emerald
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1', // Indigo 500
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0ea5e9', // Sky 500
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc', // Slate 900 / Slate 50
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',   // Slate 800 / White
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { letterSpacing: '-0.01em' },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#334155 #0f172a' : '#cbd5e1 #f8fafc',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: mode === 'dark' ? '#0f172a' : '#f8fafc',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'dark' ? '#334155' : '#cbd5e1',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#475569' : '#94a3b8',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 28px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1.5px)',
          },
        },
        containedPrimary: {
          boxShadow: mode === 'dark'
            ? '0 8px 16px -4px rgba(16, 185, 129, 0.3)'
            : '0 8px 16px -4px rgba(5, 150, 105, 0.2)',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 12px 20px -4px rgba(16, 185, 129, 0.4)'
              : '0 12px 20px -4px rgba(5, 150, 105, 0.3)',
            backgroundColor: mode === 'dark' ? '#34d399' : '#047857',
          }
        },
        containedSecondary: {
          boxShadow: mode === 'dark'
            ? '0 8px 16px -4px rgba(99, 102, 241, 0.3)'
            : '0 8px 16px -4px rgba(79, 70, 229, 0.2)',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 12px 20px -4px rgba(99, 102, 241, 0.4)'
              : '0 12px 20px -4px rgba(79, 70, 229, 0.3)',
            backgroundColor: mode === 'dark' ? '#818cf8' : '#4338ca',
          }
        },
        outlinedPrimary: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.03)',
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          boxShadow: mode === 'dark'
            ? '0 4px 24px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px -1px rgba(0, 0, 0, 0.03)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.03)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
          borderRight: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 44,
          fontWeight: 600,
          borderRadius: 10,
          margin: '0 4px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
            color: mode === 'dark' ? '#34d399' : '#059669',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
        },
      },
    },
  },
});

export default getTheme;
