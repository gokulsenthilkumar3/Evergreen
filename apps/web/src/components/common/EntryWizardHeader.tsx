import type { ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

interface EntryWizardHeaderProps {
    id: string;
    stage: string;
    title: string;
    description: string;
    icon: ReactNode;
    onClose: () => void;
    busy?: boolean;
}

export default function EntryWizardHeader({ id, stage, title, description, icon, onClose, busy }: EntryWizardHeaderProps) {
    return (
        <DialogTitle id={id} sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider',
            bgcolor: theme => alpha(theme.palette.primary.main, 0.06), position: 'relative', overflow: 'hidden' }}>
            <Box aria-hidden sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: 'primary.main' }} />
            <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box aria-hidden sx={{ display: { xs: 'none', sm: 'grid' }, placeItems: 'center', width: 48, height: 48,
                    borderRadius: '12px', bgcolor: 'primary.main', color: 'primary.contrastText', flexShrink: 0 }}>{icon}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="primary.main" sx={{ lineHeight: 1.5 }}>EverGreen / {stage}</Typography>
                    <Typography component="span" variant="h5" display="block" sx={{ fontWeight: 800, mt: 0.5 }}>{title}</Typography>
                    <Typography id={`${id}-description`} variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{description}</Typography>
                </Box>
                <IconButton onClick={onClose} disabled={busy} aria-label="Close dialog" size="small"><Close /></IconButton>
            </Stack>
        </DialogTitle>
    );
}

export function EntrySummary({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px',
            bgcolor: theme => alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="overline" color="primary.main">{title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>{children}</Box>
        </Box>
    );
}

export function SummaryValue({ label, value }: { label: string; value: ReactNode }) {
    return <Box sx={{ minWidth: 100, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 750, overflowWrap: 'anywhere' }}>{value}</Typography>
    </Box>;
}
