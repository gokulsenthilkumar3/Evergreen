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
    warning: {
      main: '#f59e0b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f1f5f9', // Slate 900 / Slate 100 (slightly darker)
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',   // Slate 800 / White
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#475569',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.07)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { letterSpacing: '-0.01em', fontWeight: 500 },
    subtitle2: { letterSpacing: '-0.005em', fontWeight: 600 },
    body1: { letterSpacing: '-0.005em' },
    body2: { letterSpacing: '-0.005em' },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
    overline: { letterSpacing: '0.1em', fontWeight: 700 },
    caption: { letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    mode === 'dark'
      ? '0 1px 3px rgba(0,0,0,0.4)'
      : '0 1px 3px rgba(0,0,0,0.06)',
    mode === 'dark'
      ? '0 4px 6px -1px rgba(0,0,0,0.4)'
      : '0 4px 6px -1px rgba(0,0,0,0.05)',
    mode === 'dark'
      ? '0 8px 16px -2px rgba(0,0,0,0.5)'
      : '0 8px 16px -2px rgba(0,0,0,0.06)',
    mode === 'dark'
      ? '0 12px 24px -4px rgba(0,0,0,0.6)'
      : '0 12px 24px -4px rgba(0,0,0,0.07)',
    mode === 'dark'
      ? '0 16px 32px -4px rgba(0,0,0,0.65)'
      : '0 16px 32px -4px rgba(0,0,0,0.08)',
    mode === 'dark'
      ? '0 20px 40px -6px rgba(0,0,0,0.70)'
      : '0 20px 40px -6px rgba(0,0,0,0.09)',
    // remaining shadows padding — 25 total (indices 0–24)
    ...Array(18).fill(mode === 'dark'
      ? '0 24px 48px -8px rgba(0,0,0,0.75)'
      : '0 24px 48px -8px rgba(0,0,0,0.10)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#334155 #0f172a' : '#cbd5e1 #f1f5f9',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
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
          borderRadius: 10,
          padding: '9px 22px',
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'dark'
              ? '0 8px 16px -4px rgba(0,0,0,0.4)'
              : '0 8px 16px -4px rgba(0,0,0,0.12)',
          },
          '&:active': {
            transform: 'translateY(0)',
          }
        },
        sizeSmall: {
          padding: '5px 14px',
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: mode === 'dark'
            ? '0 4px 12px -2px rgba(16, 185, 129, 0.35)'
            : '0 4px 12px -2px rgba(5, 150, 105, 0.25)',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 8px 20px -4px rgba(16, 185, 129, 0.45)'
              : '0 8px 20px -4px rgba(5, 150, 105, 0.35)',
          }
        },
        containedSecondary: {
          boxShadow: mode === 'dark'
            ? '0 4px 12px -2px rgba(99, 102, 241, 0.35)'
            : '0 4px 12px -2px rgba(79, 70, 229, 0.25)',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 8px 20px -4px rgba(99, 102, 241, 0.45)'
              : '0 8px 20px -4px rgba(79, 70, 229, 0.35)',
          }
        },
        outlinedPrimary: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(5, 150, 105, 0.04)',
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
            ? '0 4px 24px -1px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.03)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
        elevation3: {
          boxShadow: mode === 'dark'
            ? '0 10px 40px -4px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        }
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)'}`,
          color: mode === 'dark' ? '#f1f5f9' : '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#0d1526' : '#ffffff',
          borderRight: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: mode === 'dark'
            ? '0 4px 24px -1px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.03)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        }
      }
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
          minHeight: 40,
          fontWeight: 600,
          borderRadius: 10,
          margin: '0 4px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.09)',
            color: mode === 'dark' ? '#34d399' : '#059669',
          },
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          }
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
          color: mode === 'dark' ? '#94a3b8' : '#64748b',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? '#10b981' : '#059669',
          },
        },
        notchedOutline: {
          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: mode === 'dark' ? '#1e293b' : '#0f172a',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none',
        },
        arrow: {
          color: mode === 'dark' ? '#1e293b' : '#0f172a',
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          mx: 1,
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    }
  },
});

export default getTheme;
