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
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { apiClient } from '../../lib/api';
import GRNForm from './GRNForm';

export default function GRNList() {
    const [grnList, setGrnList] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedGrn, setSelectedGrn] = useState<any>(null);

    const fetchGRNs = async () => {
        try {
            const res = await apiClient.get('/procurement/grns');
            setGrnList(res.data.grns);
        } catch (error) {
            console.error('Failed to fetch GRNs', error);
        }
    };

    useEffect(() => {
        fetchGRNs();
    }, []);

    const handleCreate = () => {
        setSelectedGrn(null);
        setOpenForm(true);
    };

    const handleView = (grn: any) => {
        setSelectedGrn(grn);
        setOpenForm(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Goods Receipt Notes (GRN)</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create GRN
                </Button>
            </Box>

            {openForm ? (
                <GRNForm
                    onClose={() => {
                        setOpenForm(false);
                        fetchGRNs();
                    }}
                    initialData={selectedGrn}
                />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>GRN Number</TableCell>
                                <TableCell>PO Number</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Received Date</TableCell>
                                <TableCell>Invoice/Challan</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {grnList.map((grn: any) => (
                                <TableRow key={grn.id}>
                                    <TableCell>{grn.grnNumber}</TableCell>
                                    <TableCell>{grn.purchaseOrder?.poNumber || '-'}</TableCell>
                                    <TableCell>{grn.supplier?.name}</TableCell>
                                    <TableCell>{format(new Date(grn.receivedDate), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{grn.invoiceNumber || grn.challanNumber || '-'}</TableCell>
                                    <TableCell>{grn._count?.items || 0}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleView(grn)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {grnList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No GRNs found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
