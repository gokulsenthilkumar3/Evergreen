import React from 'react';
import { Box, Typography, Button, Paper, Fade } from '@mui/material';
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
          p: 6,
          textAlign: 'center',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              animation: type === 'empty' ? 'float 3s ease-in-out infinite' : 'none',
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
          <Button
            variant="contained"
            color={type === 'error' ? 'error' : 'primary'}
            startIcon={<AddIcon />}
            onClick={onAction}
            sx={{ mt: 1, px: 3, py: 1 }}
          >
            {actionLabel}
          </Button>
        )}
      </Paper>
    </Fade>
  );
};

export default EmptyState;
