import './styles.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

// Lazy load all page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InvoicePrintPage = lazy(() => import('./pages/InvoicePrintView'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const ProcurementPage = lazy(() => import('./pages/ProcurementPage'));
const ManufacturingPage = lazy(() => import('./pages/ManufacturingPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const WastagePage = lazy(() => import('./pages/WastagePage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const ReportingLayout = lazy(() => import('./pages/reporting/ReportingLayout'));
const IntegrationPage = lazy(() => import('./pages/IntegrationPage'));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const QualityControlPage = lazy(() => import('./pages/QualityControlPage'));
const QualityAnalyticsDashboard = lazy(() => import('./pages/QualityAnalyticsDashboard'));
const SupplierLayout = lazy(() => import('./layouts/SupplierLayout'));
const SupplierDashboard = lazy(() => import('./pages/portal/SupplierDashboard'));
const SupplierOrderList = lazy(() => import('./pages/portal/SupplierOrderList'));
const SupplierOrderDetail = lazy(() => import('./pages/portal/SupplierOrderDetail'));
const CustomerLayout = lazy(() => import('./layouts/CustomerLayout'));
const CustomerDashboard = lazy(() => import('./pages/customer-portal/CustomerDashboard'));
const CustomerOrderList = lazy(() => import('./pages/customer-portal/CustomerOrderList'));
const CustomerOrderDetail = lazy(() => import('./pages/customer-portal/CustomerOrderDetail'));
const CustomerInvoiceList = lazy(() => import('./pages/customer-portal/CustomerInvoiceList'));
const CustomerInvoiceDetail = lazy(() => import('./pages/customer-portal/CustomerInvoiceDetail'));
const CustomerAccount = lazy(() => import('./pages/customer-portal/CustomerAccount'));
const CustomerSupport = lazy(() => import('./pages/customer-portal/CustomerSupport'));
const ProductionPlanningPage = lazy(() => import('./pages/ProductionPlanningPage'));
const WorkOrderPage = lazy(() => import('./pages/WorkOrderPage'));
const ShiftManagementPage = lazy(() => import('./pages/ShiftManagementPage'));
const MachineManagementPage = lazy(() => import('./pages/MachineManagementPage'));
const WarehousePage = lazy(() => import('./pages/WarehousePage'));
const WarehouseDetailsPage = lazy(() => import('./pages/WarehouseDetailsPage'));
const StockTransferPage = lazy(() => import('./pages/StockTransferPage'));
const StockMovementPage = lazy(() => import('./pages/StockMovementPage'));
const ScannerPage = lazy(() => import('./pages/ScannerPage'));
const InventoryOptimizationPage = lazy(() => import('./pages/InventoryOptimizationPage'));
const InventoryReconciliationPage = lazy(() => import('./pages/InventoryReconciliationPage'));
const ReconciliationWorkspacePage = lazy(() => import('./pages/ReconciliationWorkspacePage'));
const AccountsReceivablePage = lazy(() => import('./pages/finance/AccountsReceivablePage'));
const CustomerLedgerPage = lazy(() => import('./pages/finance/CustomerLedgerPage'));
const AccountsPayablePage = lazy(() => import('./pages/finance/AccountsPayablePage'));
const VendorLedgerPage = lazy(() => import('./pages/finance/VendorLedgerPage'));
const DemandForecastingPage = lazy(() => import('./pages/DemandForecastingPage'));
const SupplierOnboardingPage = lazy(() => import('./pages/suppliers/onboarding/SupplierOnboardingPage').then(m => ({ default: m.SupplierOnboardingPage })));
const LiveProductionDashboard = lazy(() => import('./pages/LiveProductionDashboard'));
const InvoiceDetailsPage = lazy(() => import('./pages/finance/InvoiceDetailsPage'));
const ProductionEfficiencyPage = lazy(() => import('./pages/ProductionEfficiencyPage'));
const CustomerManagementPage = lazy(() => import('./pages/customers/CustomerManagementPage'));
const CustomerForm = lazy(() => import('./pages/customers/CustomerForm'));
const CustomerDetailsPage = lazy(() => import('./pages/customers/CustomerDetailsPage'));
const SalesOrderPage = lazy(() => import('./pages/sales/SalesOrderPage'));
const SalesOrderForm = lazy(() => import('./pages/sales/SalesOrderForm'));
const SalesOrderDetailsPage = lazy(() => import('./pages/sales/SalesOrderDetailsPage'));
const EmployeeManagementPage = lazy(() => import('./pages/hr/EmployeeManagementPage'));
const PayrollManagementPage = lazy(() => import('./pages/hr/PayrollManagementPage'));
const DocumentManagementPage = lazy(() => import('./pages/documents/DocumentManagementPage'));
const CommunicationCenterPage = lazy(() => import('./pages/communication/CommunicationCenterPage'));
const SupportTicketsPage = lazy(() => import('./pages/support/SupportTicketsPage'));
const SupplierPerformanceDashboard = lazy(() => import('./pages/suppliers/performance/SupplierPerformanceDashboard').then(m => ({ default: m.SupplierPerformanceDashboard })));
const NewsIntelligencePage = lazy(() => import('./pages/NewsIntelligencePage'));

// Loading component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);


export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppSettingsProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/billing/print/:id" element={<InvoicePrintPage />} />
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/procurement" element={<ProcurementPage />} />
                    <Route path="/production-planning" element={<ProductionPlanningPage />} />
                    <Route path="/production/live" element={<LiveProductionDashboard />} />
                    <Route path="/work-orders" element={<WorkOrderPage />} />
                    <Route path="/shifts" element={<ShiftManagementPage />} />
                    <Route path="/machines" element={<MachineManagementPage />} />
                    <Route path="/manufacturing" element={<ManufacturingPage />} />
                    <Route path="/production/efficiency" element={<ProductionEfficiencyPage />} />
                    <Route path="/demand-forecasting" element={<DemandForecastingPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/billing/invoices/:id" element={<InvoiceDetailsPage />} />
                    <Route path="/customers" element={<CustomerManagementPage />} />
                    <Route path="/customers/new" element={<CustomerForm />} />
                    <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                    <Route path="/customers/:id/edit" element={<CustomerForm />} />
                    <Route path="/sales/orders" element={<SalesOrderPage />} />
                    <Route path="/sales/orders/new" element={<SalesOrderForm />} />
                    <Route path="/sales/orders/:id" element={<SalesOrderDetailsPage />} />
                    <Route path="/sales/orders/:id/edit" element={<SalesOrderForm />} />
                    <Route path="/hr/employees" element={<EmployeeManagementPage />} />
                    <Route path="/hr/payroll" element={<PayrollManagementPage />} />
                    <Route path="/documents" element={<DocumentManagementPage />} />
                    <Route path="/communication" element={<CommunicationCenterPage />} />
                    <Route path="/support" element={<SupportTicketsPage />} />
                    <Route path="/wastage" element={<WastagePage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/warehouse" element={<WarehousePage />} />
                    <Route path="/warehouse/warehouses/:id" element={<WarehouseDetailsPage />} />
                    <Route path="/warehouse/transfer" element={<StockTransferPage />} />
                    <Route path="/warehouse/movements" element={<StockMovementPage />} />
                    <Route path="/warehouse/scanner" element={<ScannerPage />} />
                    <Route path="/warehouse/optimization" element={<InventoryOptimizationPage />} />
                    <Route path="/warehouse/reconciliation" element={<InventoryReconciliationPage />} />
                    <Route path="/warehouse/reconciliation/:id" element={<ReconciliationWorkspacePage />} />
                    <Route path="/reports" element={<ReportingLayout />} />
                    <Route path="/integrations" element={<IntegrationPage />} />
                    <Route path="/developer" element={<DeveloperPage />} />
                    <Route path="/finance/ar" element={<AccountsReceivablePage />} />
                    <Route path="/finance/ledger/:customerId" element={<CustomerLedgerPage />} />
                    <Route path="/finance/ap" element={<AccountsPayablePage />} />
                    <Route path="/finance/ap/ledger/:supplierId" element={<VendorLedgerPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/quality-control" element={<QualityControlPage />} />
                    <Route path="/quality-analytics" element={<QualityAnalyticsDashboard />} />
                    <Route path="/suppliers/onboarding" element={<SupplierOnboardingPage />} />
                    <Route path="/suppliers/:supplierId/performance" element={<SupplierPerformanceDashboard />} />
                    <Route path="/news-intelligence" element={<NewsIntelligencePage />} />
                  </Route>
                </Route>

                {/* Supplier Portal Routes */}
                <Route path="/portal" element={
                  <ProtectedRoute>
                    <SupplierLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<SupplierDashboard />} />
                  <Route path="orders" element={<SupplierOrderList />} />
                  <Route path="orders/:id" element={<SupplierOrderDetail />} />
                </Route>

                {/* Customer Portal Routes */}
                <Route path="/customer-portal" element={
                  <ProtectedRoute>
                    <CustomerLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="orders" element={<CustomerOrderList />} />
                  <Route path="orders/:id" element={<CustomerOrderDetail />} />
                  <Route path="invoices" element={<CustomerInvoiceList />} />
                  <Route path="invoices/:id" element={<CustomerInvoiceDetail />} />
                  <Route path="account" element={<CustomerAccount />} />
                  <Route path="support" element={<CustomerSupport />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppSettingsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
