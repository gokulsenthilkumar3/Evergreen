import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Card,
    CardContent,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    LinearProgress,
    Avatar,
    Divider,
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
        id: 'getting-started',
        title: 'Getting Started',
        emoji: '🚀',
        description: 'Learn the basics of EverGreen — login, navigation, and initial setup.',
        duration: '5 min',
        color: '#059669',
        icon: <DashboardIcon />,
        steps: [
            { label: 'Login & Authentication', description: 'Use your username and password to log in. Enable 2FA or Passkey for extra security from Settings → Security.' },
            { label: 'Navigate the Sidebar', description: 'The left sidebar contains all modules: Dashboard, Inventory, Production, Billing, and more. Click the hamburger icon to collapse or expand it.' },
            { label: 'Theme & Appearance', description: 'Switch between light and dark mode using the sun/moon icon in the top bar. Choose from multiple colour themes in Settings.' },
            { label: 'Company Setup', description: 'Go to Settings and fill in your Company Name, Address, GSTIN, Phone, and upload your logo. These appear on all invoices.' },
        ],
    },
    {
        id: 'inventory',
        title: 'Inventory Management',
        emoji: '📦',
        description: 'Record inward stock, manage batches, and track raw cotton inventory.',
        duration: '8 min',
        color: '#0284c7',
        icon: <InventoryIcon />,
        steps: [
            { label: 'Inward Entry', description: 'Go to Inward / Batch. Click "New Inward Entry". Fill in the source, batch number, count, bags, weight per bag, and rate per kg.' },
            { label: 'View Cotton Inventory', description: 'Navigate to Inventory → Cotton Inventory to see all batches with remaining weight. Filter by count or date.' },
            { label: 'Merge Batches', description: 'When multiple batches of the same count exist, use the Merge Batches option to combine them for cleaner tracking.' },
            { label: 'Low Stock Alerts', description: 'The Inventory sidebar item shows a red badge when any yarn count falls below your configured threshold in Settings.' },
        ],
    },
    {
        id: 'production',
        title: 'Production Entry',
        emoji: '🏭',
        description: 'Record yarn production from cotton input to finished yarn output.',
        duration: '6 min',
        color: '#7c3aed',
        icon: <OutwardIcon />,
        steps: [
            { label: 'New Production Entry', description: 'Go to Production from the sidebar. Click "New Production Entry".' },
            { label: 'Select Input Batch', description: 'Choose the cotton batch or batches used as input. Enter the weight consumed from each batch.' },
            { label: 'Enter Output Yarn', description: 'Specify the output yarn count, total weight produced, and bags count.' },
            { label: 'Wastage Tracking', description: 'EverGreen automatically calculates wastage = Input Weight − Output Weight. View wastage reports in the Inventory page.' },
        ],
    },
    {
        id: 'billing',
        title: 'Billing & Invoicing',
        emoji: '🧾',
        description: 'Create invoices, record payments, and manage receivables.',
        duration: '10 min',
        color: '#dc2626',
        icon: <BillingIcon />,
        steps: [
            { label: 'Create an Invoice', description: 'Go to Billing → Invoices. Click "New Invoice". Enter customer details, transport info, and line items.' },
            { label: 'Add Line Items', description: 'Each line item has a yarn count, bags, weight, and rate. GST is auto-calculated.' },
            { label: 'Save & Print', description: 'Click "Save Invoice" to store. Use "Print / PDF" to generate a printable invoice. Use "Share" to email it.' },
            { label: 'Record Payment', description: 'In the invoice list, click the payment icon to record a payment. Choose Cash, Bank Transfer, UPI, or Cheque.' },
            { label: 'Payment Status', description: 'Invoices are automatically marked as PAID, PARTIAL, or UNPAID based on the payments recorded against them.' },
        ],
    },
    {
        id: 'costing',
        title: 'Costing & Expenses',
        emoji: '💰',
        description: 'Track operational costs like electricity, employee wages, and packaging.',
        duration: '5 min',
        color: '#d97706',
        icon: <CostIcon />,
        steps: [
            { label: 'Add Costing Entry', description: 'Go to Costing from the sidebar. Click "Add Entry". Choose the type: EB Bill, Employee, Packaging, Maintenance, or Other Expense.' },
            { label: 'Enter Cost Details', description: 'Fill in the date, amount, and optional notes for each cost entry.' },
            { label: 'View Cost History', description: 'Switch to the History view to see all past entries filtered by type or date range.' },
            { label: 'Cost Analysis', description: 'The Costing dashboard shows total costs by category as charts to help identify where money is being spent.' },
        ],
    },
    {
        id: 'admin',
        title: 'Admin & Settings',
        emoji: '⚙️',
        description: 'Manage users, roles, sessions, and system settings.',
        duration: '4 min',
        color: '#0891b2',
        icon: <UsersIcon />,
        steps: [
            { label: 'User Roles', description: 'There are 4 roles: VIEWER, MODIFIER, AUTHOR, and ADMIN.' },
            { label: 'Add Users', description: 'Go to User Management. Click "Add User". Set username, name, email, and role.' },
            { label: 'Session Management', description: 'In Sessions, you can see all active login sessions and revoke suspicious ones remotely.' },
            { label: 'Security Settings', description: 'Enable Two-Factor Authentication or register a Passkey for passwordless login from Security Settings.' },
        ],
    },
];

