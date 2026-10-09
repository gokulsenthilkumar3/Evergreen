import React, { useMemo, useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Paper, Tooltip, IconButton,
  useTheme, Drawer, DialogTitle, DialogContent,
  CircularProgress, Alert, Button, useMediaQuery,
  ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  HubOutlined,
  ViewInArOutlined,
  MapOutlined,
  SpeedOutlined,
  VolumeUpOutlined,
  VolumeOffOutlined,
  PlayArrowOutlined,
  PauseOutlined,
  ArrowForwardOutlined,
  BuildOutlined,
  WbSunnyOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import FloorCanvas, { type MachineData } from '../components/command-center/FloorCanvas';
import CampusScene from '../components/command-center/CampusScene';
import WarRoomView from '../components/command-center/WarRoomView';
import ShipmentStepperHud from '../components/command-center/ShipmentStepperHud';
import FleetDockTableHud from '../components/command-center/FleetDockTableHud';
import KpiRibbon, { type KpiCard } from '../components/command-center/KpiRibbon';
import ActivityFeed, { type FeedEvent } from '../components/command-center/ActivityFeed';
import { sfx } from '../utils/sfx';

// ─── Types (local) ───────────────────────────────────────────────────────────

interface SummaryResponse {
  kpis: Array<{
    label: string; value: string; subValue?: string;
    color: string; trend: string; comparison: string; hasData: boolean;
  }>;
  meta: {
    periodProduction: number; periodWaste: number; totalCost: number;
    costPerKg: number; totalYarnKg: number; yarnBags: number;
    yarnLooseKg: number; totalCotton: number; cottonBales: number;
  };
}

interface MachineResponse {
  id: number; name: string; type: string; active: boolean;
  serialNo?: string; manufacturer?: string; notes?: string;
  inspections?: Array<{ type: string; status: string; date: string }>;
}

interface InspectionResponse {
  id: number; machineId: number; type: string; status: string; date: string;
  machine?: { name: string; type: string };
}

export interface InwardResponse {
  id: number;
  batchId?: string;
  batchNo?: string;
  kg?: number;
  quantity?: number;
  bale?: number;
  bales?: number;
  date: string;
  supplierId?: number;
}

export interface OutwardResponse {
  id: number;
  totalWeight?: number;
  weight?: number;
  customerName?: string;
  status?: string;
  date: string;
  reason?: string;
}

export interface ProductionResponse {
  id: number;
  date: string;
  totalProduced?: number;
  totalConsumed?: number;
  totalWaste?: number;
}

type ViewMode = 'campus' | 'floor' | 'warroom';

// ─── Data transformation helpers ─────────────────────────────────────────────

export function formatQuantity(value: unknown): string {
  if (value === 0) return '0';
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '—';
}

function buildKpiCards(
  summary: SummaryResponse | undefined,
  machines: MachineResponse[] | undefined,
  inspections: InspectionResponse[] | undefined,
): KpiCard[] {
  const meta = summary?.meta;

  return [
    {
      id: 'cotton',
      label: 'Cotton Stock',
      icon: '🌿',
      color: '#0ea5e9',
      value: meta?.totalCotton ?? 0,
      unit: 'kg',
      subValue: meta?.cottonBales ? `${meta.cottonBales} bales` : undefined,
      hasData: typeof meta?.totalCotton === 'number',
    },
    {
      id: 'yarn',
      label: 'Yarn Stock',
      icon: '🧵',
      color: '#059669',
      value: meta?.totalYarnKg ?? 0,
      unit: 'kg',
      subValue: meta?.yarnBags ? `${meta.yarnBags} bags · +${(meta.yarnLooseKg ?? 0).toFixed(1)} kg loose` : undefined,
      hasData: typeof meta?.totalYarnKg === 'number',
    },
    {
      id: 'production',
      label: 'Period Output',
      icon: '🏭',
      color: '#6366f1',
      value: meta?.periodProduction ?? 0,
      unit: 'kg',
      subValue: meta?.periodWaste ? `${meta.periodWaste.toFixed(1)} kg waste` : undefined,
      hasData: typeof meta?.periodProduction === 'number',
    },
    {
      id: 'waste',
      label: 'Waste Rate',
      icon: '♻️',
      color: '#f97316',
      value: (() => {
        const prod = meta?.periodProduction ?? 0;
        const waste = meta?.periodWaste ?? 0;
        const total = prod + waste;
        return total > 0 ? Math.round((waste / total) * 1000) / 10 : 0;
      })(),
      unit: '%',
      subValue: meta?.periodWaste ? `${(meta.periodWaste ?? 0).toFixed(1)} kg total waste` : undefined,
      hasData: typeof meta?.periodWaste === 'number' && ((meta.periodProduction ?? 0) + meta.periodWaste) > 0,
    },
    {
      id: 'machines',
      label: 'Machines',
      icon: '⚙️',
      color: '#f59e0b',
      value: machines?.filter((m) => m.active).length ?? 0,
      unit: 'active',
      subValue: (() => {
        const open = inspections?.filter((i) => ['PENDING', 'IN_PROGRESS'].includes(i.status?.toUpperCase() ?? '')).length ?? 0;
        return open > 0 ? `${open} open inspection${open > 1 ? 's' : ''}` : undefined;
      })(),
      hasData: machines !== undefined,
    },
    {
      id: 'cost',
      label: 'Total Cost',
      icon: '💰',
      color: '#a78bfa',
      value: meta?.totalCost ?? 0,
      unit: '₹',
      subValue: (meta?.costPerKg ?? 0) > 0 ? `₹${(meta?.costPerKg ?? 0).toFixed(2)} / kg` : undefined,
      hasData: typeof meta?.totalCost === 'number',
    },
  ];
}

export function buildFeedEvents(
  inward: InwardResponse[] | undefined,
  outward: OutwardResponse[] | undefined,
  production: ProductionResponse[] | undefined,
  inspections: InspectionResponse[] | undefined,
): FeedEvent[] {
  const events: FeedEvent[] = [];

  (inward ?? []).slice(0, 5).forEach((item) => {
    const batch = item.batchId || item.batchNo || String(item.id);
    const kgVal = item.kg ?? item.quantity;
    const baleVal = item.bale ?? item.bales;
    events.push({
      id: `inward-${item.id}`,
      kind: 'inward',
      title: `Batch ${batch} received`,
      subtitle: `${formatQuantity(kgVal)} kg · ${formatQuantity(baleVal)} bales`,
      timestamp: item.date,
      badge: undefined,
      color: '#0ea5e9',
    });
  });

  (outward ?? []).slice(0, 5).forEach((item) => {
    const wtVal = item.totalWeight ?? item.weight;
    events.push({
      id: `outward-${item.id}`,
      kind: 'dispatch',
      title: wtVal !== undefined ? `Dispatch — ${formatQuantity(wtVal)} kg` : `Dispatch #${item.id}`,
      subtitle: item.customerName || (item.status ? `Status: ${item.status}` : 'Dispatched'),
      timestamp: item.date,
      badge: undefined,
      color: '#8b5cf6',
    });
  });

  (production ?? []).slice(0, 5).forEach((item) => {
    events.push({
      id: `prod-${item.id}`,
      kind: 'production',
      title: `Production run #${item.id}`,
      subtitle: `${formatQuantity(item.totalProduced)} kg yarn produced · ${formatQuantity(item.totalWaste)} kg waste`,
      timestamp: item.date,
      badge: undefined,
      color: '#059669',
    });
  });

  (inspections ?? []).slice(0, 5).forEach((item) => {
    const isCompleted = item.status?.toUpperCase() === 'COMPLETED';
    events.push({
      id: `insp-${item.id}`,
      kind: 'inspection',
      title: `${item.type} inspection`,
      subtitle: `${item.machine?.name ?? 'Machine'} · ${item.status}`,
      timestamp: item.date,
      badge: isCompleted ? undefined : 'OPEN',
      color: '#f59e0b',
    });
  });

  return events
    .filter((e) => !isNaN(new Date(e.timestamp).getTime()))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);
}

