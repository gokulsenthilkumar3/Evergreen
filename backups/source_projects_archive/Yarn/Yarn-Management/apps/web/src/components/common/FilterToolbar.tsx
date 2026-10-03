import { Box, Paper, IconButton, Collapse, Typography, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFilterPresets } from '../../hooks/useFilterPresets';

interface FilterToolbarProps {
    children: React.ReactNode;
    onClear?: () => void;
    visible?: boolean;
    pageKey?: string;
    currentFilters?: Record<string, any>;
    onPresetLoad?: (filters: Record<string, any>) => void;
}

export default function FilterToolbar({ children, onClear, visible = true, pageKey, currentFilters, onPresetLoad }: FilterToolbarProps) {
    const [expanded, setExpanded] = useState(false);
    const { presets, savePreset, deletePreset } = useFilterPresets(pageKey || '');

    // Preset State
    const [presetMenuAnchor, setPresetMenuAnchor] = useState<null | HTMLElement>(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    // If not visible, return null
    if (!visible) return null;

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                p: { xs: 1, sm: 2 },
                mb: 2,
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                flexWrap: 'wrap'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Filters</Typography>
                <Box sx={{ flexGrow: 1 }} />

                {onClear && (
                    <Button
                        size="small"
                        startIcon={<RestartAltIcon />}
                        onClick={onClear}
                        color="inherit"
                    >
                        Reset
                    </Button>
                )}

                {pageKey && (
                    <>
                        <Button
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={() => setSaveDialogOpen(true)}
                            color="primary"
                        >
                            Save
                        </Button>
                        <Button
                            size="small"
                            startIcon={<BookmarkIcon />}
                            onClick={(e) => setPresetMenuAnchor(e.currentTarget)}
                            color="primary"
                            disabled={presets.length === 0}
                        >
                            Presets ({presets.length})
                        </Button>
                        <Menu
                            anchorEl={presetMenuAnchor}
                            open={Boolean(presetMenuAnchor)}
                            onClose={() => setPresetMenuAnchor(null)}
                        >
                            {presets.map((preset) => (
                                <MenuItem key={preset.id} onClick={() => {
                                    onPresetLoad?.(preset.filters);
                                    setPresetMenuAnchor(null);
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2">{preset.name}</Typography>
                                        <IconButton size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            deletePreset(preset.id);
                                        }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Menu>

                        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                            <DialogTitle>Save Filter Preset</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Preset Name"
                                    fullWidth
                                    variant="outlined"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => {
                                    if (newPresetName && currentFilters) {
                                        savePreset(newPresetName, currentFilters);
                                        setSaveDialogOpen(false);
                                        setNewPresetName('');
                                    }
                                }} variant="contained">Save</Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </Box>

            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                width: '100%',
                alignItems: 'center'
            }}>
                {children}
            </Box>
        </Paper>
    );
}
