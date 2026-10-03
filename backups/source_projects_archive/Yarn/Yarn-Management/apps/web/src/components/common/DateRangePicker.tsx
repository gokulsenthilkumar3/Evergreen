import { Box, TextField, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useState, useEffect } from 'react';

interface DateRangePickerProps {
    startDate?: string;
    endDate?: string;
    onChange: (start: string, end: string) => void;
}

type Preset = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const [preset, setPreset] = useState<Preset>('all');

    // Sync internal preset state with props if needed, or just rely on props.
    // Ideally, if props match a preset, show it.

    const handlePresetChange = (event: SelectChangeEvent) => {
        const val = event.target.value as Preset;
        setPreset(val);

        const now = new Date();
        let start = '';
        let end = '';

        if (val === 'today') {
            start = now.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        } else if (val === 'last7') {
            const past = new Date();
            past.setDate(now.getDate() - 7);
            start = past.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        } else if (val === 'last30') {
            const past = new Date();
            past.setDate(now.getDate() - 30);
            start = past.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        } else if (val === 'thisMonth') {
            start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (val === 'lastMonth') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        }

        if (val !== 'custom') {
            onChange(start, end);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ width: 140 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                    value={preset}
                    label="Date Range"
                    onChange={handlePresetChange}
                >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="last7">Last 7 Days</MenuItem>
                    <MenuItem value="last30">Last 30 Days</MenuItem>
                    <MenuItem value="thisMonth">This Month</MenuItem>
                    <MenuItem value="lastMonth">Last Month</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                </Select>
            </FormControl>

            {(preset === 'custom' || (startDate && endDate && preset === 'all')) && (
                <>
                    <TextField
                        type="date"
                        size="small"
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate || ''}
                        onChange={(e) => {
                            setPreset('custom');
                            onChange(e.target.value, endDate || '');
                        }}
                    />
                    <TextField
                        type="date"
                        size="small"
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate || ''}
                        onChange={(e) => {
                            setPreset('custom');
                            onChange(startDate || '', e.target.value);
                        }}
                    />
                </>
            )}
        </Box>
    );
}
