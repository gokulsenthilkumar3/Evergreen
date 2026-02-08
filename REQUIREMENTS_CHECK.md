# Ever Green Yarn Management System - Revised Requirements

## ✅ Implementation Status Check

### Core Modules Alignment

#### **Inventory Management** (Per Day)
1. ✅ **Inward Module** - Implemented
   - Batch number, Supplier name, Total bales, Total KG ✅
   - Need to adjust: Ensure batch concept is clear

2. ✅ **Cotton Inventory Module** - Implemented
   - Acts as inventory for batches ✅

3. ⚠️ **Mixing Module (Production Planning)** - Needs Adjustment
   - Current: Yarn counts as 30s, 40s, 60s
   - **Required**: Yarn counts as 2, 4, 6, 8, 10
   - **Required**: Bag size fixed at 60 KG
   - **Required**: Waste types: Blow room, Carding, OE, Others
   - **Required**: Track remaining yarn log (not filling 60 KG bag)

4. ✅ **Yarn Inventory Module** - Implemented
   - Need to adjust: Yarn counts to 2, 4, 6, 8, 10

5. ⚠️ **Outward Module** - Partially Implemented (as Billing)
   - Need to add: Vehicle no, Driver name
   - Current: Has customer name, items ✅

#### **Accounting (Costing Management)** (Per Day)
1. ⚠️ **EB Module** - Needs Formula Adjustment
   - **Required**: Units × 10 INR (customizable in settings)
   - Current: Units × rate + fixed charges ✅
   - Need: Number of shifts per day

2. ⚠️ **Employee Module** - Needs Adjustment
   - **Required**: Total shifts, number of employees, total cost (manual)
   - Current: Has shift tracking ✅

3. ❌ **Package Module** - Needs Implementation
   - **Required**: Auto-calculate based on yarn production
   - **Formula**: Total Yarn KG × 1.6 INR (customizable)
   - Current: Manual entry only

4. ❌ **Maintenance Module** - Needs Formula Adjustment
   - **Required**: Maintenance cost × Total yarn produced per day
   - **Formula**: Total Yarn KG × 4 INR (customizable)
   - Current: Manual entry ✅

5. ✅ **Expense Module** - Implemented
   - One-time investments ✅

#### **Dashboard Requirements**
- ⚠️ **Home Dashboard** - Needs Enhancement
  - **Required**: 1 DAY Total Cost / 1 DAY Total Yarn Production in KG
  - **Required**: Per yarn count size breakdown
  - **Required**: Yarn bags count
  - Current: Has KPIs but not 1-day specific

#### **User Management**
- ❌ **User Roles** - Not Implemented
  - Required: Viewer (Read only)
  - Required: Modifier (CRUD except delete)
  - Required: Author/Admin (Full CRUD)
  - Current: Basic JWT auth only

#### **Session Management**
- ⚠️ **Session Logs** - Partially Implemented
  - Required: Device IP, username, location, timestamp
  - Required: Revoke capability for admin
  - Current: Basic audit logging ✅

#### **Authentication**
- ⚠️ **Multi-factor Auth** - Not Implemented
  - Required: Passkey support
  - Required: Authenticator app (TOTP)
  - Current: Username/password only ✅

#### **Additional Features**
- ❌ **Email Notifications** - Not Implemented
  - Required: Daily summary to admin email
- ⚠️ **Settings Page** - Partially Implemented
  - Required: Customize EB rate (10 INR)
  - Required: Customize Package rate (1.6 INR)
  - Required: Customize Maintenance rate (4 INR)
  - Current: Basic settings ✅

---

## 🎯 Priority Fixes

### **High Priority** (Core Business Logic)
1. Fix yarn count sizes (2, 4, 6, 8, 10)
2. Fix bag weight to 60 KG
3. Add waste types (Blow room, Carding, OE, Others)
4. Implement Package Module auto-calculation
5. Fix Maintenance Module formula
6. Enhance Dashboard for 1-day totals

### **Medium Priority** (User Management)
7. Implement user roles (Viewer, Modifier, Author)
8. Add role-based permissions
9. Enhance session logging with IP, location

### **Low Priority** (Advanced Features)
10. Add Passkey authentication
11. Add TOTP authenticator
12. Implement email notifications

---

## 📝 Action Plan

I will now implement these fixes in order of priority.
