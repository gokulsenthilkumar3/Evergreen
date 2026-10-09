# Yarn Management System

A comprehensive monorepo application for managing yarn production, inventory, procurement, and billing. This system provides a full-stack solution with a React-based web interface and a TypeScript Express API.

## 🚀 Features

* **Procurement Management**: Track suppliers and raw material intake.
* **Manufacturing Dashboard**: Manage production batches and track wastage.
* **Inventory Tracking**: Real-time monitoring of raw materials and finished goods.
* **Billing & Invoicing**: Customer management and invoice generation.
* **Role-Based Access**: Secure authentication with multi-factor support (TOTP).
* **Data Visualization**: Integrated charts for reporting and analytics.

## 🛠 Tech Stack

* **Frontend**: React 18, Vite, Material UI (MUI), Recharts.
* **Backend**: Node.js, Express, TypeScript, Prisma ORM.
* **Database**: PostgreSQL.
* **Infrastructure**: Docker, Redis (for caching), MinIO (for object storage).

---

## 📦 Project Structure

```text
yarn-management/
├── apps/
│   ├── api/          # Express backend with Prisma
│   └── web/          # React frontend with Vite
├── docker-compose.yml # Infrastructure services (DB, Redis, MinIO)
└── package.json       # Monorepo workspace configuration

```

---

## 🛠 Setup & Deployment Steps

### 1. Prerequisites

* Node.js (v18+)
* Docker and Docker Compose
* NPM (v7+ for workspace support)

### 2. Infrastructure Setup

Spin up the required database and storage services using Docker:

```bash
docker-compose up -d

```

This starts PostgreSQL (port 5435), Redis (port 6379), and MinIO (port 9000/9001).

### 3. Environment Configuration

Create `.env` files in both the `apps/api` and `apps/web` directories based on the provided `.env.example` templates.

**Key API Variables:**

* `DATABASE_URL`: `postgresql://yarn:yarn@localhost:5435/yarn?schema=public`

### 4. Database Initialization

Navigate to the API directory to generate the Prisma client and run migrations:

```bash
cd apps/api
npm install
npm run prisma:migrate
npm run seed

```

*Note: `npm run seed` populates the database with initial required data.*

### 5. Running the Application

You can start both the frontend and backend from the root directory:

**Start Backend (API):**

```bash
npm run dev:api

```

The API will start using `tsx watch` for hot-reloading.

**Start Frontend (Web):**

```bash
npm run dev:web

```

The web interface will be available at the address provided by Vite (usually `http://localhost:5173`).

---

## 🏗 Build for Production

To create production-ready bundles:

**Build API:**

```bash
npm run build:api
# Output will be in apps/api/dist

```

**Build Web:**

```bash
npm run build:web
# Output will be in apps/web/dist

```

---

## 🧪 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev:api` | Starts the backend API in development mode. |
| `npm run dev:web` | Starts the frontend web app in development mode. |
| `npm run prisma:studio` | Opens a GUI to view/edit your database data. |
| `npm run build` | Compiles TypeScript and builds production assets. |
