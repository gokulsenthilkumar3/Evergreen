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
    Tabs,
    Tab,
    Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const CostingList: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    const { data: entries } = useQuery({
        queryKey: ['costingEntries'],
        queryFn: async () => {
            const response = await api.get('/costing/entries');
            return response.data;
        },
    });

    const categories = ['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance', 'Expense'];

    // Filter entries based on the current tab
    // Note: The categories in backend: 'EB (Electricity)', 'Employee', 'Packaging', 'Maintenance', 'Expense'
    // Tab indices map to these.

    const getFilteredEntries = (category: string) => {
        if (!entries) return [];
        return entries
            .filter((e: any) => e.category === category || (category === 'Expense' && !['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance'].includes(e.category)))
            .slice().reverse();
    };

    const currentEntries = getFilteredEntries(categories[tabValue]);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Costing Entries List
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                    <Tab label="EB (Electricity)" />
                    <Tab label="Employee" />
                    <Tab label="Packaging" />
                    <Tab label="Maintenance" />
                    <Tab label="Expenses" />
                </Tabs>

                {categories.map((_, index) => (
                    <TabPanel key={index} value={tabValue} index={index}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {index === 0 ? (
                                            // EB (Electricity) columns
                                            <>
                                                <TableCell>Date</TableCell>
                                                <TableCell align="right">Units Usage (kWh)</TableCell>
                                                <TableCell align="right">Cost of 1 Unit (₹)</TableCell>
                                                <TableCell align="center">Shifts</TableCell>
                                                <TableCell align="right">Amount (₹)</TableCell>
                                            </>
                                        ) : (
                                            // Other categories
                                            <>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Details</TableCell>
                                                <TableCell align="right">Amount (₹)</TableCell>
                                                {index === 4 && <TableCell>Type</TableCell>}
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentEntries.map((entry: any) => (
                                        <TableRow key={entry.id}>
                                            {index === 0 ? (
                                                // EB (Electricity) data
                                                <>
                                                    <TableCell>{new Date(entry.date || entry.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell align="right">{entry.unitsConsumed || '-'}</TableCell>
                                                    <TableCell align="right">₹{entry.ratePerUnit || '-'}</TableCell>
                                                    <TableCell align="center">{entry.noOfShifts || '-'}</TableCell>
                                                    <TableCell align="right">₹{entry.totalCost?.toLocaleString()}</TableCell>
                                                </>
                                            ) : (
                                                // Other categories data
                                                <>
                                                    <TableCell>{new Date(entry.date || entry.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>{entry.details}</TableCell>
                                                    <TableCell align="right">₹{entry.totalCost?.toLocaleString()}</TableCell>
                                                    {index === 4 && (
                                                        <TableCell>
                                                            <Chip label={entry.type || 'Expense'} size="small" />
                                                        </TableCell>
                                                    )}
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                    {currentEntries.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={index === 0 ? 5 : (index === 4 ? 4 : 3)} align="center">No entries found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                ))}
            </Paper>
        </Box>
    );
};

export default CostingList;
