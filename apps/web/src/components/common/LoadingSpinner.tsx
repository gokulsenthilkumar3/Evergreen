import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  showLogo?: boolean;
}

/**
 * Branded Loading Spinner Component
 * Shows company branded loading state
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 60,
  showLogo = true,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: 200,
        bgcolor: 'transparent',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
        {showLogo && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                fontSize: size * 0.4,
              }}
            >
              E
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Paper>
  );
};

/**
 * Full page loading spinner
 */
export const FullPageLoader: React.FC<{ message?: string }> = ({ message = 'Loading EverGreen...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(0.95)' },
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: 'primary.contrastText',
          }}
        >
          E
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        EverGreen
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      <CircularProgress size={24} sx={{ mt: 3 }} />
    </Box>
  );
};

export default LoadingSpinner;
