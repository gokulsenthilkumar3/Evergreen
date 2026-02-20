import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Popover,
  TextField,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CameraAlt as CameraIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';

interface ChartToolbarProps {
  chartRef: React.RefObject<HTMLDivElement>;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  onPeriodChange?: (period: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
  startDate?: string;
  endDate?: string;
  title?: string;
}

/**
 * Chart Toolbar Component
 * Export chart as image + time range selector
 */
export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  chartRef,
  onDateRangeChange,
  onPeriodChange,
  startDate: initialStartDate,
  endDate: initialEndDate,
  title = 'Chart',
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dateAnchorEl, setDateAnchorEl] = useState<HTMLElement | null>(null);
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [activePeriod, setActivePeriod] = useState<string | null>(null);

  const handleExportImage = useCallback(() => {
    if (!chartRef.current) return;

    // Use html2canvas approach or SVG serialization
    const svg = chartRef.current.querySelector('svg');
    if (!svg) {
      console.error('No SVG found in chart');
      return;
    }

    // Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = pngUrl;
      link.click();
      
      URL.revokeObjectURL(url);
    };

    img.src = url;
    setAnchorEl(null);
  }, [chartRef, title]);

  const handleExportSVG = useCallback(() => {
    if (!chartRef.current) return;
    
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `${title}_${new Date().toISOString().split('T')[0]}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
    setAnchorEl(null);
  }, [chartRef, title]);

  const handlePeriodClick = (period: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    setActivePeriod(period);
    onPeriodChange?.(period);
    
    // Auto-set date range based on period
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'day':
        start.setDate(end.getDate() - 1);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeChange?.(startStr, endStr);
  };

  const handleCustomDateApply = () => {
    onDateRangeChange?.(startDate, endDate);
    setDateAnchorEl(null);
    setActivePeriod(null);
  };

  const periods = [
    { key: 'day', label: 'Last 24 Hours' },
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'Last 30 Days' },
    { key: 'quarter', label: 'Last Quarter' },
    { key: 'year', label: 'Last Year' },
  ] as const;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {/* Time Range Selector */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {periods.map((period) => (
          <Button
            key={period.key}
            size="small"
            variant={activePeriod === period.key ? 'contained' : 'outlined'}
            onClick={() => handlePeriodClick(period.key)}
            sx={{ minWidth: 'auto', px: 1.5 }}
          >
            {period.label}
          </Button>
        ))}
        
        <Tooltip title="Custom Date Range">
          <IconButton
            size="small"
            onClick={(e) => setDateAnchorEl(e.currentTarget)}
            color={dateAnchorEl ? 'primary' : 'default'}
          >
            <DateRangeIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Export Button */}
      <Tooltip title="Export Chart">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <CameraIcon />
        </IconButton>
      </Tooltip>

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleExportImage}>
          <DownloadIcon sx={{ mr: 1 }} /> Export as PNG
        </MenuItem>
        <MenuItem onClick={handleExportSVG}>
          <DownloadIcon sx={{ mr: 1 }} /> Export as SVG
        </MenuItem>
      </Menu>

      {/* Date Range Popover */}
      <Popover
        open={Boolean(dateAnchorEl)}
        anchorEl={dateAnchorEl}
        onClose={() => setDateAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, minWidth: 300 } }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Custom Date Range
        </Typography>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleCustomDateApply} fullWidth>
          Apply
        </Button>
      </Popover>
    </Box>
  );
};

export default ChartToolbar;
