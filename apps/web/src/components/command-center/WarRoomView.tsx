import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FactoryOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  GrassOutlined,
  RecyclingOutlined,
  SpeedOutlined,
  ArrowForwardOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  BuildOutlined,
  VerifiedUserOutlined,
} from '@mui/icons-material';
import type { MachineData } from './FloorCanvas';
import { sfx } from '../../utils/sfx';

export interface WarRoomViewProps {
  machines: MachineData[];
  cottonKg: number;
  cottonBales: number;
  yarnKg: number;
  yarnBags: number;
  productionRunning: boolean;
  dispatchCount: number;
  qualityHolds: number;
  periodProductionKg?: number;
  periodWasteKg?: number;
  wasteRatePct?: number;
  onMachineClick?: (m: MachineData) => void;
  onNavigate?: (page: string) => void;
  activeFilter?: string;
}

export const WarRoomView: React.FC<WarRoomViewProps> = ({
  machines,
  cottonKg,
  cottonBales,
  yarnKg,
  yarnBags,
  productionRunning,
  dispatchCount,
  qualityHolds,
  periodProductionKg = 0,
  periodWasteKg = 0,
  wasteRatePct = 0,
  onMachineClick,
  onNavigate,
  activeFilter = 'all',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Active vs Maintenance metrics
  const activeMachines = useMemo(() => machines.filter((m) => m.active), [machines]);
  const alertMachines = useMemo(() => machines.filter((m) => (m.openInspections ?? 0) > 0), [machines]);
  const oeePercent = useMemo(() => {
    if (machines.length === 0) return 0;
    const runningRatio = activeMachines.length / machines.length;
    const qualityFactor = qualityHolds > 0 ? 0.92 : 0.98;
    return Math.round(runningRatio * qualityFactor * 100);
  }, [machines, activeMachines, qualityHolds]);

  // Group machines by process stage
  const machineGroups = useMemo(() => {
    const groups: Record<string, MachineData[]> = {
      'Blow Room & Opening': [],
      'Carding & Drawing': [],
      'Spinning & Winding (OE/Ring)': [],
      'Ancillary & Packaging': [],
    };

    machines.forEach((m) => {
      const type = (m.type || '').toLowerCase();
      if (type.includes('blow') || type.includes('bale') || type.includes('open')) {
        groups['Blow Room & Opening'].push(m);
      } else if (type.includes('card') || type.includes('draw') || type.includes('lap')) {
        groups['Carding & Drawing'].push(m);
      } else if (type.includes('oe') || type.includes('ring') || type.includes('spin') || type.includes('wind')) {
        groups['Spinning & Winding (OE/Ring)'].push(m);
      } else {
        groups['Ancillary & Packaging'].push(m);
      }
    });

    return groups;
  }, [machines]);

  const cardBg = isDark
    ? 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(20,30,55,0.7) 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* ─── Top Material Throughput Pipeline ─────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: cardBg,
          border: cardBorder,
          backdropFilter: 'blur(12px)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.36)'
            : '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'rgba(14,165,233,0.15)',
                color: '#0ea5e9',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <SpeedOutlined fontSize="small" />
            </Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Material Throughput Pipeline
            </Typography>
            <Chip
              label={productionRunning ? '⚡ Run in Progress' : 'Idle / Ready'}
              size="small"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: productionRunning ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                color: productionRunning ? '#10b981' : '#94a3b8',
                border: `1px solid ${productionRunning ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Plant Availability Rating:
            </Typography>
            <Chip
              label={`${oeePercent}% OEE`}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: oeePercent > 85 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                color: oeePercent > 85 ? '#10b981' : '#f59e0b',
                border: `1px solid ${oeePercent > 85 ? '#10b981' : '#f59e0b'}`,
              }}
            />
          </Box>
        </Box>

        {/* 4 Interactive Flow Stages */}
        <Grid container spacing={1.5} alignItems="center">
          {/* Stage 1: Cotton Inward */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              onClick={() => {
                sfx.playClick();
                onNavigate?.('inward');
              }}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.06)',
                border: '1px solid rgba(14,165,233,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(14,165,233,0.2)',
                  borderColor: '#0ea5e9',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Stage 01 · Inward
                </Typography>
                <GrassOutlined sx={{ color: '#0ea5e9', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                {cottonKg.toLocaleString('en-IN')} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>kg</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                ≈ {cottonBales} compressed bales in store
              </Typography>
            </Box>
          </Grid>

          {/* Stage 2: Production Conversion */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              onClick={() => {
                sfx.playClick();
                onNavigate?.('production');
              }}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.2)',
                  borderColor: '#6366f1',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Stage 02 · Production
                </Typography>
                <FactoryOutlined sx={{ color: '#6366f1', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                {periodProductionKg.toLocaleString('en-IN')} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>kg</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {wasteRatePct}% waste ({periodWasteKg.toFixed(1)} kg)
              </Typography>
            </Box>
          </Grid>

          {/* Stage 3: Finished Yarn Store */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              onClick={() => {
                sfx.playClick();
                onNavigate?.('inventory');
              }}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(16,185,129,0.2)',
                  borderColor: '#10b981',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Stage 03 · Yarn Store
                </Typography>
                <Inventory2Outlined sx={{ color: '#10b981', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                {yarnKg.toLocaleString('en-IN')} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>kg</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {yarnBags} standard 60kg bags
              </Typography>
            </Box>
          </Grid>

          {/* Stage 4: Outward Logistics */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              onClick={() => {
                sfx.playClick();
                onNavigate?.('outward');
              }}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(139,92,246,0.2)',
                  borderColor: '#8b5cf6',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Stage 04 · Dispatch
                </Typography>
                <LocalShippingOutlined sx={{ color: '#8b5cf6', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                {dispatchCount} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>dispatches</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {qualityHolds > 0 ? `${qualityHolds} hold(s) pending QC` : 'All lots cleared'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ─── Machine Fleet Status Matrix ──────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: cardBg,
          border: cardBorder,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'rgba(245,158,11,0.15)',
                color: '#f59e0b',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FactoryOutlined fontSize="small" />
            </Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Equipment Fleet & Telemetry Register
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
              ({activeMachines.length} of {machines.length} active)
            </Typography>
          </Box>

          <Button
            size="small"
            onClick={() => onNavigate?.('yarnmachine')}
            endIcon={<ArrowForwardOutlined sx={{ fontSize: '14px !important' }} />}
            sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
          >
            Manage Machines
          </Button>
        </Box>

        {/* Grouped machine cards */}
        <Grid container spacing={2}>
          {Object.entries(machineGroups).map(([groupTitle, list]) => {
            if (list.length === 0) return null;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={groupTitle}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      mb: 1.5,
                    }}
                  >
                    {groupTitle}
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.25 }}>
                    {list.map((m) => {
                      const hasAlert = (m.openInspections ?? 0) > 0;
                      const statusColor = hasAlert ? '#ef4444' : m.active ? '#10b981' : '#64748b';

                      return (
                        <Box
                          key={m.id}
                          onClick={() => {
                            sfx.playChirp();
                            onMachineClick?.(m);
                          }}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                            border: `1px solid ${hasAlert ? 'rgba(239,68,68,0.4)' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              borderColor: statusColor,
                              boxShadow: `0 4px 14px ${statusColor}28`,
                            },
                          }}
                        >
                          {/* Top indicator bar */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              bgcolor: statusColor,
                            }}
                          />

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight={800}
                              sx={{
                                fontSize: '0.82rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {m.name}
                            </Typography>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: statusColor,
                                boxShadow: hasAlert || m.active ? `0 0 8px ${statusColor}` : 'none',
                              }}
                            />
                          </Box>

                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                            {m.type.replaceAll('_', ' ')}
                          </Typography>

                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {hasAlert ? (
                              <Chip
                                label={`${m.openInspections} alert`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 800,
                                  bgcolor: 'rgba(239,68,68,0.15)',
                                  color: '#ef4444',
                                }}
                              />
                            ) : (
                              <Chip
                                label={m.active ? 'Operational' : 'Idle'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  bgcolor: m.active ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                                  color: m.active ? '#10b981' : '#94a3b8',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* ─── Operations & Quality Radar Bar ──────────────────────────────── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: 3,
              background: cardBg,
              border: cardBorder,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserOutlined sx={{ color: qualityHolds > 0 ? '#f59e0b' : '#10b981', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={800}>
                    Quality & Lot Quarantine Radar
                  </Typography>
                </Box>
                <Chip
                  label={qualityHolds > 0 ? `${qualityHolds} Active Quarantine` : '100% Passed'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: qualityHolds > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    color: qualityHolds > 0 ? '#f59e0b' : '#10b981',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.6 }}>
                {qualityHolds > 0
                  ? `There are ${qualityHolds} production lots under hold inspection. In-progress batches require laboratory verification before release to finished yarn store.`
                  : 'All finished yarn bags meet standard quality benchmarks. No quarantined lots currently in hold.'}
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => onNavigate?.('yarnquality')}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
              >
                Open Quality Desk →
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: 3,
              background: cardBg,
              border: cardBorder,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingOutlined sx={{ color: '#8b5cf6', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={800}>
                    Outward Logistics Dock
                  </Typography>
                </Box>
                <Chip
                  label={`${dispatchCount} Recorded Shipments`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Consignments dispatched via outward register. Trucks depart directly from loading bay 01/02.
                Automated invoice linking and customer ledger sync are operational.
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => onNavigate?.('outward')}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
              >
                Logistics & Challans →
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WarRoomView;
