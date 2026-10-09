import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
} from '@mui/material';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';

type Supplier = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  status: string;
};

type SupplierFormValues = Omit<Supplier, 'id'>;

const defaultValues: SupplierFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  gstin: '',
  paymentTerms: 'NET 30',
  rating: 0,
  notes: '',
  status: 'Active',
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  supplier?: Supplier;
  initialValues?: SupplierFormValues;
};

export default function SupplierForm({ open, onClose, onSave, supplier, initialValues }: Props) {
  const [values, setValues] = useState<SupplierFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormValues, string>>>({});
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens or mode changes
  useEffect(() => {
    if (open) {
      if (supplier) {
        setValues({ ...supplier });
      } else if (initialValues) {
        // Clear unique fields for clones to allow saving as new
        setValues({
          ...defaultValues,
          ...initialValues,
          email: '', // Primary Contact Email / Legacy Email must be unique
          gstin: '', // GSTIN must be unique
        });
      } else {
        setValues(defaultValues);
      }
      setErrors({});
    }
  }, [open, supplier, initialValues]);

  const handleChange = (field: keyof SupplierFormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    setValues((v) => ({ ...v, [field]: val }));
    // Clear error on change
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SupplierFormValues, string>> = {};

    if (!values.name?.trim()) newErrors.name = 'Name is required';

    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (values.phone) {
      const cleanPhone = values.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    }

    if (values.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(values.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)';
    }

    if (values.rating !== undefined) {
      const r = Number(values.rating);
      if (isNaN(r) || r < 0 || r > 5) newErrors.rating = 'Rating must be 0-5';
    }

    if (values.notes && values.notes.length > 2000) {
      newErrors.notes = 'Notes too long (max 2000)';
    }

    if (!values.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify.showError(`Please fix validation errors for "${values.name || 'Supplier'}"`);
      return;
    }
    setLoading(true);
    try {
      const isClone = Boolean(initialValues);

      // Explicitly pick only fields we want to send to the API. 
      // Avoid sending DB-generated fields like id, createdAt, supplierCode (unless edit), etc.
      const payload: any = {
        name: values.name,
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
        gstin: values.gstin?.trim() || null,
        paymentTerms: values.paymentTerms?.trim() || 'NET 30',
        rating: values.rating ? Number(values.rating) : 0,
        notes: values.notes?.trim() || null,
        status: values.status || 'Active',
      };

      // When editing, we might send the supplierCode if we want it to remain, 
      // but for clones/new, we MUST not send it so the backend can generate a new one.
      if (supplier) {
        // payload.supplierCode = supplier.supplierCode; // Optional: Backend usually manages this
      }

      const res = supplier
        ? await http.patch(`/suppliers/${supplier.id}`, payload)
        : await http.post('/suppliers', payload);

      const op = supplier ? 'updated' : (isClone ? 'cloned' : 'created');
      notify.showSuccess(`Supplier "${values.name}" ${op} successfully`);
      onSave(res.data.supplier);
      onClose();
    } catch (err: any) {
      const isClone = Boolean(initialValues);
      const opName = supplier ? 'edit' : (isClone ? 'clone' : 'create');
      const errMsg = `can't ${opName} the supplier "${values.name || 'unknown'}"`;

      if (err?.response?.data?.issues) {
        const apiErrors: Partial<Record<keyof SupplierFormValues, string>> = {};
        err.response.data.issues.forEach((issue: any) => {
          apiErrors[issue.path?.[0] as keyof SupplierFormValues] = issue.message;
        });
        setErrors(apiErrors);
        notify.showError(errMsg + ': validation failed');
      } else {
        notify.showError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{supplier ? 'Edit Supplier' : (initialValues ? 'Clone Supplier' : 'Add Supplier')}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={values.name}
            onChange={handleChange('name')}
            required
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              select
              label="Status"
              value={values.status}
              onChange={handleChange('status')}
              error={!!errors.status}
              helperText={errors.status}
            >
              {['Active', 'Inactive', 'On Hold', 'Blacklisted'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Rating (0-5)"
              type="number"
              inputProps={{ min: 0, max: 5 }}
              value={values.rating}
              onChange={handleChange('rating')}
              error={!!errors.rating}
              helperText={errors.rating}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              placeholder="Must be unique"
              value={values.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Phone"
              value={values.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Box>

          <TextField
            label="GSTIN"
            placeholder="Must be unique"
            value={values.gstin}
            onChange={handleChange('gstin')}
            error={!!errors.gstin}
            helperText={errors.gstin || '22AAAAA0000A1Z5'}
          />

          <TextField
            label="Payment Terms"
            placeholder="NET 30"
            value={values.paymentTerms}
            onChange={handleChange('paymentTerms')}
            error={!!errors.paymentTerms}
            helperText={errors.paymentTerms}
          />

          <TextField
            label="Address"
            multiline
            rows={2}
            value={values.address}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
          />

          <TextField
            label="Notes"
            multiline
            rows={2}
            value={values.notes}
            onChange={handleChange('notes')}
            error={!!errors.notes}
            helperText={errors.notes}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing…' : (supplier ? 'Update' : 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

