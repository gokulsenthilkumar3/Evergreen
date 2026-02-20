import React from 'react';
import { Paper, Typography, Box, Divider, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  title?: string;
  formatValue?: (value: number, name: string) => string;
  additionalInfo?: { label: string; value: string }[];
}

/**
 * Advanced Chart Tooltip for Recharts
 * Usage: <Tooltip content={<AdvancedChartTooltip ... />} />
 */
const AdvancedChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  title,
  formatValue = (v) => v.toLocaleString(),
  additionalInfo,
}) => {
  const theme = useTheme();

  if (!active || !payload || payload.length === 0) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        minWidth: 200,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      }}
    >
      {/* Header */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        {title || label}
      </Typography>

      <Divider sx={{ my: 1 }} />

      {/* Data Rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: entry.color || entry.fill || theme.palette.primary.main,
              }}
            />
            <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatValue(entry.value, entry.name)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Additional Info */}
      {additionalInfo && additionalInfo.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {additionalInfo.map((info, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {info.label}:
                </Typography>
                <Chip
                  label={info.value}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Total if multiple values */}
      {payload.length > 1 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Total:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatValue(
                payload.reduce((sum, entry) => sum + (entry.value || 0), 0),
                'total'
              )}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default AdvancedChartTooltip;
