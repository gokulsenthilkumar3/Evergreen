import React from 'react';
import { Box, Typography, Button, IconButton, Paper, useTheme, alpha } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

export interface ThemeNotificationBannerProps {
  variant: NotificationVariant;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  details?: string | React.ReactNode;
  sx?: Record<string, any>;
}

export const ThemeNotificationBanner: React.FC<ThemeNotificationBannerProps> = ({
  variant,
  title,
  message,
  actionLabel,
  onAction,
  onClose,
  details,
  sx = {},
}) => {
  const theme = useTheme();

  const variantConfig = {
    success: {
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
      border: alpha(theme.palette.success.main, 0.35),
      icon: <SuccessIcon sx={{ color: theme.palette.success.main }} />,
      defaultTitle: 'Success',
    },
    error: {
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
      border: alpha(theme.palette.error.main, 0.35),
      icon: <ErrorIcon sx={{ color: theme.palette.error.main }} />,
      defaultTitle: 'Validation Block',
    },
    warning: {
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
      border: alpha(theme.palette.warning.main, 0.35),
      icon: <WarningIcon sx={{ color: theme.palette.warning.main }} />,
      defaultTitle: 'Caution Required',
    },
    info: {
      color: theme.palette.info.main,
      bg: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
      border: alpha(theme.palette.info.main, 0.35),
      icon: <InfoIcon sx={{ color: theme.palette.info.main }} />,
      defaultTitle: 'Notice',
    },
  };

  const config = variantConfig[variant] || variantConfig.info;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        backgroundColor: config.bg,
        border: `1.5px solid ${config.border}`,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.75,
        position: 'relative',
        transition: 'all 0.2s ease',
        ...sx,
      }}
    >
      <Box sx={{ mt: 0.25, display: 'flex', alignItems: 'center' }}>
        {config.icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: config.color,
            letterSpacing: -0.2,
            mb: 0.25,
          }}
        >
          {title || config.defaultTitle}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
          {message}
        </Typography>

        {details && (
          <Box sx={{ mt: 1, p: 1, backgroundColor: alpha('#000', 0.04), borderRadius: 1.5, fontSize: '0.8rem' }}>
            {typeof details === 'string' ? (
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {details}
              </Typography>
            ) : (
              details
            )}
          </Box>
        )}

        {actionLabel && onAction && (
          <Box sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="contained"
              endIcon={<ArrowIcon />}
              onClick={onAction}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: config.color,
                '&:hover': {
                  backgroundColor: alpha(config.color, 0.85),
                },
              }}
            >
              {actionLabel}
            </Button>
          </Box>
        )}
      </Box>

      {onClose && (
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary', p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

export default ThemeNotificationBanner;
