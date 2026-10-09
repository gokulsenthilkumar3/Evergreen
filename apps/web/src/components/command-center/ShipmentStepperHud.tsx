import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  LocalShippingOutlined,
  ExpandMore,
  ExpandLess,
  NavigationOutlined,
  Inventory2Outlined,
  FiberManualRecord,
  AccessTimeOutlined,
  PersonOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { sfx } from '../../utils/sfx';

export interface ActiveShipment {
  id: string;
  orderCode: string;
  customerName: string;
  yarnBags: number;
  weightKg: number;
  driverName: string;
  vehicleNo: string;
  eta: string;
  currentStep: number; // 0 to 4
  steps: string[];
}

interface ShipmentStepperHudProps {
  shipments?: ActiveShipment[];
  defaultOpen?: boolean;
}

const DEFAULT_SHIPMENTS: ActiveShipment[] = [
  {
    id: 'shp-1',
    orderCode: 'SO-8924',
    customerName: 'Lakshmi Weaving Mills',
    yarnBags: 7,
    weightKg: 420,
    driverName: 'Marcus Vance',
    vehicleNo: 'TN-38-AX-4821',
    eta: '45 mins',
    currentStep: 2, // 0: Placed, 1: Staged, 2: Loaded to Truck, 3: In Transit, 4: Delivered
    steps: ['Order Placed', 'Bales Settled', 'Loaded (Bay 02)', 'In Transit', 'Delivered'],
  },
  {
    id: 'shp-2',
    orderCode: 'SO-8931',
    customerName: 'Sri Amman Spinners',
    yarnBags: 12,
    weightKg: 720,
    driverName: 'S. Rajendran',
    vehicleNo: 'TN-33-BZ-1904',
    eta: '1h 20m',
    currentStep: 3,
    steps: ['Order Placed', 'Bales Settled', 'Loaded (Bay 01)', 'In Transit', 'Delivered'],
  },
];

export const ShipmentStepperHud: React.FC<ShipmentStepperHudProps> = ({
  shipments = DEFAULT_SHIPMENTS,
  defaultOpen = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(defaultOpen);

  const activeShipment = shipments[selectedIndex] || DEFAULT_SHIPMENTS[0];

  const hudBg = isDark
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(10, 16, 32, 0.96) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%)';
  const borderCol = isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(8, 127, 101, 0.2)';

  return (
    <Box
      sx={{
        borderRadius: '16px',
        background: hudBg,
        border: `1px solid ${borderCol}`,
        backdropFilter: 'blur(16px)',
        boxShadow: isDark
          ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)',
        p: 2,
        width: { xs: '100%', sm: 390 },
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
          background: 'linear-gradient(90deg, #0ea5e9, #10b981, #8b5cf6)',
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
              bgcolor: isDark ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.12)',
              color: '#0ea5e9',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <LocalShippingOutlined sx={{ fontSize: 16 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0ea5e9', fontSize: '0.65rem' }}>
              Strategy Game HUD
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '0.85rem' }}>
              Active Shipment Tracking
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Order Switcher Pills */}
          {shipments.length > 1 && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {shipments.map((s, idx) => (
                <Chip
                  key={s.id}
                  label={s.orderCode}
                  size="small"
                  clickable
                  onClick={() => {
                    sfx.playClick();
                    setSelectedIndex(idx);
                  }}
                  sx={{
                    height: 20,
                    fontSize: '0.62rem',
                    fontWeight: selectedIndex === idx ? 800 : 600,
                    bgcolor: selectedIndex === idx ? (isDark ? '#0ea5e9' : '#0284c7') : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    color: selectedIndex === idx ? '#fff' : 'text.secondary',
                  }}
                />
              ))}
            </Box>
          )}

          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={{ width: 26, height: 26, color: 'text.secondary' }}
          >
            {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Primary Details Row */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
            {activeShipment.customerName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            {activeShipment.yarnBags} Bags · {activeShipment.weightKg} kg High-Count Yarn
          </Typography>
        </Box>
        <Chip
          label={`ETA ${activeShipment.eta}`}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.65rem',
            bgcolor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        />
      </Box>

      <Collapse in={expanded}>
        {/* Glowing 5-Node Stepper from Reference Video */}
        <Box sx={{ my: 1.5, position: 'relative', px: 0.5 }}>
          {/* Connector Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 18,
              right: 18,
              height: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              zIndex: 1,
            }}
          />
          {/* Progress filled line */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 18,
              width: `${(activeShipment.currentStep / (activeShipment.steps.length - 1)) * 90}%`,
              height: 2,
              background: 'linear-gradient(90deg, #10b981, #0ea5e9)',
              zIndex: 2,
              transition: 'width 0.4s ease',
            }}
          />

          {/* Stepper Nodes */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
            {activeShipment.steps.map((label, stepIdx) => {
              const isPassed = stepIdx < activeShipment.currentStep;
              const isCurrent = stepIdx === activeShipment.currentStep;

              return (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 62,
                    textAlign: 'center',
                  }}
                >
                  {/* Node Circle */}
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: isPassed
                        ? '#10b981'
                        : isCurrent
                        ? '#0ea5e9'
                        : isDark
                        ? '#1e293b'
                        : '#e2e8f0',
                      color: isPassed || isCurrent ? '#fff' : '#64748b',
                      fontSize: 10,
                      fontWeight: 800,
                      boxShadow: isCurrent
                        ? '0 0 12px #0ea5e9, 0 0 4px #0ea5e9'
                        : isPassed
                        ? '0 0 8px rgba(16, 185, 129, 0.5)'
                        : 'none',
                      border: isCurrent ? '2px solid #fff' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle sx={{ fontSize: 14 }} />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ display: 'grid', placeItems: 'center' }}
                      >
                        <FiberManualRecord sx={{ fontSize: 8 }} />
                      </motion.div>
                    ) : (
                      stepIdx + 1
                    )}
                  </Box>

                  {/* Step Label */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.58rem',
                      fontWeight: isCurrent ? 800 : isPassed ? 700 : 500,
                      color: isCurrent
                        ? (isDark ? '#38bdf8' : '#0284c7')
                        : isPassed
                        ? (isDark ? '#34d399' : '#059669')
                        : 'text.secondary',
                      mt: 0.75,
                      lineHeight: 1.15,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Driver & Dispatch Meta Card */}
        <Box
          sx={{
            mt: 2,
            pt: 1.25,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PersonOutline sx={{ fontSize: 15, color: '#0ea5e9' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155' }}>
              {activeShipment.driverName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <NavigationOutlined sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace', color: isDark ? '#a7f3d0' : '#065f46' }}>
              {activeShipment.vehicleNo}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ShipmentStepperHud;