// ─── Machine Detail Dialog / Inspector ────────────────────────────────────────

const MachineDetailDialog: React.FC<{
  machine: MachineData | null;
  inspections: InspectionResponse[];
  open: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}> = ({ machine, inspections, open, onClose, onNavigate }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!machine) return null;

  const machineInspections = inspections.filter((i) => i.machineId === machine.id);
  const openCount = machineInspections.filter((i) => ['PENDING', 'IN_PROGRESS'].includes(i.status?.toUpperCase() ?? '')).length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={mobile ? 'bottom' : 'right'}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxHeight: { xs: '88dvh', sm: '100%' },
          borderRadius: { xs: '20px 20px 0 0', sm: 0 },
          background: isDark ? 'linear-gradient(180deg, #0f172a 0%, #091124 100%)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5, pt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: isDark ? '#34d399' : '#059669', fontWeight: 800 }}>
            Unit Inspector · Strategy View
          </Typography>
          <Button size="small" onClick={onClose} sx={{ minWidth: 0, px: 1 }}>Close</Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52, height: 52, borderRadius: '16px',
              background: machine.active ? 'rgba(52,211,153,0.15)' : 'rgba(100,116,139,0.15)',
              border: `2px solid ${machine.active ? '#34d399' : '#64748b'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
              boxShadow: machine.active ? '0 0 16px rgba(52,211,153,0.3)' : 'none',
            }}
          >
            ⚙️
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap>{machine.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Type: {machine.type.replaceAll('_', ' ')}
            </Typography>
          </Box>
          <Chip
            label={machine.active ? 'Operational' : 'Idle / Offline'}
            size="small"
            sx={{
              backgroundColor: machine.active ? 'rgba(52,211,153,0.15)' : 'rgba(100,116,139,0.15)',
              color: machine.active ? '#34d399' : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.68rem',
              border: `1px solid ${machine.active ? '#34d399' : '#64748b'}`,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {/* Quick Health Status Card */}
        <Box
          sx={{
            p: 2, borderRadius: '14px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Telemetry Status</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: machine.active ? '#10b981' : '#64748b' }}>
              {machine.active ? 'Registered Operational' : 'Standby / Inactive'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Open Inspections</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: openCount > 0 ? '#ef4444' : '#10b981' }}>
              {openCount} Alert{openCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        </Box>

        {openCount > 0 && (
          <Box
            sx={{
              p: 2, borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: '1.25rem' }}>🔴</Typography>
            <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
              {openCount} open inspection{openCount > 1 ? 's' : ''} require attention
            </Typography>
          </Box>
        )}

        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.68rem', letterSpacing: '0.1em', fontWeight: 800 }}>
          Inspection History & Log
        </Typography>

        {machineInspections.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No inspections recorded for this asset yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {machineInspections.map((insp) => {
              const resolved = insp.status?.toUpperCase() === 'COMPLETED';
              return (
                <Box
                  key={insp.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: '10px 14px', borderRadius: '10px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <Typography sx={{ fontSize: '1rem' }}>{resolved ? '✅' : '🔧'}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{insp.type}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(insp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Chip
                    label={insp.status}
                    size="small"
                    sx={{
                      fontSize: '0.65rem', fontWeight: 700,
                      backgroundColor: resolved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: resolved ? '#10b981' : '#f59e0b',
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onClose();
              onNavigate?.('yarnmachine');
            }}
            endIcon={<ArrowForwardOutlined fontSize="small" />}
            sx={{ fontWeight: 700, borderRadius: '10px', py: 1 }}
          >
            Open Machine Register
          </Button>
        </Box>
      </DialogContent>
    </Drawer>
  );
};

// ─── Main Command Center ──────────────────────────────────────────────────────

interface CommandCenterProps {
  onNavigate?: (page: string) => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const qc = useQueryClient();

  const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);
  const [floorExpanded, setFloorExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('campus');
  const [soundEnabled, setSoundEnabled] = useState(sfx.isEnabled());
  const [simulateFlow, setSimulateFlow] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // ── API queries ────────────────────────────────────────────────────────────

  const summaryQ = useQuery<SummaryResponse>({
    queryKey: ['cmd-summary'],
    queryFn: () => api.get('/dashboard/summary').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const machinesQ = useQuery<MachineResponse[]>({
    queryKey: ['cmd-machines'],
    queryFn: () => api.get('/machines').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const inspectionsQ = useQuery<InspectionResponse[]>({
    queryKey: ['cmd-inspections'],
    queryFn: () => api.get('/machines/inspections').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const inwardQ = useQuery<InwardResponse[]>({
    queryKey: ['cmd-inward'],
    queryFn: () => api.get('/inventory/inward').then((r) => r.data),
    refetchInterval: 60_000,
  });

  const outwardQ = useQuery<OutwardResponse[]>({
    queryKey: ['cmd-outward'],
    queryFn: () => api.get('/inventory/outward').then((r) => r.data),
    refetchInterval: 60_000,
  });

  const productionQ = useQuery<ProductionResponse[]>({
    queryKey: ['cmd-production'],
    queryFn: () => api.get('/production').then((r) => r.data),
    refetchInterval: 60_000,
  });

  const qualityQ = useQuery<Array<{ status: string }>>({
    queryKey: ['cmd-quality'],
    queryFn: () => api.get('/quality/inspections').then((r) => r.data),
    refetchInterval: 60_000,
  });

  // ── Derived data ───────────────────────────────────────────────────────────

  const kpiCards = useMemo(
    () => buildKpiCards(summaryQ.data, machinesQ.data, inspectionsQ.data),
    [summaryQ.data, machinesQ.data, inspectionsQ.data],
  );

  const feedEvents = useMemo(
    () => buildFeedEvents(inwardQ.data, outwardQ.data, productionQ.data, inspectionsQ.data),
    [inwardQ.data, outwardQ.data, productionQ.data, inspectionsQ.data],
  );

  const floorMachines = useMemo((): MachineData[] =>
    (machinesQ.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      active: m.active,
      openInspections: (inspectionsQ.data ?? []).filter(
        (i) => i.machineId === m.id && ['PENDING', 'IN_PROGRESS'].includes(i.status?.toUpperCase() ?? ''),
      ).length,
    })),
    [machinesQ.data, inspectionsQ.data],
  );

  const isProductionRunning = false; // Recorded output is not machine telemetry.

  const cottonKg = summaryQ.data?.meta?.totalCotton ?? 0;
  const cottonBales = summaryQ.data?.meta?.cottonBales ?? 0;
  const yarnKg = summaryQ.data?.meta?.totalYarnKg ?? 0;
  const yarnBags = summaryQ.data?.meta?.yarnBags ?? 0;
  const dispatchCount = outwardQ.data?.length ?? 0;
  const qualityHolds = qualityQ.data?.filter((i) => i.status === 'HOLD').length ?? 0;

  const queries = [summaryQ, machinesQ, inspectionsQ, inwardQ, outwardQ, productionQ, qualityQ];
  const hasError = queries.some((query) => query.isError);
  const isLoading = summaryQ.isLoading || machinesQ.isLoading;

  const handleRefresh = useCallback(() => {
    sfx.playClick();
    void qc.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith('cmd-') });
  }, [qc]);

  const handleSoundToggle = useCallback(() => {
    const next = sfx.toggle();
    setSoundEnabled(next);
  }, []);

  const handleModeChange = useCallback((_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) {
      sfx.playModeSwitch();
      setViewMode(newMode);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2 },
        minWidth: 0,
        width: '100%',
        '@media (prefers-reduced-motion: reduce)': {
          '& *': { animation: 'none !important', transition: 'none !important' },
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Title & Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.15) 100%)' : '#e0f0e7',
                color: isDark ? '#34d399' : '#087f65',
                border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
              }}
            >
              <HubOutlined fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: { xs: '1.25rem', sm: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Operations Command
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600 }}>
                Live factory floor strategy perspective · Real-time resource matrix
              </Typography>
            </Box>
          </Box>

          {/* Strategy Game Status Badges from Reference Video */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {/* Mill Peak Meter */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: isDark ? '#34d399' : '#059669' }}>
                Mill Peak: 94% OEE
              </Typography>
            </Box>

            {/* Shift Pill */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              <AccessTimeOutlined sx={{ fontSize: 13, color: '#38bdf8' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary' }}>
                Shift 1 · 08:00 - 16:00
              </Typography>
            </Box>

            {/* Environmental Climate Widget */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              <WbSunnyOutlined sx={{ fontSize: 13, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary' }}>
                28°C · 65% RH Optimal
              </Typography>
            </Box>
          </Box>

          {/* Interactive Strategy View Mode Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleModeChange}
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(15,23,42,0.8)' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '12px',
                p: '3px',
                '& .MuiToggleButton-root': {
                  borderRadius: '9px',
                  border: 0,
                  px: 1.5,
                  py: 0.6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(8,127,101,0.12)',
                    color: isDark ? '#34d399' : '#087f65',
                    fontWeight: 800,
                  },
                },
              }}
            >
              <ToggleButton value="campus">
                <ViewInArOutlined sx={{ fontSize: 16, mr: 0.75 }} /> 3D Campus
              </ToggleButton>
              <ToggleButton value="floor">
                <MapOutlined sx={{ fontSize: 16, mr: 0.75 }} /> 2D Tactical Floor
              </ToggleButton>
              <ToggleButton value="warroom">
                <SpeedOutlined sx={{ fontSize: 16, mr: 0.75 }} /> Operations Radar
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Audio SFX Toggle */}
            <Tooltip title={soundEnabled ? 'Strategy Audio: ON (Click to mute)' : 'Strategy Audio: MUTED (Click to activate chimes)'}>
              <IconButton
                aria-label="Toggle Strategy Audio Effects"
                onClick={handleSoundToggle}
                sx={{
                  borderRadius: '10px',
                  border: `1px solid ${soundEnabled ? 'rgba(16,185,129,0.4)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  bgcolor: soundEnabled ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : 'transparent',
                  color: soundEnabled ? '#10b981' : 'text.secondary',
                  width: 38,
                  height: 38,
                }}
              >
                {soundEnabled ? <VolumeUpOutlined fontSize="small" /> : <VolumeOffOutlined fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Live Flow Toggle (for 2D floor) */}
            {viewMode === 'floor' && (
              <Tooltip title={simulateFlow ? 'Pause Conveyor Particle Flows' : 'Simulate Conveyor Particle Flows'}>
                <Chip
                  clickable
                  onClick={() => {
                    sfx.playClick();
                    setSimulateFlow((v) => !v);
                  }}
                  icon={simulateFlow ? <PlayArrowOutlined sx={{ fontSize: '14px !important' }} /> : <PauseOutlined sx={{ fontSize: '14px !important' }} />}
                  label={simulateFlow ? 'Flow Active' : 'Flow Paused'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    bgcolor: simulateFlow ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                    color: simulateFlow ? '#10b981' : '#94a3b8',
                    border: `1px solid ${simulateFlow ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                  }}
                />
              </Tooltip>
            )}

            {/* Refresh */}
            <Tooltip title="Refresh all factory data">
              <IconButton
                aria-label="Refresh all data"
                onClick={handleRefresh}
                sx={{
                  borderRadius: '10px',
                  width: 38,
                  height: 38,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Fullscreen Expand */}
            <Tooltip title={floorExpanded ? 'Standard Layout' : 'Full Width Command Mode'}>
              <IconButton
                aria-label={floorExpanded ? 'Collapse floor' : 'Expand floor'}
                onClick={() => {
                  sfx.playClick();
                  setFloorExpanded((v) => !v);
                }}
                sx={{
                  borderRadius: '10px',
                  width: 38,
                  height: 38,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                {floorExpanded ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {/* ── Tactical Filter Ribbon ────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflowX: 'auto',
          py: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(100,116,139,0.2)', borderRadius: 2 },
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', mr: 0.5, flexShrink: 0 }}>
          Area Focus:
        </Typography>
        {[
          { id: 'all', label: 'All Operations', icon: '🌐' },
          { id: 'cotton', label: 'Cotton Inward', icon: '🌱' },
          { id: 'production', label: 'Production Lines', icon: '🏭' },
          { id: 'yarn', label: 'Yarn Warehouse', icon: '🧵' },
          { id: 'quality', label: 'Quality & QC', icon: '🔬' },
          { id: 'dispatch', label: 'Logistics Dock', icon: '🚛' },
        ].map((filter) => {
          const selected = activeFilter === filter.id;
          return (
            <Chip
              key={filter.id}
              label={`${filter.icon} ${filter.label}`}
              clickable
              onClick={() => {
                sfx.playClick();
                setActiveFilter(filter.id);
              }}
              size="small"
              sx={{
                flexShrink: 0,
                fontSize: '0.72rem',
                fontWeight: selected ? 800 : 600,
                bgcolor: selected ? (isDark ? 'rgba(16,185,129,0.2)' : 'rgba(8,127,101,0.12)') : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                color: selected ? (isDark ? '#34d399' : '#087f65') : 'text.secondary',
                border: `1px solid ${selected ? (isDark ? '#10b981' : '#087f65') : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.15s ease',
              }}
            />
          );
        })}
      </Box>

      {hasError && (
        <Alert severity="warning" action={<Button onClick={handleRefresh}>Retry</Button>}>
          Some operations data could not be loaded. Available records remain visible; unavailable domains may be incomplete.
        </Alert>
      )}

      {/* ── KPI Ribbon ────────────────────────────────────────────────────────── */}
      <KpiRibbon cards={kpiCards} isLoading={isLoading} />

      {/* ── Main content: Active View + Feed ─────────────────────────────────── */}
      <Box
        sx={{
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: floorExpanded || viewMode === 'warroom'
            ? 'minmax(0, 1fr)'
            : { xs: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) 300px' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Main Canvas Area */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}
        >
          {viewMode === 'campus' && (
            <Paper
              sx={{
                flex: 1, minWidth: 0, p: 0, overflow: 'hidden', borderRadius: 3,
                background: isDark ? 'rgba(7,14,26,0.95)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                position: 'relative',
              }}
            >
              <CampusScene
                machines={floorMachines}
                cottonKg={cottonKg}
                cottonBales={cottonBales}
                yarnKg={yarnKg}
                yarnBags={yarnBags}
                productionRunning={isProductionRunning}
                dispatchCount={dispatchCount}
                qualityHolds={qualityHolds}
                stockAvailable={!!summaryQ.data?.meta}
                machinesAvailable={!!machinesQ.data && !machinesQ.isError}
                qualityAvailable={!!qualityQ.data && !qualityQ.isError}
                dispatchAvailable={!!outwardQ.data && !outwardQ.isError}
                onMachineClick={(m) => {
                  sfx.playChirp();
                  setSelectedMachine(m);
                }}
                onNavigate={onNavigate}
              />
            </Paper>
          )}

          {viewMode === 'floor' && (
            <Paper
              sx={{
                flex: 1, minWidth: 0, p: 2, overflow: 'hidden', borderRadius: 3,
                background: isDark ? 'rgba(7,14,26,0.95)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Tactical 2D Schematic Floor
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Interactive plant layout · Click any machine node to inspect telemetry
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${floorMachines.filter((m) => m.active).length} Running`}
                    size="small"
                    sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 800, fontSize: '0.65rem' }}
                  />
                  <Chip
                    label={`${floorMachines.filter((m) => (m.openInspections ?? 0) > 0).length} Maintenance`}
                    size="small"
                    sx={{ bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </Box>
              </Box>

              <Box sx={{ width: '100%', height: { xs: 380, sm: 520, md: 600 } }}>
                <FloorCanvas
                  machines={floorMachines}
                  cottonKg={cottonKg}
                  cottonBales={cottonBales}
                  yarnKg={yarnKg}
                  yarnBags={yarnBags}
                  productionRunning={isProductionRunning}
                  dispatchCount={dispatchCount}
                  qualityHolds={qualityHolds}
                  simulateFlow={simulateFlow}
                  onMachineClick={(m) => {
                    sfx.playChirp();
                    setSelectedMachine(m);
                  }}
                />
              </Box>
            </Paper>
          )}

          {viewMode === 'warroom' && (
            <WarRoomView
              machines={floorMachines}
              cottonKg={cottonKg}
              cottonBales={cottonBales}
              yarnKg={yarnKg}
              yarnBags={yarnBags}
              productionRunning={isProductionRunning}
              dispatchCount={dispatchCount}
              qualityHolds={qualityHolds}
              periodProductionKg={summaryQ.data?.meta?.periodProduction ?? 0}
              periodWasteKg={summaryQ.data?.meta?.periodWaste ?? 0}
              wasteRatePct={(() => {
                const prod = summaryQ.data?.meta?.periodProduction ?? 0;
                const waste = summaryQ.data?.meta?.periodWaste ?? 0;
                const total = prod + waste;
                return total > 0 ? Math.round((waste / total) * 1000) / 10 : 0;
              })()}
              onMachineClick={(m) => {
                sfx.playChirp();
                setSelectedMachine(m);
              }}
              onNavigate={onNavigate}
              activeFilter={activeFilter}
            />
          )}
        </motion.div>

        {/* Activity feed — hidden when expanded or in warroom full width */}
        {!floorExpanded && viewMode !== 'warroom' && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ minHeight: 0 }}
          >
            <Box sx={{ height: { xs: 340, sm: 400, xl: 880 }, minWidth: 0 }}>
              <ActivityFeed events={feedEvents} isLoading={inwardQ.isLoading && productionQ.isLoading} />
            </Box>
          </motion.div>
        )}
      </Box>

      {/* ── Strategy Cockpit HUDs (Video Replication: Bottom Stepper & Fleet/Docks) ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mt: 1 }}>
        <ShipmentStepperHud />
        <FleetDockTableHud
          machines={floorMachines}
          dispatchCount={dispatchCount}
          cottonBales={cottonBales}
          yarnBags={yarnBags}
          onMachineClick={(m) => {
            sfx.playChirp();
            setSelectedMachine(m);
          }}
        />
      </Box>

      {/* ── Footer Strategy Hint ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', py: 0.5 }}>
          Switch between 3D Campus, 2D Tactical Floor, and Operations Radar. Select any building or machine to inspect operations.
        </Typography>
      </motion.div>

      {/* ── Machine Detail Dialog / Inspector ──────────────────────────────── */}
      <MachineDetailDialog
        machine={selectedMachine}
        inspections={inspectionsQ.data ?? []}
        open={!!selectedMachine}
        onClose={() => setSelectedMachine(null)}
        onNavigate={onNavigate}
      />
    </Box>
  );
};

export default CommandCenter;
