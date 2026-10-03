import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tabs,
  Tab,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { notify } from '../context/NotificationContext';
import { http } from '../lib/http';
import UserTable from '../components/users/UserTable';
import RoleManagement from '../components/users/RoleManagement';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext exists

// Interface for User
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openInvite, setOpenInvite] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'USER', status: 'ACTIVE' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Get current user to prevent self-deletion
  // If useAuth isn't perfectly set up, we fallback gracefully
  const { user: currentUser } = useAuth?.() || { user: { id: 'unknown' } };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('/users');
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
      notify.showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      if (editingUser) {
        // Update Logic
        await http.put(`/users/${editingUser.id}`, { name: formData.name, role: formData.role, status: formData.status });
        notify.showSuccess('User updated successfully');
      } else {
        // Invite Logic
        await http.post('/users/invite', { email: formData.email, name: formData.name, role: formData.role });
        notify.showSuccess(`Invitation sent to ${formData.email}`);
      }
      setOpenInvite(false);
      setOpenEdit(false);
      fetchUsers();
    } catch (e: any) {
      notify.showError(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      await http.delete(`/users/${user.id}`);
      notify.showSuccess('User deleted successfully');
      fetchUsers();
    } catch (e: any) {
      notify.showError(e.response?.data?.message || 'Failed to delete user');
    }
  };

  const openInviteDialog = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'USER', status: 'ACTIVE' });
    setOpenInvite(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE'
    });
    setOpenEdit(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>User Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage system users, access policies, and invitations.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="All Users" />
          <Tab label="Roles & Policies" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openInviteDialog}>
              Invite New User
            </Button>
          </Box>
          <UserTable
            users={users}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            currentUserId={currentUser?.id}
          />
        </>
      )}

      {activeTab === 1 && (
        <RoleManagement />
      )}

      {/* Invite/Add Dialog */}
      <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            The user will receive an email to set their password.
          </Alert>
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email Address"
            fullWidth
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvite(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite}>Send Invitation</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email Address"
            fullWidth
            disabled
            value={formData.email}
            helperText="Email cannot be changed."
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite}>Update User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
