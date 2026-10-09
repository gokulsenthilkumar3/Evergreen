import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  LocalShippingOutlined,
  ExpandMore,
  ExpandLess,
  WarehouseOutlined,
  Forklift,
  SpeedOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import { sfx } from '../../utils/sfx';
import type { MachineData } from './FloorCanvas';

interface FleetDockTableHudProps {
  machines?: MachineData[];
  dispatchCount?: number;
  cottonBales?: number;
  yarnBags?: number;
  onMachineClick?: (m: MachineData) => void;
  defaultOpen?: boolean;
}

export const FleetDockTableHud: React.FC<FleetDockTableHudProps> = ({
  machines = [],
  dispatchCount = 2,
  cottonBales = 18,
  yarnBags = 24,
  onMachineClick,
  defaultOpen = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState<'docks' | 'vehicles' | 'machines'>('docks');
  const [expanded, setExpanded] = useState(defaultOpen);

  const hudBg = isDark
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(10, 16, 32, 0.98) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%)';
  const borderCol = isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)';

  // Mock dock rows modeled after video's "Northgate DC" dock matrix
  const dockRows = [
    { id: 'Bay 01', vehicle: 'TRK-102 (CargoLink)', load: '60 / 60 Bags', progress: 100, status: 'Departing', color: '#10b981' },
    { id: 'Bay 02', vehicle: 'TRK-241 (RapidHaul)', load: '48 / 60 Bags', progress: 80, status: 'Loading (80%)', color: '#0ea5e9' },
    { id: 'Bay 03', vehicle: 'Bale Flatbed FLT-04', load: '18 / 18 Bales', progress: 100, status: 'Unloading Cotton', color: '#f59e0b' },
    { id: 'Bay 04', vehicle: 'Dock Available', load: 'Standby', progress: 0, status: 'Cleared', color: '#64748b' },
  ];

  // Vehicles / Forklifts
  const vehicleRows = [
    { id: 'FL-01', type: 'Electric Forklift', location: 'Yarn Store → Bay 02', battery: '94%', status: 'Active (Hauling)', color: '#10b981' },
    { id: 'FL-02', type: 'Heavy Bale Loader', location: 'Inward Yard', battery: '78%', status: 'Stacking Bales', color: '#0ea5e9' },
    { id: 'TRK-102', type: 'Multi-Axle Cargo', destination: 'Coimbatore Hub', load: '100%', status: 'Gate Pass Ready', color: '#8b5cf6' },
  ];

  return (
    <Box
      sx={{
        borderRadius: '16px',
        background: hudBg,
        border: `1px solid ${borderCol}`,
        backdropFilter: 'blur(16px)',
        boxShadow: isDark
          ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)',
        p: 2,
        width: { xs: '100%', sm: 420 },
        maxWidth: '100%',
        color: isDark ? '#f1f5f9' : '#1e293b',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Glowing Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #38bdf8, #6366f1, #10b981)',
        }}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <WarehouseOutlined sx={{ fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontSize: '0.65rem' }}>
              Operations Table HUD
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '0.85rem' }}>
              Fleet & Loading Docks Matrix
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={() => setExpanded((v) => !v)}
          sx={{ width: 26, height: 26, color: 'text.secondary' }}
        >
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>

      {/* Tab Switcher from Video */}
      <Box sx={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, mb: 1.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            sfx.playClick();
            setActiveTab(val);
          }}
          sx={{
            minHeight: 32,
            '& .MuiTab-root': {
              minHeight: 32,
              py: 0.5,
              px: 1.5,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              '&.Mui-selected': {
                color: isDark ? '#38bdf8' : '#0284c7',
                fontWeight: 800,
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: isDark ? '#38bdf8' : '#0284c7',
              height: 2,
            },
          }}
        >
          <Tab value="docks" label="Loading Docks (4)" />
          <Tab value="vehicles" label="Fleet & Forklifts (3)" />
          <Tab value="machines" label={`Machine Lines (${machines.length || 8})`} />
        </Tabs>
      </Box>

      <Collapse in={expanded}>
        {/* TAB 1: DOCKS TABLE */}
        {activeTab === 'docks' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dockRows.map((dock) => (
              <Box
                key={dock.id}
                sx={{
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <Box sx={{ width: 56, flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7', fontSize: '0.75rem', display: 'block' }}>
                    {dock.id}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }} noWrap>
                    {dock.vehicle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={dock.progress}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': { bgcolor: dock.color, borderRadius: 2 },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>
                      {dock.load}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={dock.status}
                  size="small"
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: `${dock.color}18`,
                    color: dock.color,
                    border: `1px solid ${dock.color}40`,
                    flexShrink: 0,
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* TAB 2: VEHICLES / FORKLIFTS */}
        {activeTab === 'vehicles' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {vehicleRows.map((veh) => (
              <Box
                key={veh.id}
                sx={{
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box sx={{ width: 62, flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.75rem', display: 'block' }}>
                    {veh.id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>
                    {veh.battery}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }} noWrap>
                    {veh.type}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }} noWrap>
                    {veh.location}
                  </Typography>
                </Box>

                <Chip
                  label={veh.status}
                  size="small"
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: `${veh.color}18`,
                    color: veh.color,
                    border: `1px solid ${veh.color}40`,
                    flexShrink: 0,
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* TAB 3: MACHINE LINES */}
        {activeTab === 'machines' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
            {machines.slice(0, 6).map((m) => {
              const hasAlert = (m.openInspections ?? 0) > 0;
              const statusCol = hasAlert ? '#ef4444' : m.active ? '#10b981' : '#64748b';
              return (
                <Box
                  key={m.id}
                  onClick={() => {
                    sfx.playChirp();
                    onMachineClick?.(m);
                  }}
                  sx={{
                    p: 1.25,
                    borderRadius: '10px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: statusCol,
                    },
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusCol, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }} noWrap>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      {m.type.replaceAll('_', ' ')}
                    </Typography>
                  </Box>
                  <Chip
                    label={hasAlert ? `${m.openInspections} Alert` : m.active ? 'Running' : 'Offline'}
                    size="small"
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      bgcolor: `${statusCol}18`,
                      color: statusCol,
                      border: `1px solid ${statusCol}40`,
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default FleetDockTableHud;
