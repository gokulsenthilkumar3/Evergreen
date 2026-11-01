import { uiText, useUiLanguage, uiTemplate, uiScopedTemplate } from "../i18n";
import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { getStoredUser } from '../utils/authStorage';
import BusinessFlowGuide from '../components/BusinessFlowGuide';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Card,
    CardContent,
    CardActionArea,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    LinearProgress,
    Avatar,
} from '@mui/material';
import {
    PlayCircle as PlayIcon,
    School as TutorialIcon,
    CheckCircle as DoneIcon,
    Inventory as InventoryIcon,
    Receipt as BillingIcon,
    TrendingUp as OutwardIcon,
    AccountBalanceWallet as CostIcon,
    People as UsersIcon,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';

const TUTORIAL_CHAPTERS = [
    {
        id: 'activation', get title() { return uiText("Activation & Secure Access", 'help'); }, emoji: '01', get description() { return uiText("Understand owner activation, role boundaries and shared-device sign-in.", 'help'); }, duration: '4 min', color: '#296f51', icon: <UsersIcon />,
        steps: [
            { get label() { return uiText("Check installation activation", 'help'); }, get description() { return uiText("The owner issues an installation-specific, signed licence. If the activation gate appears, ask the owner to check expiry, device binding and the signed offline deadline. A provider subscription setting is not a signed activation.", 'help'); } },
            { get label() { return uiText("Choose safe sign-in", 'help'); }, get description() { return uiText("Use your own staff account. Leave Remember me off on shared devices. If MFA is enabled, enter your authenticator code. Passkeys require a compatible browser and a registered credential.", 'help'); } },
            { get label() { return uiText("Know your role", 'help'); }, get description() { return uiText("VIEWER can inspect records and ask for help. MODIFIER can perform permitted day-to-day changes. ADMIN manages user access and imports. The signed installation licence can narrow access further.", 'help'); } },
            { get label() { return uiText("Recover without sharing secrets", 'help'); }, get description() { return uiText("Contact the installation administrator for account recovery. Owner access keys and signing keys must never be shared in helpdesk tickets, chat or AI prompts. Lock the provider console or sign out when finished.", 'help'); } },
        ],
    },
    {
        id: 'integrations', get title() { return uiText("Import & Tally Export", 'help'); }, emoji: '02', get description() { return uiText("Preview, validate and trace integration work before changing records.", 'help'); }, duration: '6 min', color: '#306e88', icon: <InventoryIcon />,
        steps: [
            { get label() { return uiText("Prepare a CSV", 'help'); }, get description() { return uiText("An ADMIN opens Migration & integrations and downloads the correct template. Use up to 500 rows and a file under 500 KB. Keep identifiers and GST/contact values as text so leading zeros are preserved.", 'help'); } },
            { get label() { return uiText("Map and inspect", 'help'); }, get description() { return uiText("Choose the import type, map every required field, and read the preview. Fix duplicate names/SKUs and validation issues. Nothing is committed by previewing.", 'help'); } },
            { get label() { return uiText("Confirm and inspect history", 'help'); }, get description() { return uiText("Review the confirmation before importing. Keep the same submission unchanged when retrying a network failure. Read the result and import history before attempting a new import.", 'help'); } },
            { get label() { return uiText("Preview and export Tally XML", 'help'); }, get description() { return uiText("Select dates and Sales/Receipt voucher types. Preview the summary, download XML and review it in a test Tally company before live import. The connection check does not post vouchers. e-Way Bill readiness is a checklist, not registration.", 'help'); } },
        ],
    },
    {
        id: 'support', get title() { return uiText("Helpdesk & AI Guidance", 'help'); }, emoji: '03', get description() { return uiText("Get useful help while protecting your business information.", 'help'); }, duration: '3 min', color: '#6a5884', icon: <TutorialIcon />,
        steps: [
            { get label() { return uiText("Try the quick answers", 'help'); }, get description() { return uiText("Open Helpdesk and read the workflow FAQs. Search your ticket queue for an existing issue before creating another.", 'help'); } },
            { get label() { return uiText("Ask Loom", 'help'); }, get description() { return uiText("If Groq is configured, choose a suggested question or write your own. Read the data-sharing notice and opt in before sending. Loom receives only your supplied conversation, has no database tools and cannot perform operations.", 'help'); } },
            { get label() { return uiText("Create a useful ticket", 'help'); }, get description() { return uiText("Write a clear subject, select category/priority, and include steps, expected result and actual result. Do not include credentials or customer personal data. Submit once and retry the same request if the connection fails.", 'help'); } },
            { get label() { return uiText("Track the response", 'help'); }, get description() { return uiText("Your ticket is saved in this installation. You can see your own tickets; administrators manage the installation queue and add resolution notes. This does not email an external support team or promise a reply time.", 'help'); } },
        ],
    },
    {
        id: 'getting-started',
        get title() { return uiText("Getting Started", 'help'); },
        emoji: '🚀',
        get description() { return uiText("Learn the basics of EverGreen — login, navigation, and initial setup.", 'help'); },
        duration: '5 min',
        color: '#059669',
        icon: <DashboardIcon />,
        steps: [
            { get label() { return uiText("Login & Authentication", 'help'); }, get description() { return uiText("Use your username and password to log in. Enable 2FA or Passkey for extra security from Settings → Security.", 'help'); } },
            { get label() { return uiText("Navigate the Sidebar", 'help'); }, get description() { return uiText("Use the Business Desk for catalogue, customers and ledger, sales orders, and invoices. Inventory and production workflows remain in their operational sections. Click the menu button to collapse or expand the sidebar.", 'help'); } },
            { get label() { return uiText("Theme & Appearance", 'help'); }, get description() { return uiText("Switch between light and dark mode using the sun/moon icon in the top bar. Choose from multiple colour themes in Settings.", 'help'); } },
            { get label() { return uiText("Company Setup", 'help'); }, get description() { return uiText("Before issuing invoices, configure the legal business name, address, and GSTIN in Settings. Invoice issuance is blocked until the required issuer details are present; contact and branding settings are optional.", 'help'); } },
        ],
    },
    {
        id: 'inventory',
        get title() { return uiText("Inventory Management", 'help'); },
        emoji: '📦',
        get description() { return uiText("Record inward stock, manage batches, and track raw cotton inventory.", 'help'); },
        duration: '8 min',
        color: '#0284c7',
        icon: <InventoryIcon />,
        steps: [
            { get label() { return uiText("Inward Entry", 'help'); }, get description() { return uiText("Go to Inward / Batch and record the supplier, cotton details, quantity, and rate. The server generates the batch ID when one is not supplied.", 'help'); } },
            { get label() { return uiText("View Cotton Inventory", 'help'); }, get description() { return uiText("Navigate to Inventory → Cotton Inventory to see all batches with remaining weight. Filter by count or date.", 'help'); } },
            { get label() { return uiText("Merge Batches", 'help'); }, get description() { return uiText("When multiple batches of the same count exist, use the Merge Batches option to combine them for cleaner tracking.", 'help'); } },
            { get label() { return uiText("Low Stock Alerts", 'help'); }, get description() { return uiText("Review inventory balances and available alerts in Inventory. Threshold behavior depends on the configured inventory settings.", 'help'); } },
        ],
    },
    {
        id: 'production',
        get title() { return uiText("Production Entry", 'help'); },
        emoji: '🏭',
        get description() { return uiText("Record yarn production from cotton input to finished yarn output.", 'help'); },
        duration: '6 min',
        color: '#7c3aed',
        icon: <OutwardIcon />,
        steps: [
            { get label() { return uiText("New Production Entry", 'help'); }, get description() { return uiText("Go to Production from the sidebar. Click \"New Production Entry\".", 'help'); } },
            { get label() { return uiText("Select Input Batch", 'help'); }, get description() { return uiText("Choose the cotton batch or batches used as input. Enter the weight consumed from each batch.", 'help'); } },
            { get label() { return uiText("Enter Output Yarn", 'help'); }, get description() { return uiText("Specify the output yarn count, total weight produced, and bags count.", 'help'); } },
            { get label() { return uiText("Wastage Tracking", 'help'); }, get description() { return uiText("EverGreen automatically calculates wastage = Input Weight − Output Weight. View wastage reports in the Inventory page.", 'help'); } },
        ],
    },
    {
        id: 'billing',
        get title() { return uiText("Billing & Invoicing", 'help'); },
        emoji: '🧾',
        get description() { return uiText("Create invoices, record payments, and manage receivables.", 'help'); },
        duration: '10 min',
        color: '#dc2626',
        icon: <BillingIcon />,
        steps: [
            { get label() { return uiText("Create an Invoice", 'help'); }, get description() { return uiText("Open Business Desk → Invoices. Choose a saved customer and add catalogue items. The legacy Billing menu is consolidated here so invoices have one owner.", 'help'); } },
            { get label() { return uiText("Review Line Items", 'help'); }, get description() { return uiText("Check each item’s HSN/SAC, quantity, rate, and tax before saving. Tax uses the configured invoice and catalogue details.", 'help'); } },
            { get label() { return uiText("Save & Download", 'help'); }, get description() { return uiText("Save the invoice, then download its PDF from the saved invoice record. The PDF uses the issuer and customer details saved with that invoice.", 'help'); } },
            { get label() { return uiText("Record Payment", 'help'); }, get description() { return uiText("Record a payment from the invoice workflow and review its balance and payment status in Business Desk.", 'help'); } },
            { get label() { return uiText("Payment Operations", 'help'); }, get description() { return uiText("Customer records and invoice-linked payments are managed in Business Desk. Review balances in Reports. Other payment-operation screens require separate readiness checks; bank reconciliation is not part of this release.", 'help'); } },
        ],
    },
    {
        id: 'costing',
        get title() { return uiText("Costing & Expenses", 'help'); },
        emoji: '💰',
        get description() { return uiText("Track operational costs like electricity, employee wages, and packaging.", 'help'); },
        duration: '5 min',
        color: '#d97706',
        icon: <CostIcon />,
        steps: [
            { get label() { return uiText("Add Costing Entry", 'help'); }, get description() { return uiText("Go to Costing from the sidebar. Click \"Add Entry\". Choose the type: EB Bill, Employee, Packaging, Maintenance, or Other Expense.", 'help'); } },
            { get label() { return uiText("Enter Cost Details", 'help'); }, get description() { return uiText("Fill in the date, amount, and optional notes for each cost entry.", 'help'); } },
            { get label() { return uiText("View Cost History", 'help'); }, get description() { return uiText("Switch to the History view to see all past entries filtered by type or date range.", 'help'); } },
            { get label() { return uiText("Cost Analysis", 'help'); }, get description() { return uiText("The Costing dashboard shows total costs by category as charts to help identify where money is being spent.", 'help'); } },
        ],
    },
    {
        id: 'admin',
        get title() { return uiText("Admin & Settings", 'help'); },
        emoji: '⚙️',
        get description() { return uiText("Manage users, roles, sessions, and system settings.", 'help'); },
        duration: '4 min',
        color: '#0891b2',
        icon: <UsersIcon />,
        steps: [
            { get label() { return uiText("User Roles", 'help'); }, get description() { return uiText("The application uses three roles: VIEWER, MODIFIER, and ADMIN. Access to actions depends on the assigned role.", 'help'); } },
            { get label() { return uiText("Add Users", 'help'); }, get description() { return uiText("Go to User Management. Click \"Add User\". Set username, name, email, and role.", 'help'); } },
            { get label() { return uiText("Session Management", 'help'); }, get description() { return uiText("In Sessions, you can see all active login sessions and revoke suspicious ones remotely.", 'help'); } },
            { get label() { return uiText("Security Settings", 'help'); }, get description() { return uiText("Enable Two-Factor Authentication or register a Passkey for passwordless login from Security Settings.", 'help'); } },
        ],
    },
    {
        id: 'operations',
        get title() { return uiText("Operations & Planning", 'help'); },
        emoji: '🏗️',
        get description() { return uiText("Use the operational registers and understand which planning data is available.", 'help'); },
        duration: '8 min',
        color: '#0f766e',
        icon: <InventoryIcon />,
        steps: [
            { get label() { return uiText("Machines & quality", 'help'); }, get description() { return uiText("Machine Management and Quality Control are separate operational registers backed by their APIs. Machine Status Overview summarizes the current register and inspections; it does not provide live telemetry or OEE.", 'help'); } },
            { get label() { return uiText("Warehouse", 'help'); }, get description() { return uiText("Use Warehouse to review warehouse locations and movements. Stock totals are only available where the server supplies a balance; do not treat a short movement history as a complete stock ledger.", 'help'); } },
            { get label() { return uiText("People & shifts", 'help'); }, get description() { return uiText("HR & Payroll manages staff and payroll records. Shift Management manages shift records; attendance assignment is not currently part of that workflow.", 'help'); } },
            { get label() { return uiText("Demand forecast", 'help'); }, get description() { return uiText("Demand Forecasting summarizes actual recent commerce orders and shows a trailing-average baseline. It is not an AI forecast and does not create purchase recommendations.", 'help'); } },
            { get label() { return uiText("Supplier activity", 'help'); }, get description() { return uiText("Supplier Activity summarizes posted inward receipts. Create receipts in Operations Desk. Supplier onboarding, ratings, and purchase orders are not currently available.", 'help'); } },
            { get label() { return uiText("Compliance readiness", 'help'); }, get description() { return uiText("Compliance Readiness summarizes internal payroll and commerce records. It does not file returns or show provider acceptance.", 'help'); } },
            { get label() { return uiText("Vyapari and customer workflows", 'help'); }, get description() { return uiText("Customer and sales workflows are consolidated into Business Desk. Supplier receipts are available through Operations Desk and Supplier Activity; no separate Vyapari demo dataset is used.", 'help'); } },
        ],
    },
];

const ChapterCard = ({ chapter, onSelect, isSelected, progress }: { chapter: typeof TUTORIAL_CHAPTERS[0]; onSelect: () => void; isSelected: boolean; progress: number; }) => (
    <Card elevation={0} sx={{ border: '1.5px solid', borderColor: isSelected ? chapter.color : 'divider', borderRadius: 3, cursor: 'pointer', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', bgcolor: isSelected ? `${chapter.color}08` : 'background.paper', '&:hover': { borderColor: chapter.color, transform: 'translateY(-2px)', boxShadow: `0 10px 28px ${chapter.color}20` } }}>
        <CardActionArea onClick={onSelect} aria-pressed={isSelected}>
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>{chapter.emoji}</Typography>
                <Chip label={chapter.duration} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
            </Box>
            <Typography variant="body1" fontWeight={800} gutterBottom>{chapter.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{chapter.description}</Typography>
            <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.disabled">{chapter.steps.length} {uiText(" steps", 'help')}</Typography>
                <LinearProgress aria-label={uiScopedTemplate('help')`${chapter.title} completion`} variant="determinate" value={progress} sx={{ mt: 0.5, height: 3, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: chapter.color } }} />
            </Box>
        </CardContent>
        </CardActionArea>
    </Card>
);

const Tutorial: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  useUiLanguage();
    const [search, setSearch] = useState('');
    let username = 'local';
    try { username = (JSON.parse(getStoredUser() || '{}') as { username?: string }).username || 'local'; } catch { /* Use visit-local identity. */ }
    const progressKey = `evergreen-tutorial-v2-${encodeURIComponent(username)}`;
    const [selectedChapter, setSelectedChapter] = useState<string>('getting-started');
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(progressKey) || '{}') as Record<string, unknown>;
            return Object.fromEntries(TUTORIAL_CHAPTERS.map(item => [item.id, new Set(Array.isArray(saved[item.id]) ? (saved[item.id] as unknown[]).filter((index): index is number => typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < item.steps.length) : [])]));
        } catch { return {}; }
    });
    useEffect(() => { try { localStorage.setItem(progressKey, JSON.stringify(Object.fromEntries(Object.entries(completedSteps).map(([id, steps]) => [id, [...steps]])))); } catch { /* Progress stays available during this visit. */ } }, [completedSteps, progressKey]);
    const matchingChapters = TUTORIAL_CHAPTERS.filter(item => `${item.title} ${item.description} ${item.steps.map(step => `${step.label} ${step.description}`).join(' ')}`.toLowerCase().includes(search.toLowerCase()));

    const chapter = TUTORIAL_CHAPTERS.find((c) => c.id === selectedChapter)!;
    const completed = completedSteps[selectedChapter] || new Set();
    const totalProgress = completed.size > 0 ? Math.round((completed.size / chapter.steps.length) * 100) : 0;

    const handleStepComplete = () => {
        const prev = completedSteps[selectedChapter] || new Set();
        const next = new Set(prev);
        next.add(activeStep);
        setCompletedSteps({ ...completedSteps, [selectedChapter]: next });
        if (activeStep < chapter.steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handleChapterChange = (id: string) => {
        setSelectedChapter(id);
        setActiveStep(0);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <BusinessFlowGuide onNavigate={onNavigate} />
            <Box sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(8,145,178,0.08) 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><TutorialIcon /></Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>{uiText("Tutorial", 'help')}</Typography>
                        <Typography variant="body2" color="text.secondary">{uiText("Step-by-step guides to help people move confidently through the app.", 'help')}</Typography>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}><Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">{uiText("Current chapter", 'help')}</Typography><Typography variant="body1" fontWeight={800}>{chapter.title}</Typography></Paper></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">{uiText("Chapter progress", 'help')}</Typography><Typography variant="body1" fontWeight={800}>{totalProgress}%</Typography></Paper></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">{uiText("Chapters available", 'help')}</Typography><Typography variant="body1" fontWeight={800}>{TUTORIAL_CHAPTERS.length}</Typography></Paper></Grid>
                </Grid>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>{uiText("Chapters", 'help')}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField label={uiText("Search learning paths", 'help')} size="small" value={search} onChange={event => setSearch(event.target.value)} />
                        {matchingChapters.map((c) => <ChapterCard key={c.id} chapter={c} onSelect={() => handleChapterChange(c.id)} isSelected={selectedChapter === c.id} progress={Math.round(((completedSteps[c.id]?.size || 0) / c.steps.length) * 100)} />)}
                        {!matchingChapters.length && <Typography role="status">{uiText("No matching lessons. Try activation, invoice, import or support.", 'help')}</Typography>}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, background: `linear-gradient(135deg, ${chapter.color}15 0%, ${chapter.color}05 100%)`, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: `${chapter.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chapter.color }}>{chapter.icon}</Box>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800}>{chapter.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">{chapter.description}</Typography>
                                        </Box>
                                        <Chip label={chapter.duration} size="small" variant="outlined" />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <LinearProgress variant="determinate" value={totalProgress} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: chapter.color } }} />
                                        <Typography variant="caption" color="text.secondary">{totalProgress}%</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><PlayIcon color="primary" /><Typography variant="subtitle1" fontWeight={800}>{uiText("Guided steps", 'help')}</Typography></Box>
                            {onNavigate && <Button variant="outlined" sx={{ mb: 2 }} onClick={() => onNavigate(({ activation: 'settings', integrations: 'integrations', support: 'helpdesk', inventory: 'inventory', billing: 'business', costing: 'costing', admin: 'users' } as Record<string, string>)[selectedChapter] || 'dashboard')}>{uiText("Open related workspace", 'help')}</Button>}
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {chapter.steps.map((step, i) => (
                                    <Step key={i} completed={completed.has(i)}>
                                        <StepLabel StepIconComponent={() => completed.has(i) ? <DoneIcon sx={{ color: chapter.color, fontSize: 22 }} /> : <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: i === activeStep ? chapter.color : 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: i === activeStep ? '#fff' : 'text.disabled', fontSize: '0.7rem', fontWeight: 700 }}>{i + 1}</Typography></Box>}>
                                            <Button size="small" color="inherit" onClick={() => setActiveStep(i)} sx={{ textAlign: 'left', justifyContent: 'flex-start', fontWeight: 700 }}>{step.label}</Button>
                                        </StepLabel>
                                        <StepContent>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.75 }}>{step.description}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button variant="contained" size="small" onClick={handleStepComplete} sx={{ bgcolor: chapter.color, '&:hover': { bgcolor: chapter.color, filter: 'brightness(0.92)' } }}>{i === chapter.steps.length - 1 ? uiText("Finish chapter", 'help') : uiText("Got it →", 'help')}</Button>
                                                {i > 0 && <Button size="small" onClick={() => setActiveStep(i - 1)} variant="text" color="inherit">{uiText("Back", 'help')}</Button>}
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>

                            {completed.size === chapter.steps.length && (
                                <Box sx={{ mt: 3, p: 3, borderRadius: 3, textAlign: 'center', bgcolor: `${chapter.color}10`, border: `1px dashed ${chapter.color}` }}>
                                    <DoneIcon sx={{ color: chapter.color, fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" fontWeight={800} gutterBottom>{uiText("Chapter complete 🎉", 'help')}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{uiText("You’ve finished the \"", 'help')}{chapter.title}{uiText("\" chapter.", 'help')}</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Button variant="outlined" size="small" disabled={TUTORIAL_CHAPTERS.findIndex(c => c.id === selectedChapter) === TUTORIAL_CHAPTERS.length - 1} onClick={() => { const nextIndex = TUTORIAL_CHAPTERS.findIndex((c) => c.id === selectedChapter) + 1; if (nextIndex < TUTORIAL_CHAPTERS.length) { handleChapterChange(TUTORIAL_CHAPTERS[nextIndex].id); } }}>{uiText("Next chapter →", 'help')}</Button>
                                        <Button variant="text" size="small" onClick={() => { setCompletedSteps({}); setSelectedChapter('getting-started'); setActiveStep(0); }}>{uiText("Restart tour", 'help')}</Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                </Grid>
            </Grid>
        </Box>
    );
};

export default Tutorial;
