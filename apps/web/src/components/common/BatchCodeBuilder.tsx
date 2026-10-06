import { useEffect, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { Autorenew, Tag } from '@mui/icons-material';
import { generateRandomSuffix } from '../../utils/codeFormatters';

interface BatchCodeBuilderProps {
    value: string;
    date: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function BatchCodeBuilder({ value, date, onChange, disabled }: BatchCodeBuilderProps) {
    const [mode, setMode] = useState<'automatic' | 'build' | 'manual'>(value ? 'manual' : 'automatic');
    const [prefix, setPrefix] = useState('BATCH');
    const [suffix, setSuffix] = useState(() => generateRandomSuffix(4));
    const [generatedSuffix, setGeneratedSuffix] = useState(suffix);
    const dateStamp = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime()) ? date.replace(/-/g, '') : '';
    const code = [prefix.trim() || 'BATCH', dateStamp, suffix.trim() || generatedSuffix].join('-');

    useEffect(() => {
        if (mode === 'build' && dateStamp && code !== value) onChange(code);
    }, [mode, dateStamp, code, value, onChange]);

    return <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Batch numbering</Typography>
        <ToggleButtonGroup value={mode} exclusive fullWidth size="small" disabled={disabled} aria-label="Batch numbering method"
            sx={{ '& .MuiToggleButton-root': { flex: 1, textTransform: 'none', py: 1 } }}
            onChange={(_event, next: typeof mode | null) => {
                if (!next) return;
                if (next === 'build') {
                    const parts = value.match(/^(.*)-(\d{8})-(.+)$/);
                    if (parts) { setPrefix(parts[1]); setSuffix(parts[3]); }
                }
                setMode(next);
                if (next === 'automatic') onChange('');
            }}>
            <ToggleButton value="automatic">Automatic</ToggleButton>
            <ToggleButton value="build">Build code</ToggleButton>
            <ToggleButton value="manual">Manual ID</ToggleButton>
        </ToggleButtonGroup>
        {mode === 'automatic' && <Box sx={{ mt: 1.5, p: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
            <Typography variant="body2" fontWeight={600}>Assigned when you save</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>EverGreen creates a unique reference for this receipt.</Typography>
        </Box>}
        {mode === 'manual' && <TextField label="Batch ID (Optional)" value={value} onChange={event => onChange(event.target.value)}
            disabled={disabled} fullWidth size="small" sx={{ mt: 2 }} placeholder="Enter your batch reference"
            InputProps={{ startAdornment: <InputAdornment position="start"><Tag fontSize="small" /></InputAdornment> }}
            helperText="Use your supplier or mill reference. Leave blank for automatic numbering." />}
        {mode === 'build' && <Box sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Prefix" value={prefix} onChange={event => setPrefix(event.target.value)} disabled={disabled} size="small" fullWidth
                    helperText="Mill or batch series; defaults to BATCH." />
                <TextField label="Suffix" value={suffix} onChange={event => setSuffix(event.target.value)} disabled={disabled} size="small" fullWidth
                    helperText="Your sequence, or generate a new one."
                    InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Generate new suffix">
                        <IconButton size="small" disabled={disabled} aria-label="Generate new suffix" onClick={() => {
                            const next = generateRandomSuffix(4); setSuffix(next); setGeneratedSuffix(next);
                        }}><Autorenew fontSize="small" /></IconButton>
                    </Tooltip></InputAdornment> }} />
            </Stack>
            <Box sx={{ mt: 1.5, p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: theme => alpha(theme.palette.primary.main, 0.04) }}>
                <Typography variant="caption" color="text.secondary">Batch ID · updates as you type</Typography>
                <Typography role="status" variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700, overflowWrap: 'anywhere', mt: 0.5 }}>{dateStamp ? code : 'Choose a receipt date to build your code'}</Typography>
                <Typography variant="caption" color="text.secondary">Date stamp follows the receipt date.</Typography>
            </Box>
        </Box>}
    </Box>;
}
