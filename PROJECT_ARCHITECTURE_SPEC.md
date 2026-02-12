# Ever Green Yarn - Project Specification & Architecture

## 1. Project Summary
**Ever Green Yarn Flow SMS (Spinner Management System)** is a comprehensive Enterprise Resource Planning (ERP) solution tailored for the yarn spinning industry. It integrates **Inventory Management** and **Costing Management** into a unified platform to track raw material flow, production efficiency, and precise daily operational costs.

The system provides real-time visibility into the entire yarn production lifecycle—from raw cotton inward to yarn spinning, packaging, and final sales—while automating complex cost calculations to determine the exact production cost per KG.

### Core Objectives
*   **Digitize Operations:** Replace manual logbooks with a centralized digital system.
*   **Real-time Costing:** Automatically calculate daily production costs based on energy, labor, packaging, and maintenance.
*   **Inventory Control:** Track every bale of cotton and bag of yarn to prevent leakage and optimize stock.
*   **Decision Support:** Provide actionable insights via interactive dashboards for Admins and Management.

---

## 2. Technology Stack Recommendation

Given the requirements for a responsive, downloadable, and high-performance web application, the following stack is recommended. This aligns with your current progress and ensures scalability.

### **Frontend (Client-Side)**
*   **Framework:** **React 18** (via **Vite**) - For fast performance and rapid development.
*   **Language:** **TypeScript** - Ensures type safety and reduces bugs.
*   **UI Library:** **Material UI (MUI)** - For a premium, responsive design (Dark mode, consistent theming).
*   **State Management:** **TanStack Query (React Query)** - For handling server state, caching, and background updates.
*   **Charts:** **Recharts** - For rendering performance-heavy visualizations (Line, Bar, Pie charts).
*   **App Capabilities:** **Vite PWA Plugin** - To make the web app "downloadable" (installable on Home Screen) and work offline/network-resilient on phones and laptops.

### **Backend (Server-Side)**
*   **Framework:** **NestJS** - A progressive Node.js framework for building efficient, scalable server-side applications. It provides structure (Modules, Services, Controllers) perfect for complex enterprise logic.
*   **Language:** **TypeScript**.
*   **ORM:** **Prisma** - For type-safe database access and automated migrations.
*   **Authentication:** **Passport.js + JWT** - For secure stateless authentication.
*   **Security:** **Helmet** (Headers security), **Rate Limiting** (DDOS protection).

### **Database**
*   **Primary DB:** **PostgreSQL** (Recommended) or **SQLite** (Current/Dev).
    *   *Note:* SQLite is excellent for single-server/local deployments. If you anticipate high concurrency or need to scale horizontally later, PostgreSQL is the industry standard drop-in replacement via Prisma.

---

## 3. System Architecture

The application will follow a **Modular Monolith** architecture. This keeps related business logic together while allowing shared access to the database and utility services.

```mermaid
graph TD
    User[User (Web/Mobile)] -->|HTTPS| LoadBalancer
    LoadBalancer --> Client App
    Client App -->|API Requests| API_Gateway[NestJS API Gateway]
    
    subgraph "Backend Services (NestJS Modules)"
        Auth[Auth Module]
        Inv[Inventory Module]
        Cost[Costing Module]
        Dash[Dashboard Module]
        Log[Logging & Notification]
    end
    
    API_Gateway --> Auth
    API_Gateway --> Inv
    API_Gateway --> Cost
    API_Gateway --> Dash
    API_Gateway --> Log
    
    Inv --> DB[(Database)]
    Cost --> DB
    Auth --> DB
    Log --> DB
```

### Module Breakdown

#### **A. Inventory Management (Per Day)**
1.  **Inward Module:**
    *   **Inputs:** Supplier Name, Batch Number, Total Bales, Packaging Weight.
    *   **Logic:** Creates a "Cotton Batch" entity.
2.  **Cotton Inventory:**
    *   **Function:** Tracks stock levels of raw cotton batches. Deducts on usage.
