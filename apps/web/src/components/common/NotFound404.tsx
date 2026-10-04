import React from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  PrecisionManufacturing as ProductionIcon,
  AccountBalanceWallet as CostIcon,
  ReceiptLong as BillingIcon,
  HealthAndSafety as HealthIcon,
  Storage as DbIcon,
} from '@mui/icons-material';

interface NotFoundProps {
  pageName: string;
  onNavigate: (page: string) => void;
}

export const NotFound404: React.FC<NotFoundProps> = ({ pageName, onNavigate }) => {
  // Security: strip query strings and sanitize display string to avoid leaking sensitive query tokens
  const cleanPage = String(pageName || '')
    .split('?')[0]
    .replace(/[^\w\-/]/g, '')
    .slice(0, 50);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const dbStudioUrl = token
    ? `http://localhost:5555/?token=${encodeURIComponent(token)}`
    : 'http://localhost:5555';
  const healthHubUrl = token
    ? `http://localhost:4301/health?token=${encodeURIComponent(token)}`
    : 'http://localhost:4301/health';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        px: 3,
        py: 6,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 620,
          width: '100%',
          p: { xs: 4, sm: 6 },
          borderRadius: '24px',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.2)',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(18, 26, 43, 0.85)' : '#ffffff',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <Chip
          label="HTTP 404 NOT FOUND"
          color="error"
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            fontFamily: 'monospace',
            mb: 2.5,
          }}
        />

        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.03em',
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
            background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
          Page Not Found
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Chip
            label={`/${cleanPage || 'unknown'}`}
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
            }}
          />
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 440,
            mx: 'auto',
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          The requested page does not exist. No confidential information or internal system structures are exposed.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => onNavigate('dashboard')}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            href={healthHubUrl}
            target="_blank"
            startIcon={<HealthIcon />}
            sx={{ borderRadius: '12px', px: 2.5, fontWeight: 600 }}
          >
            API Health Hub
          </Button>
          <Button
            variant="outlined"
            href={dbStudioUrl}
            target="_blank"
            startIcon={<DbIcon />}
            sx={{ borderRadius: '12px', px: 2.5, fontWeight: 600 }}
          >
            Database Studio
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound404;
