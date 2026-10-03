import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import ExecutiveDashboard from './ExecutiveDashboard';
import ReportBuilder from './ReportBuilder';
import ComplianceReports from './ComplianceReports';
import ReportSchedulePage from './ReportSchedulePage';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`reporting-tabpanel-${index}`}
            aria-labelledby={`reporting-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function ReportingLayout() {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Reporting & Business Intelligence</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="reporting tabs">
                    <Tab label="Executive Dashboard" />
                    <Tab label="Report Builder" />
                    <Tab label="Compliance & Regulatory" />
                    <Tab label="Report Distributions" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <ExecutiveDashboard />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ReportBuilder />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <ComplianceReports />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <ReportSchedulePage />
            </TabPanel>
        </Box>
    );
}
