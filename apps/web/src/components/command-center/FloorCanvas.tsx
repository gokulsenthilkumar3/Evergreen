import React, { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { sfx } from '../../utils/sfx';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MachineData {
  id: number;
  name: string;
  type: string;
  active: boolean;
  openInspections?: number;
}

export interface FloorCanvasProps {
  machines: MachineData[];
  cottonKg: number;
  cottonBales: number;
  yarnKg: number;
  yarnBags: number;
  productionRunning: boolean;
  dispatchCount: number;
  qualityHolds: number;
  simulateFlow?: boolean;
  onMachineClick?: (m: MachineData) => void;
}

// ─── Zone geometry constants ──────────────────────────────────────────────────

const W = 900;
const H = 500;

const ZONES = {
  cotton:    { x: 10,  y: 10,  w: 150, h: 480, color: '#0ea5e9', label: 'Cotton Store' },
  blowRoom:  { x: 195, y: 15,  w: 135, h: 205, color: '#fbbf24', label: 'Blow Room'    },
  carding:   { x: 195, y: 240, w: 135, h: 205, color: '#f97316', label: 'Carding'      },
  oe:        { x: 360, y: 15,  w: 135, h: 430, color: '#a78bfa', label: 'OE / Ring'    },
  yarn:      { x: 525, y: 15,  w: 190, h: 305, color: '#059669', label: 'Yarn Store'   },
  dispatch:  { x: 525, y: 340, w: 190, h: 150, color: '#8b5cf6', label: 'Dispatch Bay' },
  quality:   { x: 735, y: 15,  w: 155, h: 230, color: '#f59e0b', label: 'Quality / QC' },
  warehouse: { x: 735, y: 265, w: 155, h: 225, color: '#10b981', label: 'Warehouse'    },
};

// Machine slot positions keyed by normalised type substring
const MACHINE_SLOTS = [
  { key: 'blow',    cx: 262, cy: 118 },
  { key: 'card',    cx: 262, cy: 343 },
  { key: 'oe',      cx: 428, cy: 155 },
  { key: 'ring',    cx: 428, cy: 345 },
  { key: 'wind',    cx: 428, cy: 250 },
  { key: 'draw',    cx: 262, cy: 200 },
];

// Flow paths (cotton → machines → yarn)
const FLOW_PATHS = [
  { id: 'f1', d: 'M 160 120 C 185 120 185 118 195 118', color: '#0ea5e9', dur: 1.6 },
  { id: 'f2', d: 'M 160 343 C 185 343 185 343 195 343', color: '#0ea5e9', dur: 1.8 },
  { id: 'f3', d: 'M 330 118 C 355 118 355 155 360 155', color: '#fbbf24', dur: 1.4 },
  { id: 'f4', d: 'M 330 343 C 355 343 355 345 360 345', color: '#f97316', dur: 1.6 },
  { id: 'f5', d: 'M 496 200 C 518 200 518 167 525 167', color: '#a78bfa', dur: 1.2 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ZoneRect: React.FC<{
  zone: typeof ZONES.cotton;
  isDark: boolean;
}> = ({ zone, isDark }) => {
  const { x, y, w, h, color, label } = zone;
  return (
    <g>
      {/* Shadow */}
      <rect x={x + 4} y={y + 4} width={w} height={h} rx={12}
        fill="rgba(0,0,0,0.35)" />
      {/* Zone background */}
      <rect x={x} y={y} width={w} height={h} rx={12}
        fill={isDark ? `${color}14` : `${color}10`}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.5}
      />
      {/* Top label bar */}
      <rect x={x} y={y} width={w} height={26} rx={12}
        fill={`${color}28`} />
      <rect x={x} y={y + 14} width={w} height={12}
        fill={`${color}28`} />
      <text x={x + w / 2} y={y + 17} textAnchor="middle"
        fontSize={9} fontWeight={700} letterSpacing={1}
        fill={color} style={{ textTransform: 'uppercase' }}>
        {label}
      </text>
    </g>
  );
};

const MachineStatusRing: React.FC<{
  cx: number; cy: number; r?: number;
  active: boolean; hasAlert: boolean;
  label: string;
  onPress?: () => void;
}> = ({ cx, cy, r = 28, active, hasAlert, label, onPress }) => {
  const ringColor = hasAlert ? '#ef4444' : active ? '#34d399' : '#64748b';
  const fillColor = hasAlert ? '#ef444418' : active ? '#34d39918' : '#64748b14';

  return (
    <g onClick={onPress} style={{ cursor: onPress ? 'pointer' : 'default' }}>
      {/* Outer pulse ring (only when active/alert) */}
      {(active || hasAlert) && (
        <circle cx={cx} cy={cy} r={r + 6} fill="none"
          stroke={ringColor} strokeWidth={1.5} strokeOpacity={0.6}>
          <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`}
            dur={hasAlert ? '1s' : '2s'} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.1;0.8"
            dur={hasAlert ? '1s' : '2s'} repeatCount="indefinite" />
        </circle>
      )}
      {/* Machine body */}
      <circle cx={cx} cy={cy} r={r}
        fill={fillColor}
        stroke={ringColor} strokeWidth={2}
      />
      {/* Status dot */}
      <circle cx={cx} cy={cy} r={r - 10}
        fill={`${ringColor}30`}
        stroke={ringColor} strokeWidth={1}
      />
      {active && (
        <circle cx={cx} cy={cy} r={6} fill={ringColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {!active && <circle cx={cx} cy={cy} r={6} fill="#334155" />}
      {/* Machine label */}
      <text x={cx} y={cy + r + 14} textAnchor="middle"
        fontSize={8} fontWeight={600} fill={ringColor} letterSpacing={0.5}>
        {label.length > 12 ? label.slice(0, 12) + '…' : label}
      </text>
    </g>
  );
};

const FlowParticle: React.FC<{
  path: string; color: string; dur: number; delay: number; active: boolean;
}> = ({ path, color, dur, delay, active }) => {
  if (!active) return null;
  return (
    <circle r={3.5} fill={color} opacity={0.85}>
      <animateMotion
        dur={`${dur}s`}
        repeatCount="indefinite"
        path={path}
        begin={`${delay}s`}
      />
      <animate attributeName="opacity" values="0;1;1;0" dur={`${dur}s`}
        begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  );
};

const BaleStack: React.FC<{ count: number; kg: number }> = ({ count, kg }) => {
  const maxBales = Math.min(count, 18);
  const cols = 3;
  const rows = Math.ceil(maxBales / cols);
  const bw = 30; const bh = 18; const gap = 4;
  const offsetX = 25; const offsetY = 60;

  return (
    <g>
      {Array.from({ length: maxBales }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = offsetX + col * (bw + gap);
        const y = offsetY + (rows - 1 - row) * (bh + gap);
        const freshness = 1 - (i / maxBales) * 0.4;
        return (
          <g key={i}>
            <rect x={x + 2} y={y + 2} width={bw} height={bh} rx={3}
              fill="rgba(0,0,0,0.3)" />
            <rect x={x} y={y} width={bw} height={bh} rx={3}
              fill={`rgba(14,165,233,${0.5 * freshness})`}
              stroke={`rgba(14,165,233,${0.8 * freshness})`}
              strokeWidth={1}
            />
            {/* Binding lines */}
            <line x1={x + bw * 0.33} y1={y} x2={x + bw * 0.33} y2={y + bh}
              stroke={`rgba(14,165,233,${0.4 * freshness})`} strokeWidth={0.8} />
            <line x1={x + bw * 0.66} y1={y} x2={x + bw * 0.66} y2={y + bh}
              stroke={`rgba(14,165,233,${0.4 * freshness})`} strokeWidth={0.8} />
          </g>
        );
      })}
      {count === 0 && (
        <text x={85} y={260} textAnchor="middle" fontSize={11}
          fill="#475569" fontWeight={500}>No cotton</text>
      )}
      <text x={85} y={430} textAnchor="middle" fontSize={10}
        fill="#0ea5e9" fontWeight={700}>
        {count} bales · {kg.toLocaleString()} kg
      </text>
    </g>
  );
};

const BagGrid: React.FC<{ bags: number; kg: number }> = ({ bags, kg }) => {
  const maxBags = Math.min(bags, 20);
  const cols = 4; const bw = 32; const bh = 22; const gap = 5;
  const offsetX = 535; const offsetY = 65;

  return (
    <g>
      {Array.from({ length: maxBags }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = offsetX + col * (bw + gap);
        const y = offsetY + row * (bh + gap);
        return (
          <g key={i}>
            <rect x={x + 2} y={y + 2} width={bw} height={bh} rx={3}
              fill="rgba(0,0,0,0.3)" />
            <rect x={x} y={y} width={bw} height={bh} rx={3}
              fill="rgba(5,150,105,0.35)" stroke="rgba(52,211,153,0.7)" strokeWidth={1} />
            <text x={x + bw / 2} y={y + bh / 2 + 4} textAnchor="middle"
              fontSize={7} fill="#34d399" fontWeight={700}>60kg</text>
          </g>
        );
      })}
      {bags === 0 && (
        <text x={620} y={167} textAnchor="middle" fontSize={11}
          fill="#475569" fontWeight={500}>No bags</text>
      )}
      <text x={620} y={310} textAnchor="middle" fontSize={10}
        fill="#059669" fontWeight={700}>
        {bags} bags · {kg.toLocaleString()} kg
      </text>
    </g>
  );
};

const TruckIcon: React.FC<{ x: number; y: number; active: boolean }> = ({ x, y, active }) => (
  <g transform={`translate(${x},${y})`}>
    {active && (
      <g>
        <animateTransform attributeName="transform" type="translate"
          values={`${x},${y};${x + 8},${y};${x},${y}`}
          dur="4s" repeatCount="indefinite" />
      </g>
    )}
    {/* Truck body */}
    <rect x={0} y={6} width={55} height={26} rx={4}
      fill={active ? '#8b5cf640' : '#1e293b'} stroke={active ? '#8b5cf6' : '#334155'} strokeWidth={1.5} />
    {/* Cab */}
    <rect x={40} y={2} width={20} height={30} rx={4}
      fill={active ? '#7c3aed50' : '#1e293b'} stroke={active ? '#8b5cf6' : '#334155'} strokeWidth={1.5} />
    {/* Windshield */}
    <rect x={44} y={5} width={13} height={10} rx={2}
      fill={active ? 'rgba(139,92,246,0.4)' : '#334155'} />
    {/* Wheels */}
    <circle cx={12} cy={34} r={6} fill="#1e293b" stroke={active ? '#8b5cf6' : '#475569'} strokeWidth={2} />
    <circle cx={47} cy={34} r={6} fill="#1e293b" stroke={active ? '#8b5cf6' : '#475569'} strokeWidth={2} />
    {/* Headlights */}
    {active && <circle cx={62} cy={14} r={3} fill="#fbbf24" opacity={0.8}>
      <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
    </circle>}
    {/* Cargo label */}
    {active && <text x={20} y={23} fontSize={7} fill="#8b5cf6" fontWeight={700} textAnchor="middle">YARN</text>}
  </g>
);

const GridBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const lines = [];
  const gridSize = 40;
  const color = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  for (let x = 0; x <= W; x += gridSize)
    lines.push(<line key={`gx${x}`} x1={x} y1={0} x2={x} y2={H} stroke={color} strokeWidth={0.5} />);
  for (let y = 0; y <= H; y += gridSize)
    lines.push(<line key={`gy${y}`} x1={0} y1={y} x2={W} y2={y} stroke={color} strokeWidth={0.5} />);
  return <g>{lines}</g>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  machines,
  cottonKg,
  cottonBales,
  yarnKg,
  yarnBags,
  productionRunning,
  dispatchCount,
  qualityHolds,
  simulateFlow = true,
  onMachineClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Assign machines to floor slots by type
  const assignedMachines = useMemo(() => {
    const slots = [...MACHINE_SLOTS];
    return machines.slice(0, slots.length).map((m, i) => ({
      ...m,
      cx: slots[i].cx,
      cy: slots[i].cy,
    }));
  }, [machines]);

  const bgColor = isDark ? '#070e1a' : '#f0fdf4';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(5,150,105,0.12)';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%" height="100%"
      style={{ display: 'block', borderRadius: 16, background: bgColor, border: `1px solid ${borderColor}` }}
      aria-label="EverGreen factory floor"
    >
      <defs>
        <radialGradient id="cottonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="yarnGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
        </marker>
      </defs>

      {/* Grid background */}
      <GridBackground isDark={isDark} />

      {/* Zone glows */}
      <ellipse cx={85} cy={250} rx={80} ry={200} fill="url(#cottonGlow)" />
      <ellipse cx={620} cy={167} rx={100} ry={130} fill="url(#yarnGlow)" />

      {/* Zone rectangles */}
      {Object.values(ZONES).map((z) => (
        <ZoneRect key={z.label} zone={z} isDark={isDark} />
      ))}

      {/* Cotton bales */}
      <BaleStack count={cottonBales} kg={cottonKg} />

      {/* Yarn bags */}
      <BagGrid bags={yarnBags} kg={yarnKg} />

      {/* Flow paths (dashed, always visible) */}
      {FLOW_PATHS.map(({ id, d, color }) => (
        <path key={id} d={d} fill="none"
          stroke={color} strokeWidth={1.5} strokeDasharray="5,4"
          strokeOpacity={0.35} />
      ))}

      {/* Animated particles (active when production is running or simulation enabled) */}
      {FLOW_PATHS.map(({ id, d, color, dur }, i) =>
        [0, 1, 2].map((j) => (
          <FlowParticle
            key={`${id}-p${j}`}
            path={d} color={color}
            dur={dur} delay={j * (dur / 3)}
            active={productionRunning || simulateFlow}
          />
        ))
      )}

      {/* Machine tiles */}
      {assignedMachines.map((m) => (
        <MachineStatusRing
          key={m.id}
          cx={m.cx} cy={m.cy}
          active={m.active}
          hasAlert={(m.openInspections ?? 0) > 0}
          label={m.name}
          onPress={onMachineClick ? () => {
            sfx.playChirp();
            onMachineClick(m);
          } : undefined}
        />
      ))}

      {/* Default ghost machines if none registered */}
      {machines.length === 0 && MACHINE_SLOTS.slice(0, 4).map((slot) => (
        <MachineStatusRing
          key={slot.key} cx={slot.cx} cy={slot.cy}
          active={false} hasAlert={false} label="No data" />
      ))}

      {/* Dispatch bay trucks */}
      <TruckIcon x={540} y={370} active={dispatchCount > 0} />
      <TruckIcon x={630} y={390} active={dispatchCount > 1} />

      {/* Quality hold overlay */}
      {qualityHolds > 0 && (
        <g filter="url(#glow)">
          <rect x={736} y={16} width={153} height={228} rx={11}
            fill="rgba(245,158,11,0.08)"
            stroke="#f59e0b" strokeWidth={2} strokeDasharray="6,3">
            <animate attributeName="stroke-opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x={812} y={135} textAnchor="middle"
            fontSize={11} fontWeight={700} fill="#f59e0b">
            {qualityHolds} HOLD{qualityHolds > 1 ? 'S' : ''}
          </text>
        </g>
      )}

      {/* Production running banner */}
      {productionRunning && (
        <g>
          <rect x={360} y={460} width={135} height={24} rx={8}
            fill="rgba(5,150,105,0.25)" stroke="#059669" strokeWidth={1}>
            <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x={428} y={476} textAnchor="middle"
            fontSize={9} fontWeight={700} fill="#34d399" letterSpacing={1}>
            ⚡ PRODUCTION RUNNING
          </text>
        </g>
      )}

      {/* Compass legend (bottom-left) */}
      <text x={16} y={494} fontSize={8} fill={isDark ? '#334155' : '#94a3b8'} fontWeight={500}>
        ← INWARD · PRODUCTION → OUTWARD →
      </text>
    </svg>
  );
};

export default FloorCanvas;