const ChapterCard = ({ chapter, onSelect, isSelected }: { chapter: typeof TUTORIAL_CHAPTERS[0]; onSelect: () => void; isSelected: boolean; }) => (
    <Card elevation={0} onClick={onSelect} sx={{ border: '1.5px solid', borderColor: isSelected ? chapter.color : 'divider', borderRadius: 3, cursor: 'pointer', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease', bgcolor: isSelected ? `${chapter.color}08` : 'background.paper', '&:hover': { borderColor: chapter.color, transform: 'translateY(-2px)', boxShadow: `0 10px 28px ${chapter.color}20` } }}>
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>{chapter.emoji}</Typography>
                <Chip label={chapter.duration} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
            </Box>
            <Typography variant="body1" fontWeight={800} gutterBottom>{chapter.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{chapter.description}</Typography>
            <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.disabled">{chapter.steps.length} steps</Typography>
                <LinearProgress variant="determinate" value={0} sx={{ mt: 0.5, height: 3, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: chapter.color } }} />
            </Box>
        </CardContent>
    </Card>
);

const Tutorial: React.FC = () => {
    const [selectedChapter, setSelectedChapter] = useState<string>('getting-started');
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

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
            <Box sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(8,145,178,0.08) 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><TutorialIcon /></Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>Tutorial</Typography>
                        <Typography variant="body2" color="text.secondary">Step-by-step guides to help people move confidently through the app.</Typography>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}><Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Current chapter</Typography><Typography variant="body1" fontWeight={800}>{chapter.title}</Typography></Paper></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Chapter progress</Typography><Typography variant="body1" fontWeight={800}>{totalProgress}%</Typography></Paper></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Chapters available</Typography><Typography variant="body1" fontWeight={800}>{TUTORIAL_CHAPTERS.length}</Typography></Paper></Grid>
                </Grid>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>Chapters</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {TUTORIAL_CHAPTERS.map((c) => <ChapterCard key={c.id} chapter={c} onSelect={() => handleChapterChange(c.id)} isSelected={selectedChapter === c.id} />)}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><PlayIcon color="primary" /><Typography variant="subtitle1" fontWeight={800}>Guided steps</Typography></Box>
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {chapter.steps.map((step, i) => (
                                    <Step key={i} completed={completed.has(i)}>
                                        <StepLabel StepIconComponent={() => completed.has(i) ? <DoneIcon sx={{ color: chapter.color, fontSize: 22 }} /> : <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: i === activeStep ? chapter.color : 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: i === activeStep ? '#fff' : 'text.disabled', fontSize: '0.7rem', fontWeight: 700 }}>{i + 1}</Typography></Box>}>
                                            <Typography variant="body2" fontWeight={700}>{step.label}</Typography>
                                        </StepLabel>
                                        <StepContent>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.75 }}>{step.description}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button variant="contained" size="small" onClick={handleStepComplete} sx={{ bgcolor: chapter.color, '&:hover': { bgcolor: chapter.color, filter: 'brightness(0.92)' } }}>{i === chapter.steps.length - 1 ? 'Finish chapter' : 'Got it →'}</Button>
                                                {i > 0 && <Button size="small" onClick={() => setActiveStep(i - 1)} variant="text" color="inherit">Back</Button>}
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>

                            {completed.size === chapter.steps.length && (
                                <Box sx={{ mt: 3, p: 3, borderRadius: 3, textAlign: 'center', bgcolor: `${chapter.color}10`, border: `1px dashed ${chapter.color}` }}>
                                    <DoneIcon sx={{ color: chapter.color, fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" fontWeight={800} gutterBottom>Chapter complete 🎉</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>You’ve finished the "{chapter.title}" chapter.</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Button variant="outlined" size="small" onClick={() => { const nextIndex = TUTORIAL_CHAPTERS.findIndex((c) => c.id === selectedChapter) + 1; if (nextIndex < TUTORIAL_CHAPTERS.length) { handleChapterChange(TUTORIAL_CHAPTERS[nextIndex].id); } }}>Next chapter →</Button>
                                        <Button variant="text" size="small" onClick={() => { setCompletedSteps({}); setSelectedChapter('getting-started'); setActiveStep(0); }}>Restart tour</Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ mt: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Box>
                                <Typography variant="h6" fontWeight={800}>Quick references</Typography>
                                <Typography variant="body2" color="text.secondary">The most common places users jump to when they’re learning the app.</Typography>
                            </Box>
                            <Chip label="Always visible" size="small" />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={1.5}>
                            {['Dashboard overview', 'Inventory controls', 'Billing workflow', 'Session management', 'User permissions', 'Security settings'].map((item) => (
                                <Grid key={item} size={{ xs: 6, sm: 4 }}>
                                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                                        <Typography variant="body2" fontWeight={600}>{item}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Tutorial;
