import React, { useState, useCallback } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreIcon,
  CheckBox as CheckAllIcon,
  CheckBoxOutlineBlank as UncheckAllIcon,
} from '@mui/icons-material';

interface BulkActionsProps<T> {
  items: T[];
  selectedIds: (string | number)[];
  onSelectionChange: (selectedIds: (string | number)[]) => void;
  onBulkDelete?: (ids: (string | number)[]) => void;
  onBulkExport?: (ids: (string | number)[], format: 'excel' | 'pdf' | 'csv') => void;
  getItemId: (item: T) => string | number;
  disabled?: boolean;
}

/**
 * Bulk Actions Component
 * Checkbox selection with bulk delete/export functionality
 */
export function BulkActions<T>({
  items,
  selectedIds,
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  getItemId,
  disabled = false,
}: BulkActionsProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const allSelected = selectedIds.length === items.length && items.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;
  const hasSelection = selectedIds.length > 0;

  const handleToggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(getItemId));
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBulkDelete = () => {
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    onBulkDelete?.(selectedIds);
    onSelectionChange([]);
    setConfirmDialogOpen(false);
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    onBulkExport?.(selectedIds, format);
    handleMenuClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
        <Tooltip title={allSelected ? "Deselect All" : "Select All"}>
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={handleToggleAll}
            disabled={disabled || items.length === 0}
          />
        </Tooltip>

        {hasSelection && (
          <>
            <Chip
              label={`${selectedIds.length} selected`}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />

            <Box sx={{ flexGrow: 1 }} />

            {onBulkDelete && (
              <Tooltip title="Delete Selected">
                <IconButton
                  color="error"
                  onClick={handleBulkDelete}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}

            {onBulkExport && (
              <Tooltip title="Export Selected">
                <IconButton
                  color="primary"
                  onClick={handleMenuOpen}
                  size="small"
                >
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            )}

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
                Export Selected ({selectedIds.length})
              </Typography>
              <Divider />
              <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
              <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedIds.length} selected items?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete {selectedIds.length} Items
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface SelectableRowProps {
  id: string | number;
  selected: boolean;
  onToggle: (id: string | number) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Selectable Row Component
 * Wraps table row with checkbox
 */
export const SelectableRow: React.FC<SelectableRowProps> = ({
  id,
  selected,
  onToggle,
  disabled,
  children,
}) => {
  return (
    <>
      <Checkbox
        checked={selected}
        onChange={() => onToggle(id)}
        disabled={disabled}
      />
      {children}
    </>
  );
};

export default BulkActions;