3.  **Mixing Module (Production Planning):**
    *   **Process:** Selects Cotton Batch -> Consumes Weight -> Produces Yarn + Waste.
    *   **Yarn Output:** Count sizes (2, 4, 6, 8, 10). Fixed Bag Size (60KG).
    *   **Logic:** `Total Produced / 60 = Full Bags`. `Remainder = Loose Log`.
    *   **Waste Breakdown:** Blow Room, Carding, OE, Others.
4.  **Yarn Inventory:**
    *   **Function:** Stores finished goods (Bags) by Count Size.
5.  **Outward Module:**
    *   **Inputs:** Customer, Vehicle No, Driver, Bag Quantity per Count.
    *   **Action:** Deducts from Yarn Inventory -> Generates Delivery Challan/Invoice.

#### **B. Costing Management (Per Day)**
1.  **EB (Electricity) Module:**
    *   **Inputs:** Start/End Reading OR Total Units, Generator Shifts.
    *   **Formula:** `(Units * Settings_Rate) + Fixed_Charges`.
2.  **Employee Module:**
    *   **Inputs:** Total Shifts, Headcount, Total Wages (Manual Entry).
3.  **Package Module:**
    *   **Logic:** Auto-calculated using daily production.
    *   **Formula:** `Total Yarn Produced (KG) * 1.6 INR` (Rate customizable in Settings).
4.  **Maintenance Module:**
    *   **Choice:** Manual Entry OR Formula.
    *   **Formula:** `Total Yarn Produced (KG) * 4 INR` (Rate customizable in Settings).
5.  **Expense Module:**
    *   **Inputs:** Asset Purchases (Computers, Machines), One-time costs.

#### **C. Dashboards**
1.  **Home Dashboard (Daily Snapshot):**
    *   **KPIs:** Today's Production (KG), Today's Cost (INR), Cost Per KG.
    *   **Charts:** Yarn Count Breakdown (Bar Chart), Waste Analysis (Pie Chart).
2.  **Module-Specific Dashboards:** Each module (Costing, Inventory) has its own historical trends and detailed tables.

---

## 4. Key Features for "Better Application" Experience

To ensure the application feels premium, secure, and robust:

### **1. Progressive Web App (PWA) Capabilities**
*   **Installable:** Users can "Add to Home Screen" on iOS/Android and Desktop. It launches like a native app (no browser bar).
*   **Offline Mode:** Cache critical assets so the app loads instantly even on poor connections.

### **2. Advanced Security & Session Management**
*   **Session Tracking:** Store `SessionID`, `IP`, `Location` (via IP-API), `Device`, and `LastActive` timestamps in a Redis instance or Database.
*   **Role-Based Access Control (RBAC):**
    *   **Admin:** Full access, User Management, Log Viewing.
    *   **Modifier:** Read/Write operational data. No Delete. No Logs.
    *   **Viewer:** Read-only dashboards.
*   **Admin Tools:** "Revoke Session" button to force-logout users.

### **3. Automated Reports & Notifications**
*   **Daily Summary Email:** A Scheduled Task (Cron Job) runs at 11:59 PM.
    *   Aggregates day's Production, Sales, and Costs.
    *   Sends a beautifully formatted HTML email to Admins.
*   **Forensic Logging:** Every CUD (Create/Update/Delete) action is logged: `Who`, `What`, `When`, `Old Value`, `New Value`.

### **4. Premium UX/UI**
*   **Glassmorphism:** Use translucent card backgrounds with blur effects.
*   **Micro-interactions:** Smooth transitions when data updates, buttons that "press" down.
*   **Skeleton Loading:** Show layout placeholders while fetching data instead of spinners.

---

## 5. Next Implementation Steps (Based on Roadmap)

You are currently in **Phase 1 (Critical Business Logic)**. Based on this architecture, proceed to:

1.  **Production Entry Update:** Finalize the logic for 60KG bags and Remainder Log.
2.  **Costing Logic:** Implement the auto-calculation triggers (when Production is saved -> Recalculate Packaging/Maintenance costs).
3.  **Dashboard:** Build the "Today's Summary" widget.
