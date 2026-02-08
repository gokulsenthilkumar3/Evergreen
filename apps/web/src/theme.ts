import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2e7d32', // Forest Green
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffd700', // Gold
      contrastText: '#000000',
    },
    background: {
      default: '#0a1929', // Deep navy
      paper: '#132f4c',
    },
    text: {
      primary: '#f3f6f9',
      secondary: '#b2bac2',
    },
  },
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
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
        },
      },
    },
  },
});

export default theme;
