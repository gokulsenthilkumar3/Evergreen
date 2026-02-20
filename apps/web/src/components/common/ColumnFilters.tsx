import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Popover,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface ColumnFilterProps {
  columns: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  onSortChange: (sort: SortConfig | null) => void;
  activeFilters: Record<string, any>;
  activeSort: SortConfig | null;
}

/**
 * Column Filter Component
 * Multi-column filtering and sorting for tables
 */
export const ColumnFilters: React.FC<ColumnFilterProps> = ({
  columns,
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedColumn(null);
  };

  const handleFilterApply = (key: string, value: any) => {
    onFilterChange({ ...activeFilters, [key]: value });
  };

  const handleFilterClear = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    onFilterChange(newFilters);
  };

  const handleSort = (key: string) => {
    if (activeSort?.key === key) {
      // Toggle direction
      onSortChange(activeSort.direction === 'asc' ? { key, direction: 'desc' } : null);
    } else {
      onSortChange({ key, direction: 'asc' });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({});
    onSortChange(null);
  };

  const filterCount = Object.keys(activeFilters).length;
  const hasActiveFilters = filterCount > 0 || activeSort !== null;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Tooltip title="Filter & Sort">
          <IconButton onClick={handleOpen} color={hasActiveFilters ? 'primary' : 'default'}>
            <FilterIcon />
          </IconButton>
        </Tooltip>

        {/* Active filter chips */}
        {Object.entries(activeFilters).map(([key, value]) => {
          const column = columns.find(c => c.key === key);
          if (!column) return null;
          return (
            <Chip
              key={key}
              label={`${column.label}: ${value}`}
              size="small"
              onDelete={() => handleFilterClear(key)}
              color="primary"
              variant="outlined"
            />
          );
        })}

        {activeSort && (
          <Chip
            label={`Sort: ${columns.find(c => c.key === activeSort.key)?.label} (${activeSort.direction})`}
            size="small"
            icon={activeSort.direction === 'asc' ? <AscIcon /> : <DescIcon />}
            onDelete={() => onSortChange(null)}
            color="secondary"
            variant="outlined"
          />
        )}

        {hasActiveFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, minWidth: 300 } }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filter & Sort
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Sort Section */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Sort By
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {columns.map(column => (
            <Button
              key={column.key}
              size="small"
              variant={activeSort?.key === column.key ? 'contained' : 'outlined'}
              onClick={() => handleSort(column.key)}
              endIcon={
                activeSort?.key === column.key ? (
                  activeSort.direction === 'asc' ? <AscIcon /> : <DescIcon />
                ) : null
              }
            >
              {column.label}
            </Button>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Filter Section */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Filter By
        </Typography>
        {columns.map(column => (
          <Box key={column.key} sx={{ mb: 2 }}>
            {column.type === 'select' ? (
              <FormControl fullWidth size="small">
                <InputLabel>{column.label}</InputLabel>
                <Select
                  value={activeFilters[column.key] || ''}
                  label={column.label}
                  onChange={(e) => handleFilterApply(column.key, e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {column.options?.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : column.type === 'date' ? (
              <TextField
                fullWidth
                size="small"
                type="date"
                label={column.label}
                value={activeFilters[column.key] || ''}
                onChange={(e) => handleFilterApply(column.key, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <TextField
                fullWidth
                size="small"
                label={column.label}
                value={activeFilters[column.key] || ''}
                onChange={(e) => handleFilterApply(column.key, e.target.value)}
                placeholder={`Filter by ${column.label.toLowerCase()}...`}
              />
            )}
          </Box>
        ))}
      </Popover>
    </>
  );
};

export default ColumnFilters;
