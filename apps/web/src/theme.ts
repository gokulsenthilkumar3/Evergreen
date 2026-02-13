import { createTheme, type PaletteMode } from '@mui/material/styles';

const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2e7d32', // Forest Green
      light: '#60ad5e',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffd700', // Gold
      contrastText: '#000000',
    },
    background: {
      default: mode === 'dark' ? '#071421' : '#f8fafc',
      paper: mode === 'dark' ? '#0a1929' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f3f6f9' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#071421' : '#f8fafc',
          color: mode === 'dark' ? '#f3f6f9' : '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'dark'
            ? '0px 4px 20px rgba(0, 0, 0, 0.4)'
            : '0px 2px 10px rgba(0, 0, 0, 0.05)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#0a1929' : '#ffffff',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          color: mode === 'dark' ? '#f3f6f9' : '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#0a1929' : '#ffffff',
          borderRight: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
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
