import { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';
import SupplierList from '../components/SupplierList';
import RawMaterialList from '../components/RawMaterialList';
import PurchaseOrderList from '../components/procurement/PurchaseOrderList';
import RFQList from '../components/procurement/RFQList';
import GRNList from '../components/procurement/GRNList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

export default function ProcurementPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Procurement</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage suppliers, raw materials, purchase orders, and inventory.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Purchase Orders" />
          <Tab label="Quotations (RFQ)" />
          <Tab label="Goods Receipts (GRN)" />
          <Tab label="Suppliers" />
          <Tab label="Raw Materials" />
        </Tabs>
      </Box>

      <CustomTabPanel value={tab} index={0}>
        <PurchaseOrderList />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        <RFQList />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={2}>
        <GRNList />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={3}>
        <SupplierList />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={4}>
        <RawMaterialList />
      </CustomTabPanel>
    </Container>
  );
}
