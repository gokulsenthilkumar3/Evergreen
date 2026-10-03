import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Grid,
    Card,
    CardContent,
    TextField,
    MenuItem
} from '@mui/material';
import { Plus, Eye, Edit, Users, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const EmployeeManagementPage = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        departmentId: '',
        status: '',
        search: ''
    });

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, [filters]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await http.get('/hr/employees', { params: filters });
            setEmployees(response.data.employees);
        } catch (error) {
            notify.showError('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await http.get('/hr/departments');
            setDepartments(response.data.departments);
        } catch (error) {
            console.error('Failed to fetch departments');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'ON_LEAVE': return 'warning';
            case 'TERMINATED': return 'error';
            case 'RESIGNED': return 'default';
            default: return 'default';
        }
    };

    const stats = {
        total: employees.length,
        active: employees.filter((e: any) => e.status === 'ACTIVE').length,
        onLeave: employees.filter((e: any) => e.status === 'ON_LEAVE').length,
        inactive: employees.filter((e: any) => ['TERMINATED', 'RESIGNED'].includes(e.status)).length
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Users size={28} style={{ marginRight: 12 }} />
                    <Typography variant="h4">Employee Management</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => navigate('/hr/employees/new')}
                >
                    Add Employee
                </Button>
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" variant="subtitle2">Total Employees</Typography>
                                    <Typography variant="h3">{stats.total}</Typography>
                                </Box>
                                <Users size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Active</Typography>
                                    <Typography variant="h3">{stats.active}</Typography>
                                </Box>
                                <UserCheck size={40} style={{ opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'warning.light' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="subtitle2">On Leave</Typography>
                                    <Typography variant="h3">{stats.onLeave}</Typography>
                                </Box>
                                <Users size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" variant="subtitle2">Inactive</Typography>
                                    <Typography variant="h3">{stats.inactive}</Typography>
                                </Box>
                                <UserX size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Name, code, email..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Department"
                            value={filters.departmentId}
                            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {departments.map((dept: any) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                            <MenuItem value="TERMINATED">Terminated</MenuItem>
                            <MenuItem value="RESIGNED">Resigned</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee Code</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee: any) => (
                            <TableRow key={employee.id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{employee.employeeCode}</TableCell>
                                <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                                <TableCell>{employee.department?.name || '-'}</TableCell>
                                <TableCell>{employee.designation || '-'}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={employee.status}
                                        color={getStatusColor(employee.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => navigate(`/hr/employees/${employee.id}`)}>
                                        <Eye size={18} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => navigate(`/hr/employees/${employee.id}/edit`)}>
                                        <Edit size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {employees.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Box p={3}>
                                        <Typography color="textSecondary">No employees found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default EmployeeManagementPage;
