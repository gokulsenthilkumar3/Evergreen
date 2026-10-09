import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, Button, Chip, IconButton, MenuItem, Select, Stack, Typography, useTheme } from '@mui/material';
import { AddRounded, ArrowForwardRounded, CloseFullscreenRounded, CropFreeRounded, ExploreOutlined, PauseRounded, PlayArrowRounded, RemoveRounded, RestartAltRounded, VideocamOutlined } from '@mui/icons-material';

export interface ZoneInfo { title: string; subtitle: string; facts: Array<[string, string]>; links: Array<[string, string]> }
interface Props {
  children: ReactNode; view: string; views: readonly string[]; focus: (view: string) => void;
  motion: boolean; playing: boolean; reduced: boolean; toggleMotion: () => void;
  tour: boolean; toggleTour: () => void; speed: number; setSpeed: (speed: number) => void;
  cinema: boolean; toggleCinema: () => void; reset: () => void; zoom: (direction: number) => void;
  resources: Array<[string, string]>; zone: ZoneInfo; machineSelector: ReactNode;
  activity?: ReactNode; metrics?: ReactNode; onNavigate?: (page: string) => void;
  selectedMachine?: string; onInspect: () => void; clearSelection: () => void;
}

const locations: Array<{ name: string; x: number; y: number; w: number; h: number }> = [
  { name: 'Receiving', x: 12, y: 12, w: 38, h: 26 }, { name: 'Production', x: 58, y: 12, w: 50, h: 26 },
  { name: 'Warehouse', x: 116, y: 12, w: 38, h: 26 }, { name: 'People', x: 12, y: 50, w: 32, h: 22 },
  { name: 'Dispatch', x: 122, y: 50, w: 32, h: 22 },
];

