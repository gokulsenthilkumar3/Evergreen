import { createTheme, type PaletteMode } from '@mui/material/styles';

export type ThemeName = 'emerald' | 'forest' | 'mint' | 'sage' | 'olive';

interface ThemePalette {
  primaryMain: string;
  primaryLight: string;
  primaryDark: string;
  bgDefault: string;
  bgPaper: string;
  bgDefaultDark: string;
  bgPaperDark: string;
}

const themePalettes: Record<ThemeName, ThemePalette> = {
  emerald: {
    primaryMain: '#059669',
    primaryLight: '#34d399',
    primaryDark: '#047857',
    bgDefault: '#f1f5f9',
    bgPaper: '#ffffff',
    bgDefaultDark: '#0f172a',
    bgPaperDark: '#1e293b',
  },
  forest: {
    primaryMain: '#2d6a4f',
    primaryLight: '#52b788',
    primaryDark: '#1b4332',
    bgDefault: '#f0f4f1',
    bgPaper: '#ffffff',
    bgDefaultDark: '#0d1b12',
    bgPaperDark: '#1a2e1e',
  },
  mint: {
    primaryMain: '#00897b',
    primaryLight: '#4db6ac',
    primaryDark: '#00695c',
    bgDefault: '#f0faf9',
    bgPaper: '#ffffff',
    bgDefaultDark: '#0d1f1d',
    bgPaperDark: '#1a3330',
  },
  sage: {
    primaryMain: '#558b6e',
    primaryLight: '#87bba2',
    primaryDark: '#3a6b52',
    bgDefault: '#f3f7f4',
    bgPaper: '#ffffff',
    bgDefaultDark: '#121c16',
    bgPaperDark: '#1e2e24',
  },
  olive: {
    primaryMain: '#6a7c59',
    primaryLight: '#9aad84',
    primaryDark: '#4f5e40',
    bgDefault: '#f4f5f1',
    bgPaper: '#ffffff',
    bgDefaultDark: '#161a10',
    bgPaperDark: '#252b1c',
  },
};

const getTheme = (mode: PaletteMode, themeName: ThemeName = 'emerald') => {
  const p = themePalettes[themeName];
  const isDark = mode === 'dark';
  const primary = isDark
    ? { main: p.primaryLight, light: p.primaryMain, dark: p.primaryDark }
    : { main: p.primaryMain, light: p.primaryLight, dark: p.primaryDark };

  return createTheme({
    palette: {
      mode,
      primary: { ...primary, contrastText: '#ffffff' },
      secondary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      info:    { main: '#0ea5e9', contrastText: '#ffffff' },
      warning: { main: '#f59e0b', contrastText: '#ffffff' },
      error:   { main: '#ef4444', contrastText: '#ffffff' },
      success: { main: '#10b981', contrastText: '#ffffff' },
      background: {
        default: isDark ? p.bgDefaultDark : p.bgDefault,
        paper:   isDark ? p.bgPaperDark   : p.bgPaper,
      },
      text: {
        primary:   isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.07)',
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
      body1:  { letterSpacing: '-0.005em' },
      body2:  { letterSpacing: '-0.005em' },
      button: { fontWeight: 600, letterSpacing: '0.01em' },
      overline: { letterSpacing: '0.1em', fontWeight: 700 },
      caption: { letterSpacing: '0.02em' },
    },
    shape: { borderRadius: 14 },
    shadows: [
      'none',
      isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
      isDark ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
      isDark ? '0 8px 16px -2px rgba(0,0,0,0.5)' : '0 8px 16px -2px rgba(0,0,0,0.06)',
      isDark ? '0 12px 24px -4px rgba(0,0,0,0.6)' : '0 12px 24px -4px rgba(0,0,0,0.07)',
      isDark ? '0 16px 32px -4px rgba(0,0,0,0.65)' : '0 16px 32px -4px rgba(0,0,0,0.08)',
      isDark ? '0 20px 40px -6px rgba(0,0,0,0.70)' : '0 20px 40px -6px rgba(0,0,0,0.09)',
      ...Array(18).fill(isDark ? '0 24px 48px -8px rgba(0,0,0,0.75)' : '0 24px 48px -8px rgba(0,0,0,0.10)'),
    ] as any,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#334155 #0f172a' : '#cbd5e1 #f1f5f9',
            '&::-webkit-scrollbar': { width: '8px', height: '8px' },
            '&::-webkit-scrollbar-track': { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#334155' : '#cbd5e1',
              borderRadius: '10px',
              '&:hover': { backgroundColor: isDark ? '#475569' : '#94a3b8' },
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
              boxShadow: isDark ? '0 8px 16px -4px rgba(0,0,0,0.4)' : '0 8px 16px -4px rgba(0,0,0,0.12)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          sizeSmall: { padding: '5px 14px', borderRadius: 8 },
          containedPrimary: {
            boxShadow: isDark
              ? `0 4px 12px -2px ${primary.main}55`
              : `0 4px 12px -2px ${primary.main}40`,
            '&:hover': {
              boxShadow: isDark
                ? `0 8px 20px -4px ${primary.main}66`
                : `0 8px 20px -4px ${primary.main}55`,
            },
          },
          containedSecondary: {
            boxShadow: isDark ? '0 4px 12px -2px rgba(99, 102, 241, 0.35)' : '0 4px 12px -2px rgba(79, 70, 229, 0.25)',
            '&:hover': {
              boxShadow: isDark ? '0 8px 20px -4px rgba(99, 102, 241, 0.45)' : '0 8px 20px -4px rgba(79, 70, 229, 0.35)',
            },
          },
          outlinedPrimary: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: isDark ? `${primary.main}10` : `${primary.main}08`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            boxShadow: isDark
              ? '0 4px 24px -1px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.03)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          },
          elevation3: {
            boxShadow: isDark ? '0 10px 40px -4px rgba(0, 0, 0, 0.5)' : '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)'}`,
            color: isDark ? '#f1f5f9' : '#0f172a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0d1526' : '#ffffff',
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: isDark
              ? '0 4px 24px -1px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.03)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44 },
          indicator: { display: 'none' },
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
              backgroundColor: isDark ? `${primary.main}20` : `${primary.main}14`,
              color: isDark ? primary.main : primary.dark,
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            },
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
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
            color: isDark ? '#94a3b8' : '#64748b',
          },
        },
      },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? `${primary.main}66` : `${primary.main}66`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primary.main,
            },
          },
          notchedOutline: {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 20 } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
          },
          arrow: { color: isDark ? '#1e293b' : '#0f172a' },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
    },
  });
};

export default getTheme;
