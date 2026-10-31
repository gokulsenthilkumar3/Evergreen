import { Suspense, type ReactNode } from 'react';
import { Box, keyframes, useTheme } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;
const wind = keyframes`
  to { stroke-dashoffset: -36; }
`;
const pull = keyframes`
  to { stroke-dashoffset: -60; }
`;

let webglSupport: boolean | undefined;

/** True when the browser can create a WebGL context. Checked once per page load. */
export function canUseWebGL(): boolean {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

interface SceneFallbackProps {
  height?: number | string;
  label?: string;
}

/**
 * Animated 2D yarn cone shown while a 3D scene loads, when WebGL is unavailable, or when the scene fails.
 * It needs no network or GPU, and holds still when the viewer prefers reduced motion.
 */
export default function SceneFallback({ height = 240, label = 'Yarn cone illustration' }: SceneFallbackProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const light = theme.palette.primary.light;
  const thread = dark ? '#a7f3d0' : '#047857';
  return (
    <Box
      role="img"
      aria-label={label}
      data-testid="scene-fallback"
      sx={{
        height,
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '22px',
        overflow: 'hidden',
        background: dark
          ? 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #08111f 0%, #0f172a 100%)'
          : 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.12), transparent 55%), linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(5,150,105,0.14)'}`,
        '@media (prefers-reduced-motion: reduce)': { '& *': { animation: 'none !important' } },
      }}
    >
      <Box component="svg" viewBox="0 0 220 160" aria-hidden sx={{ width: '72%', maxWidth: 260, height: '78%', animation: `${bob} 4s ease-in-out infinite` }}>
        <defs>
          <linearGradient id="evergreen-cone" x1="0" x2="1">
            <stop offset="0" stopColor={primary} stopOpacity={0.9} />
            <stop offset="0.55" stopColor={light} />
            <stop offset="1" stopColor={primary} stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="146" rx="46" ry="6" fill={dark ? 'rgba(0,0,0,0.35)' : 'rgba(4,120,87,0.12)'} />
        <path d="M62 22 L98 22 L120 138 L40 138 Z" fill="url(#evergreen-cone)" />
        {[40, 62, 84, 106, 126].map(y => (
          <Box
            key={y}
            component="path"
            d={`M${62 - (y - 22) * 0.19} ${y} L${98 + (y - 22) * 0.19} ${y}`}
            stroke={dark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.75)'}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="10 8"
            sx={{ animation: `${wind} 1.6s linear infinite` }}
          />
        ))}
        <rect x="70" y="8" width="20" height="16" rx="4" fill={dark ? '#1e293b' : '#065f46'} />
        <Box
          component="path"
          d="M100 30 C 140 20, 150 70, 190 60 S 210 100, 200 130"
          fill="none"
          stroke={thread}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="14 10"
          sx={{ animation: `${pull} 2.4s linear infinite` }}
        />
      </Box>
    </Box>
  );
}

/** Render a decorative 3D scene only where it can work; otherwise, and while it loads or if it fails, show the 2D cone. */
export function SafeScene({ children, height = 240, label }: SceneFallbackProps & { children: ReactNode }) {
  const fallback = <SceneFallback height={height} label={label} />;
  if (!canUseWebGL()) return fallback;
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
