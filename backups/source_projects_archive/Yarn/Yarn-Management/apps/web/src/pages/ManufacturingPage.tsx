import { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import BatchKanban from '../components/manufacturing/BatchKanban';
import ManufacturingDashboard from '../components/manufacturing/ManufacturingDashboard';

export default function ManufacturingPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth={false} sx={{ px: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Dashboard" />
          <Tab label="Production Board" />
        </Tabs>
      </Box>
      {tab === 0 && <ManufacturingDashboard />}
      {tab === 1 && <BatchKanban />}
    </Container>
  );
}
