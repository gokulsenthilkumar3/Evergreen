import { useMemo } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import WorkflowDesk from './WorkflowDesk';

const draftKeys = ['vendors', 'bank_transactions', 'journals', 'payment_links', 'payment-timelines'];
export default function SharedPayments() {
  const drafts = useMemo(() => Object.fromEntries(draftKeys.flatMap(key => {
    try { const value = JSON.parse(localStorage.getItem(`evergreen_${key}`) || '[]'); return Array.isArray(value) && value.length ? [[key, value]] : []; } catch { return []; }
  })), []);
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), status: 'UNRECONCILED_DRAFTS', records: drafts }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'evergreen-payment-drafts.json'; link.click(); URL.revokeObjectURL(url);
  };
  return <Stack spacing={2}>{Object.keys(drafts).length > 0 && <Alert severity="info" action={<Button onClick={download}>Download drafts</Button>}>Earlier payment drafts are retained on this device. Reconcile them before posting them into the shared accounts.</Alert>}<WorkflowDesk initialTab={2} /></Stack>;
}
