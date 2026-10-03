import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    MenuItem,
    Paper,
    Divider,
    IconButton,
    Card,
    CardContent
} from '@mui/material';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const CustomerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gstin: '',
        category: 'RETAIL',
        lifecycleStage: 'PROSPECT',
        valueClass: 'MEDIUM',
        creditLimit: '',
        creditTerms: 'NET 30',
        notes: '',
        contacts: [{ name: '', designation: '', email: '', phone: '', isPrimary: true }],
        addresses: [{ type: 'BILLING', line1: '', city: '', state: '', pincode: '', isDefault: true }]
    });

    useEffect(() => {
        if (isEdit) {
            fetchCustomer();
        }
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await http.get(`/customers/${id}`);
            const c = response.data.customer;
            setFormData({
                ...c,
                creditLimit: c.creditLimit?.toString() || '',
                contacts: c.contacts?.length ? c.contacts : formData.contacts,
                addresses: c.addresses?.length ? c.addresses : formData.addresses
            });
        } catch (error) {
            notify.showError('Failed to fetch customer data');
        }
    };

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactChange = (index: number, e: any) => {
        const newContacts = [...formData.contacts];
        newContacts[index] = { ...newContacts[index], [e.target.name]: e.target.value };
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { name: '', designation: '', email: '', phone: '', isPrimary: false }]
        });
    };

    const removeContact = (index: number) => {
        const newContacts = formData.contacts.filter((_, i) => i !== index);
        setFormData({ ...formData, contacts: newContacts });
    };

    const handleAddressChange = (index: number, e: any) => {
        const newAddresses = [...formData.addresses];
        newAddresses[index] = { ...newAddresses[index], [e.target.name]: e.target.value };
        setFormData({ ...formData, addresses: newAddresses });
    };

    const addAddress = () => {
        setFormData({
            ...formData,
            addresses: [...formData.addresses, { type: 'SHIPPING', line1: '', city: '', state: '', pincode: '', isDefault: false }]
        });
    };

    const removeAddress = (index: number) => {
        const newAddresses = formData.addresses.filter((_, i) => i !== index);
        setFormData({ ...formData, addresses: newAddresses });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...formData,
                creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null
            };

            if (isEdit) {
                await http.patch(`/customers/${id}`, payload);
                notify.showSuccess('Customer updated successfully');
            } else {
                await http.post('/customers', payload);
                notify.showSuccess('Customer created successfully');
            }
            navigate('/customers');
        } catch (error: any) {
            notify.showError(error.message || 'Failed to save customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">{isEdit ? 'Edit Customer' : 'Add New Customer'}</Typography>
                <Box>
                    <Button startIcon={<X size={18} />} onClick={() => navigate('/customers')} sx={{ mr: 1 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save size={18} />}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Customer'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Primary Details</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Customer Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="GSTIN"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" mb={2}>Commercial Terms</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="WHOLESALE">Wholesale</MenuItem>
                                        <MenuItem value="RETAIL">Retail</MenuItem>
                                        <MenuItem value="DISTRIBUTOR">Distributor</MenuItem>
                                        <MenuItem value="MANUFACTURER">Manufacturer</MenuItem>
                                        <MenuItem value="AGENT">Agent</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Credit Limit (₹)"
                                        name="creditLimit"
                                        type="number"
                                        value={formData.creditLimit}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Payment Terms"
                                        name="creditTerms"
                                        value={formData.creditTerms}
                                        onChange={handleChange}
                                        placeholder="e.g. NET 30"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Contacts</Typography>
                                <Button size="small" startIcon={<Plus size={16} />} onClick={addContact}>
                                    Add Contact
                                </Button>
                            </Box>
                            {formData.contacts.map((contact, index) => (
                                <Box key={index} sx={{ border: '1px solid #eee', p: 2, mb: 2, borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="flex-end">
                                        {index > 0 && (
                                            <IconButton size="small" color="error" onClick={() => removeContact(index)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Contact Name"
                                                name="name"
                                                value={contact.name}
                                                onChange={(e) => handleContactChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Designation"
                                                name="designation"
                                                value={contact.designation}
                                                onChange={(e) => handleContactChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Email"
                                                name="email"
                                                value={contact.email}
                                                onChange={(e) => handleContactChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Phone"
                                                name="phone"
                                                value={contact.phone}
                                                onChange={(e) => handleContactChange(index, e)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Addresses</Typography>
                                <Button size="small" startIcon={<Plus size={16} />} onClick={addAddress}>
                                    Add Address
                                </Button>
                            </Box>
                            {formData.addresses.map((address, index) => (
                                <Box key={index} sx={{ border: '1px solid #eee', p: 2, mb: 2, borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="subtitle2">{address.type}</Typography>
                                        {index > 0 && (
                                            <IconButton size="small" color="error" onClick={() => removeAddress(index)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Line 1"
                                                name="line1"
                                                value={address.line1}
                                                onChange={(e) => handleAddressChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="City"
                                                name="city"
                                                value={address.city}
                                                onChange={(e) => handleAddressChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="State"
                                                name="state"
                                                value={address.state}
                                                onChange={(e) => handleAddressChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Pincode"
                                                name="pincode"
                                                value={address.pincode}
                                                onChange={(e) => handleAddressChange(index, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                select
                                                size="small"
                                                label="Type"
                                                name="type"
                                                value={address.type}
                                                onChange={(e) => handleAddressChange(index, e)}
                                            >
                                                <MenuItem value="BILLING">Billing</MenuItem>
                                                <MenuItem value="SHIPPING">Shipping</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Notes</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional information..."
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CustomerForm;
