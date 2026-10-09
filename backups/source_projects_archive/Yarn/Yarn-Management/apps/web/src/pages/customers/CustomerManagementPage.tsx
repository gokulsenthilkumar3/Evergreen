import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import {
    Plus,
    Search,
    Users,
    Eye,
    Edit,
    TrendingUp,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const CustomerManagementPage = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        lifecycleStage: '',
        search: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, [filters.category, filters.lifecycleStage]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.lifecycleStage) queryParams.append('lifecycleStage', filters.lifecycleStage);
            if (filters.search) queryParams.append('search', filters.search);

            const response = await http.get(`/customers?${queryParams.toString()}`);
            setCustomers(response.data.customers);
        } catch (error) {
            notify.showError('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers();
    };

    const getStatusColor = (stage: string) => {
        switch (stage) {
            case 'ACTIVE': return 'success';
            case 'PROSPECT': return 'info';
            case 'INACTIVE': return 'warning';
            case 'CHURNED': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Users size={24} style={{ marginRight: 8 }} />
                    <Typography variant="h4">Customer Management</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => navigate('/customers/new')}
                >
                    Add Customer
                </Button>
            </Box>

            {/* Analytics Summary */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Typography variant="subtitle2">Total Customers</Typography>
                            <Typography variant="h3">{customers.length}</Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                                <TrendingUp size={16} style={{ marginRight: 4 }} />
                                <Typography variant="caption">Active participation</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Additional metric cards can be added here */}
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <form onSubmit={handleSearch}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search name, email, phone..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </form>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Category"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            <MenuItem value="WHOLESALE">Wholesale</MenuItem>
                            <MenuItem value="RETAIL">Retail</MenuItem>
                            <MenuItem value="DISTRIBUTOR">Distributor</MenuItem>
                            <MenuItem value="MANUFACTURER">Manufacturer</MenuItem>
                            <MenuItem value="AGENT">Agent</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Lifecycle Stage"
                            value={filters.lifecycleStage}
                            onChange={(e) => setFilters({ ...filters, lifecycleStage: e.target.value })}
                        >
                            <MenuItem value="">All Stages</MenuItem>
                            <MenuItem value="PROSPECT">Prospect</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                            <MenuItem value="CHURNED">Churned</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Filter size={18} />}
                            onClick={fetchCustomers}
                        >
                            Filter
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Customer Table */}
            <TableContainer component={Paper}>
                {loading ? (
                    <Box p={5} textAlign="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Customer Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Stage</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Outstanding</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id} hover>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight="bold">{customer.name}</Typography>
                                        <Typography variant="caption" color="textSecondary">{customer.gstin || 'No GSTIN'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={customer.category} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={customer.lifecycleStage}
                                            size="small"
                                            color={getStatusColor(customer.lifecycleStage) as any}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{customer.valueClass}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{customer.email}</Typography>
                                        <Typography variant="caption" color="textSecondary">{customer.phone}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="error">₹{(customer.outstanding || 0).toLocaleString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => navigate(`/customers/${customer.id}`)}>
                                            <Eye size={18} />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                                            <Edit size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Box p={3}>
                                            <Typography color="textSecondary">No customers found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </Box>
    );
};

export default CustomerManagementPage;
