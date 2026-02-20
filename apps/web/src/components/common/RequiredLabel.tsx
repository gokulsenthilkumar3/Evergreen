import React from 'react';
import { Typography, Box, Tooltip } from '@mui/material';

interface RequiredLabelProps {
  label: string;
  required?: boolean;
  tooltip?: string;
}

/**
 * Required Label Component
 * Shows label with red asterisk for required fields
 */
const RequiredLabel: React.FC<RequiredLabelProps> = ({ label, required = false, tooltip }) => {
  const labelContent = (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {label}
      {required && (
        <Box
          component="span"
          sx={{
            color: 'error.main',
            fontWeight: 700,
            fontSize: '1.1em',
          }}
        >
          *
        </Box>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        <Typography component="span" variant="inherit">
          {labelContent}
        </Typography>
      </Tooltip>
    );
  }

  return <>{labelContent}</>;
};

export default RequiredLabel;
