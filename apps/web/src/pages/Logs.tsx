import React, { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    TextField,
    InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface LogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    module: string;
    details: string;
}

const Logs: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: logs = [] } = useQuery<LogEntry[]>({
        queryKey: ['logs'],
        queryFn: async () => {
            const response = await api.get('/logs');
            return response.data;
        },
    });

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredLogs = logs.filter((log) =>
        log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE':
                return 'success';
            case 'UPDATE':
                return 'info';
            case 'DELETE':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 0, boxShadow: 'none', border: 'none' }}>
                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Module</TableCell>
                                <TableCell>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedLogs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.action}
                                            color={getActionColor(log.action) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{log.module}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                            ))}
                            {paginatedLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No logs found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredLogs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default Logs;
