# 🧶 Evergreen Yarn Flow SMS

**Evergreen Yarn Flow SMS** (Spinner Management System) is a powerful, modern ERP solution designed specifically for yarn spinning mills. It streamlines operations from raw material inward to production processing and final sales (outward), providing real-time costing and inventory insights.

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
- **Framework**: React 18
- **UI Library**: Material UI (MUI)
- **State Management**: TanStack Query (React Query)
- **Styling**: Vanilla CSS / MUI System
- **Build Tool**: Vite

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: SQLite (via Prisma ORM)
- **Auth**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **Logging**: Custom Winston-based system logging

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
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
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./packages/database/prisma/dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
```

### 4. Database Setup
```bash
npx prisma db push --schema packages/database/prisma/schema.prisma
```

### 5. Start Development Servers
```bash
# Start both API and Web apps
npm run dev
```

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
- **Transaction Safety**: Guaranteed data integrity during complex inventory movements.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for the Yarn Industry.