export default function CampusWorkspace(props: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [panel, setPanel] = useState('Overview');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!root.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= 1040));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setPanel('Overview'); }, [props.view, props.selectedMachine]);
  const focus = (view: string) => { setPanel('Overview'); props.focus(view); };

  const bgMain = isDark ? '#0a1020' : '#f7faf8';
  const borderMain = isDark ? 'rgba(16, 185, 129, 0.2)' : '#dbe6df';
  const headerBg = isDark ? 'rgba(15, 23, 42, 0.88)' : '#fff';
  const resourceBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#edf1ee';
  const textPrimary = isDark ? '#f1f5f9' : '#203f35';
  const textMuted = isDark ? '#94a3b8' : '#718578';
  const tabBg = isDark ? 'rgba(11, 19, 43, 0.85)' : '#f7faf8';
  const activeColor = isDark ? '#34d399' : '#176c4f';

  return (
    <Box
      ref={root}
      sx={{
        bgcolor: bgMain,
        border: `1px solid ${borderMain}`,
        borderRadius: 3,
        overflow: 'hidden',
        color: textPrimary,
        backdropFilter: isDark ? 'blur(16px)' : 'none',
        boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.45)' : '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top Header */}
      <Stack
        direction="row"
        sx={{
          minHeight: 62,
          px: { xs: 1.5, sm: 2.5 },
          py: 1,
          gap: 1,
          alignItems: 'center',
          bgcolor: headerBg,
          flexWrap: 'wrap',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#edf1ee'}`,
        }}
      >
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: isDark ? 'rgba(16,185,129,0.2)' : '#123f31', color: isDark ? '#34d399' : '#b9e6b6', display: 'grid', placeItems: 'center' }}>
          <ExploreOutlined fontSize="small" />
        </Box>
        <Box sx={{ mr: 'auto' }}>
          <Typography fontWeight={750} fontSize={15}>
            EverGreen <Box component="span" sx={{ color: isDark ? '#64748b' : '#7c9085', fontWeight: 400 }}> / Operations</Box>
          </Typography>
          <Typography fontSize={11} sx={{ color: textMuted }}>Factory campus · 3D interactive simulator</Typography>
        </Box>
        <Chip
          size="small"
          label={props.reduced ? 'Reduced motion' : props.playing ? 'Illustrative traffic' : 'Animation paused'}
          sx={{
            bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#edf5ed',
            color: isDark ? '#34d399' : '#477153',
            fontSize: 10,
            border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
          }}
        />
        <Button
          size="small"
          startIcon={props.cinema ? <CloseFullscreenRounded /> : <CropFreeRounded />}
          onClick={props.toggleCinema}
          sx={{ color: isDark ? '#38bdf8' : undefined }}
        >
          {props.cinema ? 'Exit cinema' : 'Cinema view'}
        </Button>
      </Stack>

      {/* Resource Stats Bar */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, borderBottom: `1px solid ${borderMain}`, bgcolor: isDark ? 'rgba(15,23,42,0.6)' : '#fff' }}>
        {props.resources.map(([label, value], i) => (
          <Box key={label} sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderRight: i < 3 ? `1px solid ${resourceBorder}` : 0 }}>
            <Typography fontSize={10} sx={{ color: textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5, fontWeight: 700 }}>{label}</Typography>
            <Typography sx={{ fontWeight: 650, fontSize: { xs: 17, sm: 22 }, lineHeight: 1.2, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere', color: textPrimary }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      {/* Main Scene & Workspace Panel */}
      <Box sx={{ display: 'grid', gridTemplateColumns: wide && !props.cinema ? 'minmax(0, 1fr) 280px' : 'minmax(0, 1fr)' }}>
        <Box sx={{ minWidth: 0 }}>
          {/* Navigation Tabs */}
          <Stack direction="row" sx={{ px: 1.25, gap: 0.5, bgcolor: tabBg, borderBottom: `1px solid ${borderMain}`, overflowX: 'auto' }}>
            {props.views.map((name, i) => (
              <Button
                key={name}
                aria-pressed={props.view === name}
                onClick={() => focus(name)}
                sx={{
                  flexShrink: 0,
                  px: 1.5,
                  borderRadius: '0 !important',
                  borderBottom: `2px solid ${props.view === name ? activeColor : 'transparent'}`,
                  color: props.view === name ? activeColor : textMuted,
                  fontSize: 11,
                  fontWeight: props.view === name ? 750 : 600,
                }}
              >
                <Box component="span" sx={{ fontSize: 9, mr: 0.8, opacity: 0.55 }}>0{i + 1}</Box>
                {name}
              </Button>
            ))}
          </Stack>

          {/* Canvas Box */}
          <Box sx={{ height: props.cinema ? 'max(560px, calc(100dvh - 230px))' : { xs: 370, sm: 560, lg: 620 }, position: 'relative', bgcolor: isDark ? '#080e1c' : '#e8efec', minWidth: 0 }}>
            {props.children}
            <Box sx={{ position: 'absolute', left: 20, top: 18, pointerEvents: 'none' }}>
              <Typography sx={{ fontSize: 10, color: isDark ? '#38bdf8' : '#6d8779', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                {props.tour ? 'Guided camera tour' : 'Explore the campus'}
              </Typography>
              <Typography sx={{ fontSize: { xs: 22, sm: 30 }, fontWeight: 700, letterSpacing: '-0.055em', color: isDark ? '#f8fafc' : '#234a39' }}>
                {props.view === 'Campus' ? 'The bigger picture.' : props.view}
              </Typography>
            </Box>

            {/* Campus Navigator HUD */}
            <Box sx={{ position: 'absolute', left: 16, bottom: 16, width: 174, p: 1, borderRadius: 2, bgcolor: isDark ? 'rgba(15,23,42,0.85)' : '#ffffffed', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#d5e1d8'}`, backdropFilter: 'blur(8px)', display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ fontSize: 9, color: textMuted, mb: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>Campus navigator</Typography>
              <Box sx={{ position: 'relative', height: 86, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#e7eee8', borderRadius: 1 }}>
                <svg viewBox="0 0 166 86" width="100%" height="100%" aria-hidden="true">
                  <rect x="4" y="4" width="158" height="78" rx="6" fill="none" stroke={isDark ? '#334155' : '#b4c7bb'} strokeWidth="4" />
                  <path d="M53 44H112" stroke={isDark ? '#475569' : '#bccac3'} strokeDasharray="3 2" />
                </svg>
                {locations.map(location => (
                  <Button
                    key={location.name}
                    aria-label={`Focus ${location.name}`}
                    onClick={() => focus(location.name)}
                    sx={{
                      position: 'absolute',
                      left: `${location.x / 166 * 100}%`,
                      top: `${location.y / 86 * 100}%`,
                      width: `${location.w / 166 * 100}%`,
                      height: `${location.h / 86 * 100}%`,
                      minWidth: '0 !important',
                      minHeight: '0 !important',
                      p: 0,
                      borderRadius: '2px !important',
                      fontSize: 8,
                      bgcolor: props.view === location.name ? (isDark ? '#10b981' : '#258760') : (isDark ? '#1e293b' : '#b6cec0'),
                      color: props.view === location.name ? '#fff' : (isDark ? '#94a3b8' : '#365845'),
                      border: props.view === location.name ? '1px solid #34d399' : 'none',
                    }}
                  >
                    {location.name.slice(0, 3)}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Zoom Controls */}
            <Stack sx={{ position: 'absolute', right: 16, bottom: 16, bgcolor: isDark ? 'rgba(15,23,42,0.85)' : '#fffffff2', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#d5e1d8'}`, borderRadius: 2, overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
              <IconButton aria-label="Zoom in" onClick={() => props.zoom(1)} sx={{ width: 44, height: 44, color: textPrimary }}><AddRounded fontSize="small" /></IconButton>
              <IconButton aria-label="Zoom out" onClick={() => props.zoom(-1)} sx={{ width: 44, height: 44, color: textPrimary }}><RemoveRounded fontSize="small" /></IconButton>
            </Stack>
          </Box>

          {/* Bottom Toolbar */}
          <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: headerBg, borderTop: `1px solid ${borderMain}`, p: 1 }}>
            <Button variant="contained" disableElevation size="small" startIcon={props.motion && !props.reduced ? <PauseRounded /> : <PlayArrowRounded />} disabled={props.reduced} aria-pressed={props.motion && !props.reduced} onClick={props.toggleMotion} sx={{ bgcolor: isDark ? '#10b981' : undefined }}>{props.motion && !props.reduced ? 'Pause' : 'Play'}</Button>
            <Button size="small" startIcon={<VideocamOutlined />} disabled={props.reduced} aria-pressed={props.tour} onClick={props.toggleTour}>{props.tour ? 'Stop tour' : 'Camera tour'}</Button>
            <Select size="small" value={props.speed} inputProps={{ 'aria-label': 'Animation speed' }} onChange={event => props.setSpeed(Number(event.target.value))} sx={{ height: 36, minWidth: 68, fontSize: 12 }}>
              {[0.5, 1, 2].map(speed => <MenuItem key={speed} value={speed}>{speed}×</MenuItem>)}
            </Select>
            <IconButton aria-label="Reset camera" onClick={props.reset} sx={{ color: textPrimary }}><RestartAltRounded fontSize="small" /></IconButton>
            <Typography sx={{ fontSize: 10, color: textMuted, ml: 'auto', px: 1, display: { xs: 'none', sm: 'block' } }}>Drag to orbit · scroll to zoom</Typography>
          </Stack>
        </Box>

        {/* Right Info Drawer */}
        {!props.cinema && (
          <Box sx={{ minWidth: 0, bgcolor: headerBg, borderLeft: wide ? `1px solid ${borderMain}` : 0, borderTop: wide ? 0 : `1px solid ${borderMain}`, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" sx={{ borderBottom: `1px solid ${resourceBorder}`, px: 1, gap: 0.5 }}>
              {['Overview', ...(props.activity ? ['Activity'] : []), ...(props.metrics ? ['Metrics'] : [])].map(name => (
                <Button key={name} size="small" aria-pressed={panel === name} onClick={() => setPanel(name)} sx={{ borderBottom: `2px solid ${panel === name ? activeColor : 'transparent'}`, borderRadius: '0 !important', color: panel === name ? activeColor : textMuted, fontSize: 11 }}>
                  {name}
                </Button>
              ))}
            </Stack>

            {panel === 'Activity' ? (
              <Box sx={{ height: wide ? 668 : 360, p: 1, minHeight: 0 }}>{props.activity}</Box>
            ) : panel === 'Metrics' ? (
              <Box sx={{ p: 1.5, '& > div': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }, '& > div > div > div': { padding: '12px' } }}>{props.metrics}</Box>
            ) : (
              <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#34d399' : '#769281', mb: 1, fontWeight: 700 }}>
                  {props.selectedMachine ? 'Selected machine' : 'Selected zone'}
                </Typography>
                <Typography sx={{ fontSize: 21, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.035em', color: textPrimary }}>
                  {props.selectedMachine ?? props.zone.title}
                </Typography>
                <Typography sx={{ fontSize: 12, color: textMuted, mt: 1, mb: 2.5, lineHeight: 1.7 }}>
                  {props.zone.subtitle}
                </Typography>
                <Box component="dl" sx={{ m: 0 }}>
                  {props.zone.facts.map(([label, value]) => (
                    <Box key={label} sx={{ py: 1.2, display: 'flex', gap: 1, justifyContent: 'space-between', borderTop: `1px solid ${resourceBorder}` }}>
                      <Typography component="dt" fontSize={11} sx={{ color: textMuted }}>{label}</Typography>
                      <Typography component="dd" sx={{ m: 0, fontSize: 12, fontWeight: 700, textAlign: 'right', color: textPrimary }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
                {props.selectedMachine && (
                  <Stack sx={{ mt: 1, gap: 1 }}>
                    <Button variant="contained" disableElevation size="small" onClick={props.onInspect} sx={{ bgcolor: isDark ? '#10b981' : undefined }}>Inspection history</Button>
                    <Button size="small" onClick={props.clearSelection}>Clear selection</Button>
                  </Stack>
                )}
                <Box sx={{ mt: 2 }}>{props.machineSelector}</Box>
                <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#34d399' : '#769281', mt: 3, mb: 0.5, fontWeight: 700 }}>
                  Open workspace
                </Typography>
                {props.zone.links.map(([name, page]) => (
                  <Button key={page} onClick={() => props.onNavigate?.(page)} disabled={!props.onNavigate} endIcon={<ArrowForwardRounded sx={{ fontSize: '14px !important' }} />} sx={{ justifyContent: 'space-between', borderBottom: `1px solid ${resourceBorder}`, fontSize: 12, color: textPrimary }}>
                    {name}
                  </Button>
                ))}
                <Box sx={{ mt: 'auto', pt: 3 }}>
                  <Typography sx={{ fontSize: 10, color: textMuted, lineHeight: 1.7 }}>
                    Quantities reflect recorded operations. Vehicle movement is illustrative. Stacks represent grouped inventory.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
