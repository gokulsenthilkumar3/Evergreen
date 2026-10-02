# 🧶 EverGreen One — Yarn, Billing & MSME ERP

**EverGreen One** is the active React/Nest/SQLite application for yarn operations, job work, catalogue sales, a public shop, GST invoices and customer ledgers. Feature consolidation is still in progress; [PARITY_REGISTER.md](PARITY_REGISTER.md) records what is working and what remains unverified.

## One App, Connected Workspaces

The **Business Workspace** is the single entry point for every part of the business:

- **Yarn operations** — inward lots, inventory, production, waste and outward dispatch.
- **Job work & production** — material movement, production receipts and count-wise output.
- **Invoices & GST** — invoices, quotations, challans, purchase orders and printable documents.
- **Customers & payments** — customer ledgers, dues and invoice-linked payments. Bank reconciliation is not part of this release.

The shared navigation and catalogue mean teams do not need to switch between separate apps to run the workflow from stock to sale to payment.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20MUI-61DAFB?logo=react)
![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Database-Prisma%20%2B%20SQLite-2D3748?logo=prisma)

---

## 🚀 Key Features

### 📊 Intelligent Dashboards
*   **Global Dashboard**: Real-time KPIs for total production, stock levels, waste rates, and financial overviews.
*   **Today's Summary**: A dedicated view for daily operations, tracking costs per KG and production status in real-time.

### 📦 Inventory & Procurement
*   **Raw Material (Inward)**: Track cotton bale intake by supplier, weight (kg), and batch IDs.
*   **Yarn Stock Management**: Automated inventory updates for finished yarn bags across different counts.

### 🏭 Production Control
*   **Mixing & Consumption**: Log cotton consumption from specific inward batches.
*   **Yarn Output**: Record daily yarn production with count-wise breakdown.
*   **Waste Tracking**: Detailed monitoring of Blow Room, Carding, and OE waste to minimize loss.

### 💳 Complete Costing Module
*   **Operational Expenses**: Log EB (Electricity), Employee wages, Packaging, Maintenance, and general expenses.
*   **Dynamic Costing**: Automatically calculate the real cost per KG based on current production and expenses.

### 🚚 Outward (Sales)
*   **Sales Logging**: Manage customer shipments with vehicle and driver tracking.
*   **Automatic Deduction**: Sales entries instantly deduct stock from the yarn inventory for precise balance tracking.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **UI Library**: Material UI (MUI)
- **State Management**: TanStack Query (React Query)
- **Styling**: Vanilla CSS / MUI System
- **Build Tool**: Vite

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: SQLite (via Prisma ORM)
- **Auth**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **Logging**: Database activity records for selected actions; complete audit coverage remains a release gate

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 20.19+ or 22.12+ (the installed Vite version does not support Node 18)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/gokulsenthilkumar3/Evergreen.git
cd Evergreen
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Configure the API in `apps/api/.env`. Prisma CLI commands may also read the root `.env`; keep `DATABASE_URL` consistent in both when using the CLI:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-random-secret-of-at-least-32-characters"
BOOTSTRAP_ADMIN_USERNAME="your-admin-name"
BOOTSTRAP_ADMIN_EMAIL="admin@example.com"
BOOTSTRAP_ADMIN_PASSWORD="replace-with-a-unique-password-of-at-least-12-characters"
```
Bootstrap variables create an administrator only when the user table is empty. Remove them after the first successful startup. Do not use a known or shared password.

### 4. Database Setup (new, empty database only)
```bash
npx prisma db push --schema packages/database/prisma/schema.prisma
```
Do not run `db push` or the legacy bridge script against an existing operational database without a verified SQLite backup and reconciliation. The current legacy bridge still needs a consistent online backup and transaction-safe cutover before use on live data.

### 5. Start Development Servers
```bash
# Start API and web together
npm run dev
```
Open `http://localhost:4000/` for staff UI or `http://localhost:4000/shop` for the public shop. Browser API calls use `/api/backend` on the same public port. The launcher compiles and starts an internal API on `127.0.0.1:4301` by default and verifies the public health route before reporting ready. Set `EVERGREEN_PUBLIC_PORT` and `EVERGREEN_API_PORT` if these ports are occupied; it will not stop another service.

Production build: `npm run build -w apps/api` and `npm run build -w apps/web`. These passing builds do not establish feature parity or release readiness; see the parity register and release gates.

---

## 📁 Project Structure

```text
Evergreen/
├── apps/
│   ├── api/          # NestJS Backend
│   └── web/          # React Frontend
├── packages/
│   ├── database/     # Prisma Schema & Migrations
│   └── common/       # Shared Types & Logic
└── package.json      # Monorepo configuration
```

---

## 🔒 Security
- **JWT Auth**: Secure login with persistent sessions.
- **RBAC**: Access levels for Admin, Author, and Viewer roles.
- **Transaction Safety**: Canonical commerce operations use database transactions. Legacy inward, production and costing write paths still require consolidation before release.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for the Yarn Industry.
