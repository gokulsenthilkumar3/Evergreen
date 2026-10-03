# Yarn Management System - User Guide

Welcome to the **Yarn Management System**, a comprehensive ERP solution designed specifically for textile and yarn manufacturing businesses. This guide will help you navigate the system and understand each module's capabilities.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Module Guide](#module-guide)
   - [Procurement](#procurement)
   - [Inventory & Warehouse](#inventory--warehouse)
   - [Manufacturing](#manufacturing)
   - [Quality Control](#quality-control)
   - [Sales & Customers](#sales--customers)
   - [Finance & Billing](#finance--billing)
   - [HR & Payroll](#hr--payroll)
   - [Documents](#documents)
   - [Communication Center](#communication-center)
   - [Reports & Analytics](#reports--analytics)
   - [Integrations](#integrations)
   - [Settings](#settings)
4. [Navigation Tips](#navigation-tips)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Support](#support)

---

## Getting Started

### First-Time Login

1. Navigate to the application URL
2. Enter your credentials:
   - **Email**: Your registered email address
   - **Password**: Your account password
3. Click **Sign In**

> [!TIP]
> Default admin credentials: `admin@example.com` / `admin123456!`

### Setting Up Your Profile

After logging in, navigate to **Settings** to:
- Update company information
- Configure notification preferences
- Set up two-factor authentication (WebAuthn)
- Manage active sessions

---

## Dashboard Overview

The main dashboard (`/dashboard`) provides a real-time overview of your business:

| Widget | Description |
|--------|-------------|
| **Production Status** | Live batch progress, stage distribution, active operators |
| **Financial Overview** | Revenue trends, outstanding invoices, collection rates |
| **Inventory Health** | Low stock alerts, overstock warnings, reorder indicators |
| **Supplier Performance** | Top suppliers, delivery trends, risk levels |
| **Quality Metrics** | Defect rates, quality grades, inspection status |

### Dashboard Actions
- Click any widget for drill-down details
- Use date range filters to adjust metrics
- Export data directly from charts

---

## Module Guide

### Procurement

**Path**: `/procurement`

Manage your entire supplier ecosystem and purchase workflow.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Supplier Master** | `/procurement` | View and manage all suppliers |
| **Supplier Onboarding** | `/suppliers/onboarding` | Multi-step wizard for new suppliers |
| **Performance Dashboard** | `/suppliers/:id/performance` | Automated scoring, ratings, risk assessment |
| **Purchase Orders** | Via Procurement page | Create, track, and manage POs |
| **RFQ Management** | Via Procurement page | Request and compare quotations |
| **GRN (Goods Receipt)** | Via Procurement page | Receive goods against POs |

#### Key Concepts
- **Supplier Codes**: Unique identifiers (e.g., SUP-001)
- **Performance Scoring**: Automated based on quality, delivery, pricing
- **Risk Levels**: LOW, MEDIUM, HIGH based on assessment algorithms

---

### Inventory & Warehouse

**Paths**: `/inventory`, `/warehouse`

Complete stock management with barcode/QR support.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Raw Materials** | `/inventory` | Track all incoming materials |
| **Warehouse Management** | `/warehouse` | Multi-warehouse support |
| **Warehouse Details** | `/warehouse/warehouses/:id` | Location hierarchy (Zone > Rack > Bin) |
| **Stock Transfers** | `/warehouse/transfer` | Move stock between warehouses |
| **Stock Movements** | `/warehouse/movements` | Complete audit trail |
| **Barcode Scanner** | `/warehouse/scanner` | Web-based scanning interface |
| **Inventory Optimization** | `/warehouse/optimization` | Reorder points, EOQ, ABC analysis |
| **Reconciliation** | `/warehouse/reconciliation` | Match physical vs system stock |

#### Key Concepts
- **Batch Numbers**: Unique identifiers for raw materials (e.g., RM-202400)
- **FIFO/LIFO**: First-In-First-Out or Last-In-First-Out tracking
- **Safety Stock**: Minimum quantity to maintain

---

### Manufacturing

**Paths**: `/manufacturing`, `/production-planning`

End-to-end production management from planning to completion.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Production Planning** | `/production-planning` | Demand forecasting, capacity planning, MRP |
| **Live Dashboard** | `/production/live` | Real-time batch status monitoring |
| **Work Orders** | `/work-orders` | Create and track work orders |
| **Shift Management** | `/shifts` | Schedule operators across shifts |
| **Machine Management** | `/machines` | Equipment registry, maintenance scheduling |
| **Production Efficiency** | `/production/efficiency` | OEE tracking, cycle time analysis |
| **Demand Forecasting** | `/demand-forecasting` | ML-powered demand predictions |
| **Wastage Tracking** | `/wastage` | Monitor and analyze wastage |

#### Production Stages
1. **SPINNING** - Raw material processing
2. **WINDING** - Yarn winding to cones
3. **QUALITY_CHECK** - Inspection and testing
4. **PACKING** - Final packaging
5. **COMPLETED** - Ready for dispatch

#### Key Metrics
- **OEE (Overall Equipment Effectiveness)**: Availability × Performance × Quality
- **Cycle Time**: Duration per production stage
- **Wastage Rate**: Percentage of material lost

---

### Quality Control

**Paths**: `/quality-control`, `/quality-analytics`

Comprehensive quality management system.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Inspections** | `/quality-control` | Create and manage inspections |
| **Quality Analytics** | `/quality-analytics` | Trend analysis, supplier comparison |
| **Test Results** | Via Quality Control | Record lab test parameters |
| **Defect Tracking** | Via Quality Control | Log and analyze defects |

#### Inspection Types
- **Raw Material Incoming**: Verify incoming materials
- **Production Batch**: In-process quality checks
- **Finished Goods**: Final product inspection

#### Quality Grades
- **A**: Premium (Score 90+)
- **B**: Standard (Score 80-89)
- **C**: Acceptable (Score 70-79)
- **D**: Below Standard (Score 60-69)
- **F**: Fail (Score < 60)

---

### Sales & Customers

**Paths**: `/customers`, `/sales/orders`

Complete CRM and sales order management.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Customer Master** | `/customers` | Customer database with segmentation |
| **Customer Details** | `/customers/:id` | Purchase history, analytics |
| **New Customer** | `/customers/new` | Customer creation form |
| **Sales Orders** | `/sales/orders` | Order management and fulfillment |
| **Order Details** | `/sales/orders/:id` | Line items, status, delivery |

#### Customer Lifecycle Stages
- **LEAD** → **PROSPECT** → **ACTIVE** → **CHURNED**

#### Customer Value Classification
- **ENTERPRISE**: High-value accounts
- **STRATEGIC**: Growing relationships
- **STANDARD**: Regular customers
- **BASIC**: Occasional buyers

---

### Finance & Billing

**Paths**: `/billing`, `/finance/ar`, `/finance/ap`

Complete financial management suite.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Invoicing** | `/billing` | Create and manage invoices |
| **Invoice Details** | `/billing/invoices/:id` | Line items, payments, history |
| **Print Invoice** | `/billing/print/:id` | Professional print layout |
| **Accounts Receivable** | `/finance/ar` | Customer aging, collections |
| **Customer Ledger** | `/finance/ledger/:customerId` | Per-customer transaction history |
| **Accounts Payable** | `/finance/ap` | Vendor payments, scheduling |
| **Vendor Ledger** | `/finance/ap/ledger/:supplierId` | Per-vendor transaction history |

#### Invoice Statuses
- **DRAFT** → **PENDING** → **PAID** / **OVERDUE** / **CANCELLED**

#### Key Metrics
- **DSO (Days Sales Outstanding)**: Average collection time
- **CEI (Collection Effectiveness Index)**: Collection efficiency
- **Aging Buckets**: 0-30, 31-60, 61-90, 90+ days

---

### HR & Payroll

**Paths**: `/hr/employees`, `/hr/payroll`

Employee management and payroll processing.

#### Features

| Feature | Path | Description |
|---------|------|-------------|
| **Employee Management** | `/hr/employees` | Employee directory |
| **Payroll Processing** | `/hr/payroll` | Salary calculation, payslips |

#### Employee Data
- Personal information
- Department and designation
- Attendance tracking
- Leave management
- Performance reviews
- Skill matrix

---

### Documents

**Path**: `/documents`

Centralized document repository with version control.

#### Features
- **Folder Structure**: Organize documents hierarchically
- **Version Control**: Track document revisions
- **Access Permissions**: Control who can view/edit
- **Approval Workflow**: Route documents for approval
- **Digital Signatures**: E-sign documents
- **Expiry Tracking**: Get alerted before documents expire

#### Document Categories
- Contracts
- Certificates
- Policies
- Reports
- Compliance documents

---

### Communication Center

**Path**: `/communication`

Internal communication and collaboration hub.

#### Features
- **Internal Messaging**: User-to-user chat
- **Group Discussions**: Team conversations
- **Announcements**: Company-wide broadcasts
- **Email Templates**: Pre-defined email formats
- **Bulk Emailing**: Send to multiple recipients
- **Email Tracking**: Delivery and read receipts

---

### Reports & Analytics

**Path**: `/reports`

Advanced reporting and business intelligence.

#### Features
- **Custom Report Builder**: Drag-and-drop field selection
- **Pre-built Templates**: Industry-standard reports
- **Scheduled Reports**: Automatic generation and delivery
- **Export Options**: PDF, Excel, CSV
- **GST Reports**: GSTR-1, GSTR-3B
- **Financial Statements**: P&L, Balance Sheet, Cash Flow
- **Audit Reports**: Activity logs, data changes

---

### Integrations

**Path**: `/integrations`

Connect with third-party systems.

#### Supported Integrations
- **Accounting**: Tally, QuickBooks, Zoho Books
- **Logistics**: Delhivery, shipping providers
- **E-commerce**: Shopify, WooCommerce
- **Payment**: Razorpay, Stripe

#### Developer Portal

**Path**: `/developer`

For technical integrations:
- API Documentation (OpenAPI/Swagger)
- API Key Management
- Webhook Configuration
- Sandbox Environment

---

### Settings

**Path**: `/settings`

System configuration and preferences.

#### Tabs

| Tab | Features |
|-----|----------|
| **General** | Company profile, preferences, dark mode |
| **Security** | WebAuthn setup, session management |
| **Session Logs** | View login history, revoke sessions |
| **App Settings** | Enable/disable modules |

---

## Navigation Tips

### Sidebar Navigation
The left sidebar provides quick access to all modules. Look for icons:
- 📊 Dashboard
- 🛒 Procurement
- 📦 Inventory
- 🏭 Manufacturing
- ✅ Quality
- 💰 Finance
- 👥 Customers
- 📄 Documents
- 💬 Communication
- 📈 Reports
- ⚙️ Settings

### Global Search
Press `Ctrl + K` (or `Cmd + K` on Mac) to open global search. Search across:
- Suppliers
- Raw Materials
- Production Batches
- Customers
- Invoices

### Notifications
Click the 🔔 bell icon to view:
- Low stock alerts
- Quality check failures
- Payment due reminders
- Production delays

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open global search |
| `Ctrl + N` | Create new item (context-sensitive) |
| `Ctrl + S` | Save current form |
| `Esc` | Close modal/dialog |

---

## Support

### Help & Support Page
Navigate to `/support` for:
- **Knowledge Base**: FAQs, how-to guides
- **Support Tickets**: Create and track issues
- **Feature Requests**: Submit and vote on ideas

### Contact
For technical support, contact your system administrator or refer to the developer documentation.

---

> [!NOTE]
> This guide covers the core features. Individual pages may have additional functionality accessible through context menus and action buttons.

**Last Updated**: February 2026
