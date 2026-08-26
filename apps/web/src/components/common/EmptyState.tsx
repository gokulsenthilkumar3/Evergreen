import React from 'react';
import { Box, Typography, Button, Paper, Fade, Stack } from '@mui/material';
import {
  Inbox as InboxIcon,
  SearchOff as SearchOffIcon,
  FilterList as FilterIcon,
  ErrorOutline as ErrorIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  type?: 'empty' | 'search' | 'filter' | 'error';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  const config = {
    empty: {
      icon: <InboxIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.6 }} />,
      defaultTitle: 'No Data Available',
      defaultMessage: 'There are no records to display at this time.',
      color: 'text.disabled',
    },
    search: {
      icon: <SearchOffIcon sx={{ fontSize: 80, color: 'info.main', mb: 2, opacity: 0.6 }} />,
      defaultTitle: 'No Results Found',
      defaultMessage: 'Try adjusting your search or filters to find what you\'re looking for.',
      color: 'info.main',
    },
    filter: {
      icon: <FilterIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2, opacity: 0.6 }} />,
      defaultTitle: 'No Matching Records',
      defaultMessage: 'No records match the selected filters. Try clearing some filters.',
      color: 'warning.main',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />,
      defaultTitle: 'Error Loading Data',
      defaultMessage: 'Something went wrong while loading the data. Please try again.',
      color: 'error.main',
    },
  };

  const { icon: defaultIcon, defaultTitle, defaultMessage, color } = config[type];

  return (
    <Fade in timeout={300}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.03)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          transition: 'all 0.24s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 16px 36px -20px rgba(0,0,0,0.7)'
            : '0 16px 36px -24px rgba(15,23,42,0.18)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              animation: type === 'empty' ? 'float 3.5s ease-in-out infinite' : 'none',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          >
            {icon || defaultIcon}
          </Box>
        </Box>
        <Typography variant="h6" color={color} gutterBottom sx={{ fontWeight: 600 }}>
          {title || defaultTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
          {message || defaultMessage}
        </Typography>
        {actionLabel && onAction && (
          <Stack direction="row" justifyContent="center">
            <Button
              variant="contained"
              color={type === 'error' ? 'error' : 'primary'}
              startIcon={<AddIcon />}
              onClick={onAction}
              sx={{ mt: 1, px: 3, py: 1.1, borderRadius: 999 }}
            >
              {actionLabel}
            </Button>
          </Stack>
        )}
      </Paper>
    </Fade>
  );
};

export default EmptyState;
