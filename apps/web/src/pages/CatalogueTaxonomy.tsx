import { useState } from 'react';
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';

type Taxonomy = { id: number; name: string; active: boolean };

function TaxonomyEditor({ label, resource }: { label: string; resource: 'brands' | 'categories' }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data = [] } = useQuery<Taxonomy[]>({ queryKey: ['commerce', resource], queryFn: async () => (await api.get(`/commerce/${resource}`)).data });
  const save = async () => {
    if (!name.trim()) { toast.error(`${label} name is required`); return; }
    try {
      if (editingId) await api.patch(`/commerce/${resource}/${editingId}`, { name: name.trim() });
      else await api.post(`/commerce/${resource}`, { name: name.trim() });
      setName(''); setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ['commerce', resource] });
      toast.success(`${label} saved`);
    } catch (error: any) { toast.error(error.response?.data?.message || `Could not save ${label.toLowerCase()}`); }
  };
  const archive = async (row: Taxonomy) => {
    if (!window.confirm(`Archive ${row.name}? Existing catalogue items keep this label.`)) return;
    try {
      await api.delete(`/commerce/${resource}/${row.id}`);
      await queryClient.invalidateQueries({ queryKey: ['commerce', resource] });
      toast.success(`${label} archived`);
    } catch (error: any) { toast.error(error.response?.data?.message || `Could not archive ${label.toLowerCase()}`); }
  };
  return <Box sx={{ flex: 1, minWidth: 260 }}>
    <Typography fontWeight={700} sx={{ mb: 1 }}>{label === 'Category' ? 'Categories' : 'Brands'}</Typography>
    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
      <TextField label={`${label} name`} size="small" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void save(); }} fullWidth />
      <Button variant="contained" onClick={save}>{editingId ? 'Update' : 'Add'}</Button>
      {editingId && <Button onClick={() => { setEditingId(null); setName(''); }}>Cancel</Button>}
    </Stack>
    {data.map(row => <Stack key={row.id} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5, opacity: row.active ? 1 : 0.55 }}>
      <Typography sx={{ flex: 1 }}>{row.name}</Typography>
      {!row.active && <Chip label="Archived" size="small" />}
      {row.active && <><Button size="small" onClick={() => { setEditingId(row.id); setName(row.name); }}>Edit</Button><Button size="small" color="error" onClick={() => void archive(row)}>Archive</Button></>}
    </Stack>)}
  </Box>;
}

export default function CatalogueTaxonomy() {
  return <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>Brands & categories</Typography>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <TaxonomyEditor label="Brand" resource="brands" />
      <TaxonomyEditor label="Category" resource="categories" />
    </Stack>
  </Paper>;
}
