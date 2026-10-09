import React, { useEffect, useRef } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalShippingOutlined, Inventory2Outlined, FactoryOutlined, ReceiptLongOutlined, BuildOutlined, VerifiedOutlined, PaymentsOutlined } from '@mui/icons-material';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EventKind =
  | 'inward'
  | 'production'
  | 'dispatch'
  | 'invoice'
  | 'payment'
  | 'inspection'
  | 'quality'
  | 'order'
  | 'system';

export interface FeedEvent {
  id: string;
  kind: EventKind;
  title: string;
  subtitle: string;
  timestamp: string;   // ISO string
  badge?: string;
  color?: string;
}

interface ActivityFeedProps {
  events: FeedEvent[];
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KIND_META: Record<EventKind, { emoji: string; color: string; label: string }> = {
  inward:     { emoji: '🌿', color: '#0ea5e9', label: 'Inward'     },
  production: { emoji: '🏭', color: '#059669', label: 'Production' },
  dispatch:   { emoji: '🚛', color: '#8b5cf6', label: 'Dispatch'   },
  invoice:    { emoji: '📄', color: '#6366f1', label: 'Invoice'    },
  payment:    { emoji: '💰', color: '#10b981', label: 'Payment'    },
  inspection: { emoji: '⚙️', color: '#f59e0b', label: 'Machine'    },
  quality:    { emoji: '🔬', color: '#f97316', label: 'Quality'    },
  order:      { emoji: '📦', color: '#a78bfa', label: 'Order'      },
  system:     { emoji: '🔔', color: '#64748b', label: 'System'     },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return 'Date unavailable';
  if (diff < 0) return new Date(iso).toLocaleDateString('en-IN');
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Event row ────────────────────────────────────────────────────────────────

const EventRow: React.FC<{ event: FeedEvent; isFirst: boolean }> = ({ event, isFirst }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const meta = KIND_META[event.kind];
  const color = event.color ?? meta.color;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box
        sx={{
          display: 'flex', gap: 1.5, py: 1.25, px: 1.5,
          borderRadius: '12px',
          background: isFirst
            ? isDark ? `${color}12` : `${color}08`
            : 'transparent',
          border: isFirst
            ? `1px solid ${color}25`
            : '1px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: isDark ? `${color}10` : `${color}07`,
            border: `1px solid ${color}22`,
          },
        }}
      >
        {/* Emoji + vertical line */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: '10px',
              background: isDark ? `${color}22` : `${color}15`,
              border: `1px solid ${color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0,
            }}
          >
            {event.kind === 'inward' ? <Inventory2Outlined sx={{ fontSize: 17 }} /> : event.kind === 'production' ? <FactoryOutlined sx={{ fontSize: 17 }} /> : event.kind === 'dispatch' ? <LocalShippingOutlined sx={{ fontSize: 17 }} /> : event.kind === 'inspection' ? <BuildOutlined sx={{ fontSize: 17 }} /> : event.kind === 'quality' ? <VerifiedOutlined sx={{ fontSize: 17 }} /> : event.kind === 'payment' ? <PaymentsOutlined sx={{ fontSize: 17 }} /> : <ReceiptLongOutlined sx={{ fontSize: 17 }} />}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, mb: 0.25 }}>
            <Typography
              sx={{
                fontSize: '0.78rem', fontWeight: 700,
                color: isDark ? '#f1f5f9' : '#0f172a',
                overflowWrap: 'anywhere',
              }}
            >
              {event.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', fontSize: '0.66rem', flexShrink: 0 }}
            >
              {timeAgo(event.timestamp)}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block' }}
          >
            {event.subtitle}
          </Typography>
          {event.badge && (
            <Chip
              label={event.badge}
              size="small"
              sx={{
                mt: 0.5, height: 18, fontSize: '0.62rem', fontWeight: 700,
                backgroundColor: `${color}22`, color: color,
                border: `1px solid ${color}30`,
              }}
            />
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

// ─── Empty / Loading state ────────────────────────────────────────────────────

const FeedSkeleton: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex', gap: 1.5, py: 1.25, px: 1.5, mb: 0.5,
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% center' },
              '100%': { backgroundPosition: '200% center' },
            },
          }}
        >
          <Box
            sx={{
              width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              backgroundImage: isDark
                ? 'linear-gradient(90deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 75%)'
                : 'linear-gradient(90deg, rgba(0,0,0,0) 25%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 75%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 1.5s linear infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{
              height: 12, mb: 1, borderRadius: 6,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              backgroundImage: isDark
                ? 'linear-gradient(90deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 75%)'
                : 'linear-gradient(90deg, rgba(0,0,0,0) 25%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 75%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 1.5s linear infinite',
              animationDelay: `${i * 0.15}s`,
              width: `${60 + (i * 7) % 35}%`,
            }} />
            <Box sx={{
              height: 10, borderRadius: 6,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              width: `${40 + (i * 11) % 30}%`,
            }} />
          </Box>
        </Box>
      ))}
    </>
  );
};

// ─── ActivityFeed ─────────────────────────────────────────────────────────────

const ActivityFeed: React.FC<ActivityFeedProps> = ({ events, isLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  return (
    <Box
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: isDark
          ? 'rgba(15,23,42,0.6)'
          : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '14px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2, py: 1.75,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          display: 'flex', alignItems: 'center', gap: 1,
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          flexShrink: 0,
        }}
      >
        {/* Live indicator */}
        <Box
          sx={{
            width: 8, height: 8, borderRadius: '50%', background: '#10b981',
            '@keyframes livePulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.5, transform: 'scale(1.3)' },
            },
            animation: 'none',
          }}
        />
        <Typography
          sx={{
            fontSize: '0.75rem', fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: isDark ? '#94a3b8' : '#64748b',
          }}
        >
          Recent activity
        </Typography>
        {events.length > 0 && (
          <Chip
            label={events.length}
            size="small"
            sx={{
              ml: 'auto', height: 18, fontSize: '0.65rem', fontWeight: 700,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          />
        )}
      </Box>

      {/* Scrollable list */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1, overflowY: 'auto', p: 1,
          display: 'flex', flexDirection: 'column', gap: 0.5,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? '#334155' : '#cbd5e1', borderRadius: '4px',
          },
        }}
      >
        {isLoading ? (
          <FeedSkeleton />
        ) : events.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, py: 4 }}>
            <Typography sx={{ fontSize: '2rem' }}>🌿</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
              No recent activity.<br />Events will appear here.
            </Typography>
          </Box>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event, i) => (
              <EventRow key={event.id} event={event} isFirst={i === 0} />
            ))}
          </AnimatePresence>
        )}
      </Box>
    </Box>
  );
};

export default ActivityFeed;
export type { ActivityFeedProps };
