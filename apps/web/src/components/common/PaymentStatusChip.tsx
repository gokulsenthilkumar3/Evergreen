import React from 'react';
import { Chip, Box } from '@mui/material';
import {
  CheckCircle as PaidIcon,
  Warning as PartialIcon,
  Cancel as UnpaidIcon,
} from '@mui/icons-material';

type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | string;

interface StatusChipProps {
  status: PaymentStatus;
  showIcon?: boolean;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

/**
 * Standardized Payment Status Chip
 * Shows PAID (green + check), PARTIAL (orange + warning), UNPAID (red + X)
 */
const PaymentStatusChip: React.FC<StatusChipProps> = ({
  status,
  showIcon = true,
  size = 'small',
  variant = 'outlined',
}) => {
  const config = {
    PAID: {
      color: 'success' as const,
      icon: <PaidIcon fontSize="small" />,
      label: 'PAID',
    },
    PARTIAL: {
      color: 'warning' as const,
      icon: <PartialIcon fontSize="small" />,
      label: 'PARTIAL',
    },
    UNPAID: {
      color: 'error' as const,
      icon: <UnpaidIcon fontSize="small" />,
      label: 'UNPAID',
    },
  };

  const normalizedStatus = (status?.toUpperCase() || 'UNPAID') as keyof typeof config;
  const { color, icon, label } = config[normalizedStatus] || config.UNPAID;

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant={variant}
      icon={showIcon ? icon : undefined}
      sx={{
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    />
  );
};

export default PaymentStatusChip;
