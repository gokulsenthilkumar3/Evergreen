import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { GrassOutlined, Inventory2Outlined, FactoryOutlined, RecyclingOutlined, SettingsOutlined, PaymentsOutlined } from '@mui/icons-material';

const metricIcons: Record<string, React.ReactNode> = {
  cotton: <GrassOutlined fontSize="small" />, yarn: <Inventory2Outlined fontSize="small" />,
  production: <FactoryOutlined fontSize="small" />, waste: <RecyclingOutlined fontSize="small" />,
  machines: <SettingsOutlined fontSize="small" />, cost: <PaymentsOutlined fontSize="small" />,
};

// ─── Animated Counter Hook ─────────────────────────────────────────────────────

function useCountUp(target: number, duration = 800): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      prevTarget.current = target;
      return;
    }
    if (target === prevTarget.current) return;
    const from = prevTarget.current;
    prevTarget.current = target;
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    let frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reducedMotion]);

  return value;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface KpiCard {
  id: string;
  label: string;
  value: number;
  unit: string;
  subLabel?: string;
  subValue?: string;
  color: string;
  icon: string;          // emoji
  trend?: 'up' | 'down' | 'flat';
  trendPct?: number;
  hasData: boolean;
}

export interface KpiRibbonProps {
  cards: KpiCard[];
  isLoading?: boolean;
}

// ─── Single KPI Card ──────────────────────────────────────────────────────────

const StatCard: React.FC<{ card: KpiCard; index: number }> = ({ card, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const count = useCountUp(card.hasData ? card.value : 0);

  const trendIcon = card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→';
  const trendColor = card.trend === 'up' ? '#10b981' : card.trend === 'down' ? '#ef4444' : '#94a3b8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{ minWidth: 0, height: '100%' }}
    >
      <Box
        sx={{
          minWidth: 0,
          height: '100%', boxSizing: 'border-box',
          p: { xs: '14px 12px', sm: '16px 20px' },
          borderRadius: '12px',
          background: isDark
            ? '#182733' : '#ffffff',
          border: `1px solid ${isDark ? '#2a3c48' : '#e0e8e3'}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 4px #193c2704',
          transition: 'all 0.3s ease',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: isDark ? '#466152' : '#b8cebf',
          },
        }}
      >
        {/* Glow bar at top */}
        {card.hasData && (
          <Box
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
              display: 'none',
            }}
          />
        )}

        {/* Icon + label row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Box
            sx={{
              color: isDark ? '#91bda8' : '#51826b', display: 'flex', lineHeight: 1,
              filter: card.hasData ? 'none' : 'grayscale(1) opacity(0.4)',
            }}
          >
            {metricIcons[card.id] ?? card.icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700, fontSize: '0.68rem',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {card.label}
          </Typography>
        </Box>

        {/* Main value */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
          {card.hasData ? (
            <>
              <Typography
                sx={{
                  fontSize: { xs: '1.3rem', sm: '1.65rem' }, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.2, overflowWrap: 'anywhere',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {count.toLocaleString('en-IN', { maximumFractionDigits: card.unit === '%' ? 1 : 0 })}
              </Typography>
              <Typography
                sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', mb: 0.2 }}
              >
                {card.unit}
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.disabled' }}>
              No data
            </Typography>
          )}
        </Box>

        {/* Sub-value */}
        {card.subValue && card.hasData && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {card.subValue}
          </Typography>
        )}

        {/* Trend */}
        {card.trend && card.trendPct !== undefined && card.hasData && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: trendColor }}>
              {trendIcon} {Math.abs(card.trendPct).toFixed(1)}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>vs last</Typography>
          </Box>
        )}

        {/* Subtle bottom indicator bar */}
        {card.hasData && (
          <Box
            sx={{
              display: 'none', position: 'absolute', bottom: 0, left: 0,
              height: '3px', width: '100%',
              background: `linear-gradient(90deg, ${card.color}60, ${card.color}10)`,
              borderRadius: '0 0 16px 16px',
            }}
          />
        )}
      </Box>
    </motion.div>
  );
};

// ─── Skeleton card ─────────────────────────────────────────────────────────────

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      sx={{
        minWidth: 0, height: 100, p: '16px 20px',
        borderRadius: '16px',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        backgroundImage: isDark
          ? 'linear-gradient(90deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 75%)'
          : 'linear-gradient(90deg, rgba(0,0,0,0) 25%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 75%)',
        backgroundSize: '200% auto',
        animation: 'shimmer 1.5s linear infinite',
        animationDelay: `${index * 0.1}s`,
      }}
    />
  );
};

// ─── KpiRibbon ────────────────────────────────────────────────────────────────

const KpiRibbon: React.FC<KpiRibbonProps> = ({ cards, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, alignItems: 'stretch', gap: { xs: 1, sm: 2 },
        minWidth: 0, pb: 1,
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          background: isDark ? '#334155' : '#cbd5e1',
          borderRadius: '4px',
        },
      }}
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
        : cards.map((card, i) => <StatCard key={card.id} card={card} index={i} />)
      }
    </Box>
  );
};

export default KpiRibbon;
