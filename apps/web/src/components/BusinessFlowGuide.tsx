import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { ExpandMore, ArrowForward } from '@mui/icons-material';
import { isCompanyPageVisible, type CompanyProfile } from '@evergreen/types';

const steps = [
  { title: 'Set up your business', page: 'settings', action: 'Open settings', detail: 'Configure company identity, address and invoice issuer details before issuing documents. Review staff access and inventory settings.', check: 'Confirm the saved issuer details before your first invoice.' },
  { title: 'Receive and inspect material', page: 'inward', action: 'Open inward entry', detail: 'Use Weighbridge receipt to retain gross, tare and moisture readings. Keep settlement pending until contract terms are confirmed; physical stock and billable weight are shown separately.', check: 'Match the lot to the supplier document and physical material. Manually entered readings are not device-verified.' },
  { title: 'Produce and reconcile', page: 'production', action: 'Open production', detail: 'Select the input batches, record consumption, then record yarn output and waste. Use Job Work for material sent to external processors.', check: 'Reconcile input, output and waste before dispatch.' },
  { title: 'Track processing work', page: 'jobwork', action: 'Open job work', detail: 'Record material sent for processing, partial returns and scrap. Use Business flows for conversion agreements and work charges.', check: 'Reconcile supplied material, returned output and outstanding quantities.' },
  { title: 'Review stock and dispatch', page: 'inventory', action: 'Review inventory', detail: 'Check available stock and committed quantities. Use Outwards for mill dispatch records and Business Desk for catalogue sales orders.', check: 'Legacy mill stock and commerce stock still require reconciliation; do not assume every movement is synchronized.' },
  { title: 'Issue the invoice', page: 'business', action: 'Open Business Desk', detail: 'Select the saved customer and catalogue items. Review quantities, prices, tax and issuer details, then download the document from the saved invoice.', check: 'Use the saved invoice as the source for customer copies and payment allocation.' },
  { title: 'Collect and review', page: 'reports', action: 'Open reports', detail: 'Record customer payments against the invoice in Business Desk. Review receivables and customer ledgers in commerce reports.', check: 'Confirm the remaining balance. Bank reconciliation is not part of this workflow.' },
];

export default function BusinessFlowGuide({ onNavigate, profile }: { onNavigate?: (page: string) => void; profile?: Partial<CompanyProfile> }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | false>(steps[0].title);
  const applicable = steps.filter(step => isCompanyPageVisible(step.page, profile));
  const visible = applicable.filter(step => `${step.title} ${step.detail} ${step.check}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <Box component="section" aria-label="Business flow guide" sx={{ my: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
      <Box><Typography variant="h5" fontWeight={800}>From material to payment</Typography>
        <Typography color="text.secondary">A working guide with checks at every handoff.</Typography></Box>
      <TextField label="Search workflow guide" size="small" value={search} onChange={event => setSearch(event.target.value)} />
    </Stack>
    {visible.map(step => <Accordion key={step.title} expanded={expanded === step.title || !!search.trim()} onChange={(_, open) => setExpanded(open ? step.title : false)} disableGutters>
      <AccordionSummary expandIcon={<ExpandMore />} id={`flow-${step.page}-header`} aria-controls={`flow-${step.page}-content`}>
        <Stack direction="row" spacing={2} alignItems="center"><Chip size="small" label={applicable.indexOf(step) + 1} /><Typography fontWeight={700}>{step.title}</Typography></Stack>
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
