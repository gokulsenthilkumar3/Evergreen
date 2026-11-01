import { uiText, useUiLanguage, uiTemplate, uiScopedTemplate } from "../i18n";
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonBase, Chip, Stack, TextField, Typography, keyframes } from '@mui/material';
import { ExpandMore, ArrowForward } from '@mui/icons-material';
import { isCompanyPageVisible, type CompanyProfile } from '@evergreen/types';

const steps = [
  { get title() { return uiText("Set up your business", 'help'); }, get short() { return uiText("Set up", 'help'); }, page: 'settings', get action() { return uiText("Open settings", 'help'); }, get detail() { return uiText("Configure company identity, address and invoice issuer details before issuing documents. Review staff access and inventory settings.", 'help'); }, get check() { return uiText("Confirm the saved issuer details before your first invoice.", 'help'); } },
  { get title() { return uiText("Receive and inspect material", 'help'); }, get short() { return uiText("Receive", 'help'); }, page: 'inward', get action() { return uiText("Open inward entry", 'help'); }, get detail() { return uiText("Use Weighbridge receipt to retain gross, tare and moisture readings. Keep settlement pending until contract terms are confirmed; physical stock and billable weight are shown separately.", 'help'); }, get check() { return uiText("Match the lot to the supplier document and physical material. Manually entered readings are not device-verified.", 'help'); } },
  { get title() { return uiText("Produce and reconcile", 'help'); }, get short() { return uiText("Produce", 'help'); }, page: 'production', get action() { return uiText("Open production", 'help'); }, get detail() { return uiText("Select the input batches, record consumption, then record yarn output and waste. Use Job Work for material sent to external processors.", 'help'); }, get check() { return uiText("Reconcile input, output and waste before dispatch.", 'help'); } },
  { get title() { return uiText("Track processing work", 'help'); }, get short() { return uiText("Job work", 'help'); }, page: 'jobwork', get action() { return uiText("Open job work", 'help'); }, get detail() { return uiText("Record material sent for processing, partial returns and scrap. Use Business flows for conversion agreements and work charges.", 'help'); }, get check() { return uiText("Reconcile supplied material, returned output and outstanding quantities.", 'help'); } },
  { get title() { return uiText("Review stock and dispatch", 'help'); }, get short() { return uiText("Dispatch", 'help'); }, page: 'inventory', get action() { return uiText("Review inventory", 'help'); }, get detail() { return uiText("Check available stock and committed quantities. Use Outwards for mill dispatch records and Business Desk for catalogue sales orders.", 'help'); }, get check() { return uiText("Legacy mill stock and commerce stock still require reconciliation; do not assume every movement is synchronized.", 'help'); } },
  { get title() { return uiText("Issue the invoice", 'help'); }, get short() { return uiText("Invoice", 'help'); }, page: 'business', get action() { return uiText("Open Business Desk", 'help'); }, get detail() { return uiText("Select the saved customer and catalogue items. Review quantities, prices, tax and issuer details, then download the document from the saved invoice.", 'help'); }, get check() { return uiText("Use the saved invoice as the source for customer copies and payment allocation.", 'help'); } },
  { get title() { return uiText("Collect and review", 'help'); }, get short() { return uiText("Collect", 'help'); }, page: 'reports', get action() { return uiText("Open reports", 'help'); }, get detail() { return uiText("Record customer payments against the invoice in Business Desk. Review receivables and customer ledgers in commerce reports.", 'help'); }, get check() { return uiText("Confirm the remaining balance. Bank reconciliation is not part of this workflow.", 'help'); } },
];

// A token travels the track from receipt to payment, showing the direction material and money move.
const travel = keyframes`
  0% { left: 0%; opacity: 0; }
  8% { opacity: 1; }
  92% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
`;

export default function BusinessFlowGuide({ onNavigate, profile }: { onNavigate?: (page: string) => void; profile?: Partial<CompanyProfile> }) {
  useUiLanguage();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | false>(steps[0].title);
  const applicable = steps.filter(step => isCompanyPageVisible(step.page, profile));
  const visible = applicable.filter(step => `${step.title} ${step.detail} ${step.check}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <Box component="section" aria-label={uiText("Business flow guide", 'help')} sx={{ my: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
      <Box><Typography variant="h5" fontWeight={800}>{uiText("From material to payment", 'help')}</Typography>
        <Typography color="text.secondary">{uiText("A working guide with checks at every handoff.", 'help')}</Typography></Box>
      <TextField label={uiText("Search workflow guide", 'help')} size="small" value={search} onChange={event => setSearch(event.target.value)} />
    </Stack>
    <Box component="nav" aria-label={uiText("Workflow stations", 'help')} sx={{ overflowX: 'auto', mb: 2, pb: 1 }}>
      <Box component="ol" sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 1, minWidth: applicable.length * 84, listStyle: 'none', m: 0, p: 0 }}>
        <Box aria-hidden sx={{ position: 'absolute', top: 17, left: 42, right: 42, height: 2, borderRadius: 1, bgcolor: 'divider' }}>
          <Box sx={{ position: 'absolute', top: -3, width: 8, height: 8, ml: '-4px', borderRadius: '50%', bgcolor: 'primary.main', boxShadow: theme => `0 0 0 4px ${theme.palette.primary.main}33`, animation: `${travel} 7s linear infinite`, '@media (prefers-reduced-motion: reduce)': { display: 'none' } }} />
        </Box>
        {applicable.map((step, index) => {
          const current = expanded === step.title && !search.trim();
          return <Box component="li" key={step.page} sx={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
            <ButtonBase onClick={() => { setSearch(''); setExpanded(step.title); }} aria-current={current ? 'step' : undefined} aria-label={uiScopedTemplate('help')`Step ${index + 1}: ${step.short}`}
              sx={{ flexDirection: 'column', gap: 0.75, borderRadius: 2, px: 1, py: 0.5, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' } }}>
              <Box sx={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.85rem', border: '2px solid', borderColor: current ? 'primary.main' : 'divider', bgcolor: current ? 'primary.main' : 'background.paper', color: current ? 'primary.contrastText' : 'text.secondary', transform: current ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), background-color 0.2s, border-color 0.2s' }}>{index + 1}</Box>
              <Typography variant="caption" fontWeight={current ? 800 : 600} color={current ? 'text.primary' : 'text.secondary'} noWrap>{step.short}</Typography>
            </ButtonBase>
          </Box>;
        })}
      </Box>
    </Box>
    {visible.map(step => <Accordion key={step.title} expanded={expanded === step.title || !!search.trim()} onChange={(_, open) => setExpanded(open ? step.title : false)} disableGutters>
      <AccordionSummary expandIcon={<ExpandMore />} id={`flow-${step.page}-header`} aria-controls={`flow-${step.page}-content`}>
        <Stack direction="row" spacing={2} alignItems="center"><Chip size="small" label={applicable.indexOf(step) + 1} /><Typography fontWeight={700}>{step.title}</Typography></Stack>
      </AccordionSummary>
      <AccordionDetails id={`flow-${step.page}-content`}>
        <Typography sx={{ mb: 1 }}>{step.detail}</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>{uiText("Before moving on: ", 'help')}{step.check}</Typography>
        {onNavigate && <Button variant="outlined" endIcon={<ArrowForward />} onClick={() => onNavigate(step.page)}>{step.action}</Button>}
      </AccordionDetails>
    </Accordion>)}
    {!visible.length && <Typography role="status">{uiText("No matching steps. Try “invoice”, “stock” or “payment”.", 'help')}</Typography>}
  </Box>;
}
