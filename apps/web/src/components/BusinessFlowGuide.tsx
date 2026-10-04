import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { ExpandMore, ArrowForward } from '@mui/icons-material';

const steps = [
  { title: 'Set up your business', page: 'settings', action: 'Open settings', detail: 'Configure company identity, address and invoice issuer details before issuing documents. Review staff access and inventory settings.', check: 'Confirm the saved issuer details before your first invoice.' },
  { title: 'Receive and inspect material', page: 'inward', action: 'Open inward entry', detail: 'Record supplier, batch reference and received weight. Review the resulting inventory balance before allocating material to production.', check: 'Match the receipt to the physical material and supplier document.' },
  { title: 'Produce and reconcile', page: 'production', action: 'Open production', detail: 'Select the input batches, record consumption, then record yarn output and waste. Use Job Work for material sent to external processors.', check: 'Reconcile input, output and waste before dispatch.' },
  { title: 'Review stock and dispatch', page: 'inventory', action: 'Review inventory', detail: 'Check available stock and committed quantities. Use Outwards for mill dispatch records and Business Desk for catalogue sales orders.', check: 'Legacy mill stock and commerce stock still require reconciliation; do not assume every movement is synchronized.' },
  { title: 'Issue the invoice', page: 'business', action: 'Open Business Desk', detail: 'Select the saved customer and catalogue items. Review quantities, prices, tax and issuer details, then download the document from the saved invoice.', check: 'Use the saved invoice as the source for customer copies and payment allocation.' },
  { title: 'Collect and review', page: 'reports', action: 'Open reports', detail: 'Record customer payments against the invoice in Business Desk. Review receivables and customer ledgers in commerce reports.', check: 'Confirm the remaining balance. Bank reconciliation is not part of this workflow.' },
];

export default function BusinessFlowGuide({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | false>(steps[0].title);
  const visible = steps.filter(step => `${step.title} ${step.detail} ${step.check}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <Box component="section" aria-label="Business flow guide" sx={{ my: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
      <Box><Typography variant="h5" fontWeight={800}>From material to payment</Typography>
        <Typography color="text.secondary">A working guide with checks at every handoff.</Typography></Box>
      <TextField label="Search workflow guide" size="small" value={search} onChange={event => setSearch(event.target.value)} />
    </Stack>
    {visible.map(step => <Accordion key={step.title} expanded={expanded === step.title || !!search.trim()} onChange={(_, open) => setExpanded(open ? step.title : false)} disableGutters>
      <AccordionSummary expandIcon={<ExpandMore />} id={`flow-${step.page}-header`} aria-controls={`flow-${step.page}-content`}>
        <Stack direction="row" spacing={2} alignItems="center"><Chip size="small" label={steps.indexOf(step) + 1} /><Typography fontWeight={700}>{step.title}</Typography></Stack>
      </AccordionSummary>
      <AccordionDetails id={`flow-${step.page}-content`}>
        <Typography sx={{ mb: 1 }}>{step.detail}</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>Before moving on: {step.check}</Typography>
        {onNavigate && <Button variant="outlined" endIcon={<ArrowForward />} onClick={() => onNavigate(step.page)}>{step.action}</Button>}
      </AccordionDetails>
    </Accordion>)}
    {!visible.length && <Typography role="status">No matching steps. Try “invoice”, “stock” or “payment”.</Typography>}
  </Box>;
}
