import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  const lightPalette = {
    mode: 'light' as const,
    primary: {
      main: '#2e7d32', // Forest Green
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffd700', // Gold
      contrastText: '#000000',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  };

  const darkPalette = {
    mode: 'dark' as const,
    primary: {
      main: '#4caf50', // Brighter green for dark mode
      light: '#81c784',
      dark: '#2e7d32',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffd700', // Gold
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a', // Darker navy
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  };

  return createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography: {
      fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '10px 24px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'light'
              ? '0px 2px 10px rgba(0, 0, 0, 0.05)'
              : '0px 4px 20px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            color: mode === 'light' ? '#1e293b' : '#f1f5f9',
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export default getTheme('dark'); // Keep dark as default export for backward compatibility

