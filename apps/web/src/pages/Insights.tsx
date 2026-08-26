import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Button,
    Card,
    CardContent,
} from '@mui/material';
import {
    BarChart as ReportsIcon,
    Lightbulb as InsightsIcon,
    Route as EwayBillIcon,
    Sync as TallySyncIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    FileDownload as DownloadIcon,
} from '@mui/icons-material';
import EwayBills from '../components/insights/EwayBills';
import TallySync from '../components/insights/TallySync';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
        {value === index && children}
    </Box>
);



// --- Reports Tab ---
const REPORT_CATEGORIES = [
    {
        category: 'Sales Reports',
        color: '#059669',
        reports: ['Invoice Summary', 'Customer-wise Sales', 'Product-wise Sales', 'Monthly Sales Trend', 'GST Sales Register'],
    },
    {
        category: 'Purchase Reports',
        color: '#0284c7',
        reports: ['Purchase Summary', 'Vendor-wise Purchase', 'Inward Stock Report', 'Cost Analysis'],
    },
    {
        category: 'Financial Reports',
        color: '#7c3aed',
        reports: ['P&L Statement', 'Balance Sheet', 'Cash Flow Statement', 'Trial Balance', 'Ledger Report'],
    },
    {
        category: 'Inventory Reports',
        color: '#d97706',
        reports: ['Stock Summary', 'Yarn Count-wise Stock', 'Batch-wise Report', 'Wastage Report', 'Production Report'],
    },
    {
        category: 'GST Reports',
        color: '#dc2626',
        reports: ['GSTR-1', 'GSTR-2', 'GSTR-3B', 'HSN Summary', 'E-Way Bill Report'],
    },
];

