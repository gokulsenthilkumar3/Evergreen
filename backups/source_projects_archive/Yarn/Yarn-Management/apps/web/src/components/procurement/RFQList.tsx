import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { apiClient } from '../../lib/api';
import RFQForm from './RFQForm';

export default function RFQList() {
    const [rfqList, setRfqList] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedRfq, setSelectedRfq] = useState<any>(null);

    const fetchRFQs = async () => {
        try {
            const res = await apiClient.get('/procurement/rfqs');
            setRfqList(res.data.rfqs);
        } catch (error) {
            console.error('Failed to fetch RFQs', error);
        }
    };

    useEffect(() => {
        fetchRFQs();
    }, []);

    const handleCreate = () => {
        setSelectedRfq(null);
        setOpenForm(true);
    };

    const handleView = (rfq: any) => {
        setSelectedRfq(rfq);
        setOpenForm(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Requests for Quotation</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create RFQ
                </Button>
            </Box>

            {openForm ? (
                <RFQForm
                    onClose={() => {
                        setOpenForm(false);
                        fetchRFQs();
                    }}
                    initialData={selectedRfq}
                />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>RFQ Number</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Created Date</TableCell>
                                <TableCell>Deadline</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Quotations</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rfqList.map((rfq: any) => (
                                <TableRow key={rfq.id}>
                                    <TableCell>{rfq.rfqNumber}</TableCell>
                                    <TableCell>{rfq.title}</TableCell>
                                    <TableCell>{format(new Date(rfq.createdAt), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{rfq.deadline ? format(new Date(rfq.deadline), 'dd MMM yyyy') : '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={rfq.status}
                                            color={rfq.status === 'OPEN' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{rfq._count?.items || 0}</TableCell>
                                    <TableCell>{rfq._count?.quotations || 0}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleView(rfq)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rfqList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No RFQs found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
