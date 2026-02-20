import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    InputAdornment,
    Chip,
    Tooltip,
    Pagination,
    Button,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { getDateRange, DATE_FILTER_OPTIONS_WITH_ALL, type DateFilterType } from '../utils/dateFilters';
import { generateExcel } from '../utils/excelGenerator';
import { generatePDF } from '../utils/pdfGenerator';

interface LogEntry {
    id: number;
    timestamp: string;
    action: string;
    module: string;
    userId?: string;
    username?: string;
    details?: string;
    ip?: string;
}

interface LogsProps {
    userRole?: string;
    username?: string;
}

const PAGE_SIZE = 20;

const ACTION_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'error',
    LOGIN: 'info',
    LOGOUT: 'default',
    EXPORT: 'info',
    PAYMENT: 'success',
};

const MODULE_OPTIONS = [
    'All',
    'Auth',
    'Inward',
    'Production',
    'Outward',
    'Billing',
    'Costing',
    'Inventory',
    'Settings',
    'Users',
];

const ACTION_OPTIONS = ['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PAYMENT'];

const Logs: React.FC<LogsProps> = ({ userRole, username }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
    const [moduleFilter, setModuleFilter] = useState('All');
    const [actionFilter, setActionFilter] = useState('All');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const dateRange = getDateRange(dateFilter, customFrom, customTo);

    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['activityLogs', dateRange.from, dateRange.to, moduleFilter, actionFilter],
        queryFn: async () => {
            const params: any = {};
            if (dateRange.from) params.from = dateRange.from;
            if (dateRange.to) params.to = dateRange.to;
            if (moduleFilter !== 'All') params.module = moduleFilter;
            if (actionFilter !== 'All') params.action = actionFilter;
            const response = await api.get('/logs', { params });
            return response.data;
        },
    });

    const filteredLogs = logs.filter((log: LogEntry) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.action?.toLowerCase().includes(term) ||
            log.module?.toLowerCase().includes(term) ||
            log.username?.toLowerCase().includes(term) ||
            log.details?.toLowerCase().includes(term)
        );
    });

    const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
    const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleExport = (type: 'excel' | 'pdf') => {
        if (filteredLogs.length === 0) return;
        const filename = `Audit_Logs_${new Date().toISOString().split('T')[0]}`;

        if (type === 'pdf') {
            const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details'];
            const rows = filteredLogs.map((log: LogEntry) => [
                new Date(log.timestamp).toLocaleString(),
                log.username || '-',
                log.action,
                log.module,
                log.details || '-',
            ]);
            generatePDF('Audit Logs', headers, rows, filename);
        } else {
            const excelData = filteredLogs.map((log: LogEntry) => ({
                Timestamp: new Date(log.timestamp).toLocaleString(),
                User: log.username || '-',
                Action: log.action,
                Module: log.module,
                Details: log.details || '-',
            }));
            generateExcel(excelData, filename);
        }
    };

    return (
        <Box>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                        }}
                        sx={{ minWidth: 200, flex: 1 }}
                    />
                    <TextField
                        select size="small" label="Date Range"
                        value={dateFilter}
                        onChange={(e) => { setDateFilter(e.target.value as DateFilterType); setPage(1); }}
                        sx={{ minWidth: 140 }}
                    >
                        {DATE_FILTER_OPTIONS_WITH_ALL.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>
                    {dateFilter === 'custom' && (
                        <>
                            <TextField type="date" size="small" label="From" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
                            <TextField type="date" size="small" label="To" value={customTo} onChange={(e) => setCustomTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
                        </>
                    )}
                    <TextField
                        select size="small" label="Module"
                        value={moduleFilter}
                        onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
                        sx={{ minWidth: 120 }}
                    >
                        {MODULE_OPTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Action"
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        sx={{ minWidth: 120 }}
                    >
                        {ACTION_OPTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                    <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('excel')}>Excel</Button>
                    <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')}>PDF</Button>
                </Box>
            </Paper>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Showing {paginatedLogs.length} of {filteredLogs.length} entries
                </Typography>
            </Box>

            {/* Logs Table */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">Loading logs...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedLogs.length > 0 ? (
                            paginatedLogs.map((log: LogEntry) => (
                                <TableRow key={log.id} hover>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Tooltip title={new Date(log.timestamp).toLocaleString()} arrow>
                                            <Typography variant="body2">
                                                {new Date(log.timestamp).toLocaleDateString()}{' '}
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </Typography>
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>{log.username || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.action}
                                            color={ACTION_COLORS[log.action] || 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={log.module} size="small" variant="filled" sx={{ bgcolor: 'action.hover' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={log.details || ''} arrow placement="top-start">
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 400,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {log.details || '-'}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No logs found for the selected filters.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, p) => setPage(p)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );
};

export default Logs;