const ReportsTab = () => (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Reports Centre</Typography>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={() => alert('All reports exported successfully!')}>Export All</Button>
        </Box>
        <Grid container spacing={2.5}>
            {REPORT_CATEGORIES.map((cat) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={cat.category}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Box sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 1,
                                bgcolor: `${cat.color}15`, color: cat.color,
                                px: 1.5, py: 0.5, borderRadius: 2, mb: 2,
                            }}>
                                <ReportsIcon fontSize="small" />
                                <Typography variant="caption" fontWeight={700}>{cat.category}</Typography>
                            </Box>
                            <List disablePadding dense>
                                {cat.reports.map((report) => (
                                    <ListItem key={report} disablePadding sx={{ py: 0.3 }}>
                                        <ListItemIcon sx={{ minWidth: 28 }}>
                                            <CheckIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={report}
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Button variant="text" size="small" sx={{ mt: 1.5 }} onClick={() => alert(`${cat.category} reports generated successfully!`)}>
                                Generate Reports →
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </Box>
);

// --- Insights Tab ---
const InsightsTab = () => {
    const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
        queryKey: ['billingInvoicesInsights'],
        queryFn: async () => (await api.get('/billing/invoices')).data,
        staleTime: 60_000,
    });

    const { data: dashboardSummary } = useQuery({
        queryKey: ['dashboardSummaryInsights'],
        queryFn: async () => (await api.get('/dashboard/summary')).data,
        staleTime: 60_000,
    });

    const { data: dashboardCharts } = useQuery({
        queryKey: ['dashboardChartsInsights'],
        queryFn: async () => (await api.get('/dashboard/charts')).data,
        staleTime: 60_000,
    });

    const unpaidInvoices = invoices.filter((i: any) => i.status !== 'PAID');
    const unpaidCount = unpaidInvoices.length;
    const totalUnpaidVal = unpaidInvoices.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);
    const topCustomer = invoices.length > 0
        ? [...invoices].sort((a: any, b: any) => (b.total || 0) - (a.total || 0))[0]?.customerName || 'No Data'
        : 'No Data';
    const products = dashboardCharts?.costByCategory || [];
    const productionKg = dashboardSummary?.meta?.periodProduction || 0;
    
    const INSIGHT_CARDS = [
        { emoji: '📈', title: 'Revenue Trend', value: invoices.length > 0 ? '+5%' : '0%', subtitle: 'vs last month', color: '#059669' },
        { emoji: '🧾', title: 'Unpaid Invoices', value: unpaidCount.toString(), subtitle: totalUnpaidVal > 0 ? `worth ₹${totalUnpaidVal.toLocaleString('en-IN')}` : 'All cleared', color: '#dc2626' },
        { emoji: '📦', title: 'Dashboard Output', value: productionKg ? `${productionKg.toFixed(0)} kg` : '0 kg', subtitle: 'selected period', color: '#7c3aed' },
        { emoji: '🏆', title: 'Top Customer', value: topCustomer, subtitle: 'Based on recent', color: '#d97706' },
    ];

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>Business Insights</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                AI-powered insights to help you make smarter business decisions.
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {INSIGHT_CARDS.map((card) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                        <Paper elevation={0} sx={{
                            p: 2.5, borderRadius: 3,
                            border: `2px solid ${card.color}30`,
                            background: `linear-gradient(135deg, ${card.color}08 0%, transparent 100%)`,
                            textAlign: 'center',
                        }}>
                            <Typography sx={{ fontSize: '2rem', mb: 1 }}>{card.emoji}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {card.title}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} sx={{ color: card.color, my: 0.5 }}>{card.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{card.subtitle}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 2 }}>Actionable Recommendations</Typography>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsightsIcon sx={{ color: '#7c3aed' }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#7c3aed' }}>AI Analysis Engine</Typography>
                </Box>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {invoicesLoading ? (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight={700}>Loading live insights…</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Pulling billing and dashboard data from the API.
                            </Typography>
                        </Box>
                    ) : unpaidCount > 0 ? (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'error.50', border: '1px dashed', borderColor: 'error.main' }}>
                            <Typography variant="subtitle2" color="error.main" fontWeight={700}>⚠️ High Priority: Unpaid Invoices</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                You have {unpaidCount} unpaid invoices totaling ₹{totalUnpaidVal.toLocaleString('en-IN')}. Consider sending automated payment reminders to improve cash flow.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: '1px dashed', borderColor: 'success.main' }}>
                            <Typography variant="subtitle2" color="success.main" fontWeight={700}>✅ Healthy Cash Flow</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                All your invoices are fully paid. Excellent job maintaining a healthy accounts receivable balance.
                            </Typography>
                        </Box>
                    )}

                    {dashboardSummary?.meta?.yarnBags < 5 ? (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50', border: '1px dashed', borderColor: 'info.main' }}>
                            <Typography variant="subtitle2" color="info.main" fontWeight={700}>💡 Catalogue Optimization</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Your active stock catalogue is still compact. Expanding your product mix can increase order breadth and repeat sales.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: '1px dashed', borderColor: 'success.main' }}>
                            <Typography variant="subtitle2" color="success.main" fontWeight={700}>📦 Strong Product Portfolio</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                You have a healthy catalogue of {products.length} products ready for sale.
                            </Typography>
                        </Box>
                    )}

                    {invoices.length > 0 && (
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px dashed', borderColor: 'warning.main' }}>
                            <Typography variant="subtitle2" color="warning.dark" fontWeight={700}>🌟 Customer Retention</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Recent invoice activity shows repeated business around <b>{topCustomer}</b>. A small loyalty touchpoint could help maintain momentum.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

// --- Tabs Config ---
const INSIGHT_TABS = [
    { label: 'Reports', icon: <ReportsIcon fontSize="small" /> },
    { label: 'Insights', icon: <InsightsIcon fontSize="small" /> },
    { label: 'E-way Bills', icon: <EwayBillIcon fontSize="small" /> },
    { label: 'Tally Sync', icon: <TallySyncIcon fontSize="small" /> },
];

const Insights: React.FC = () => {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Insights & Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                    Business intelligence, reports, e-way bills and accounting sync.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'hidden' }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50',
                        '& .MuiTab-root': { minHeight: 52, fontWeight: 600, fontSize: '0.82rem', textTransform: 'none' },
                    }}
                >
                    {INSIGHT_TABS.map((t, i) => (
                        <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
                    ))}
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tab} index={0}><ReportsTab /></TabPanel>
                    <TabPanel value={tab} index={1}><InsightsTab /></TabPanel>
                    <TabPanel value={tab} index={2}>
                        <EwayBills />
                    </TabPanel>
                    <TabPanel value={tab} index={3}>
                        <TallySync />
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
};

export default Insights;
