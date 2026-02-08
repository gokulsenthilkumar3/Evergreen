# 🎯 Detailed Requirements Implementation Roadmap

## Current Status vs Requirements

### ✅ **Already Implemented (80% Complete)**
The system has most core functionality but needs alignment with exact specifications.

### 🔧 **Critical Adjustments Needed**

#### **1. Yarn Count System** (HIGH PRIORITY)
**Current**: Uses "30s", "40s", "60s" notation
**Required**: Use count sizes 2, 4, 6, 8, 10

**Files to Update**:
- `apps/web/src/pages/ProductionEntry.tsx` (lines 193-195)
- `apps/web/src/pages/MixingPlanner.tsx`
- `apps/web/src/pages/Billing.tsx`
- `apps/web/src/pages/InventoryHistory.tsx`
- All mock data generators in backend

**Action**: Replace all yarn count dropdowns and references

---

#### **2. Bag Weight & Log System** (HIGH PRIORITY)
**Current**: Variable bag weights
**Required**: Fixed 60 KG per bag + remaining log tracking

**Logic**:
```
Total Yarn = 239 KG
Bags = floor(239 / 60) = 3 bags
Remaining Log = 239 % 60 = 59 KG
```

**Files to Update**:
- `apps/web/src/pages/ProductionEntry.tsx` - Add auto-calculation
- Backend production controller - Store log value

---

#### **3. Waste Type Breakdown** (HIGH PRIORITY)
**Current**: Single waste field
**Required**: 4 waste types (Blow room, Carding, OE, Others)

**New Interface**:
```typescript
interface WasteBreakdown {
  blowRoom: number;
  carding: number;
  oe: number;
  others: number;
  total: number; // auto-calculated
}
```

**Files to Update**:
- `apps/web/src/pages/ProductionEntry.tsx` - Add 4 waste fields
- Backend - Update production model

---

#### **4. Package Module Auto-Calculation** (HIGH PRIORITY)
**Current**: Manual entry
**Required**: Auto-calculate from yarn production

**Formula**: `Package Cost = Total Yarn KG × 1.6 INR`

**Implementation**:
- Remove manual entry for packaging in CostingEntry
- Auto-calculate based on daily yarn production
- Make 1.6 INR customizable in Settings

---

#### **5. Maintenance Module Formula** (HIGH PRIORITY)
**Current**: Manual entry
**Required**: Formula-based calculation

**Formula**: `Maintenance Cost = Total Yarn KG × 4 INR`

**Implementation**:
- Update CostingEntry.tsx maintenance tab
- Auto-calculate based on yarn production
- Make 4 INR customizable in Settings

---

#### **6. EB Module Adjustments** (MEDIUM PRIORITY)
**Current**: Units × rate + fixed charges
**Required**: Units × 10 INR (customizable) + shifts tracking

**Changes**:
- Simplify to: Units × Rate (default 10 INR)
- Add "Number of shifts per day" field
- Make rate customizable in Settings

---

#### **7. Dashboard 1-Day View** (HIGH PRIORITY)
**Current**: General KPIs
**Required**: Prominent 1-DAY totals

**New Dashboard Layout**:
```
┌─────────────────────────────────────┐
│  TODAY'S SUMMARY (Prominent)        │
│  - Total Cost: ₹X                   │
│  - Total Yarn Production: X KG      │
│  - Per Count Breakdown:             │
│    • Count 2: X bags, X KG          │
│    • Count 4: X bags, X KG          │
│    • Count 6: X bags, X KG          │
│    • Count 8: X bags, X KG          │
│    • Count 10: X bags, X KG         │
└─────────────────────────────────────┘
```

---

#### **8. User Role System** (MEDIUM PRIORITY)
**Required Roles**:
- **Viewer**: Read-only access
- **Modifier**: CRUD (Create, Read, Update, Delete)
- **Author (Admin)**: Full CRUD + User Management

**Implementation**:
1. Create User model with role field
2. Add role-based middleware
3. Update frontend to hide/disable actions based on role
4. Add user management page for Admin

**Files to Create/Update**:
- `apps/api/src/modules/users/` - New module
- `apps/api/src/guards/roles.guard.ts` - Role guard
- `apps/web/src/pages/UserManagement.tsx` - Admin page
- Update all pages to check user role

---

#### **9. Session Management Enhancement** (MEDIUM PRIORITY)
**Current**: Basic JWT
**Required**: IP, Location, Device tracking + Revoke capability

**New Session Model**:
```typescript
interface Session {
  id: string;
  userId: string;
  username: string;
  deviceIP: string;
  location: string; // City, Country
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
  active: boolean;
}
```

**Implementation**:
- Capture IP from request headers
- Use IP geolocation API for location
- Store all sessions in database
- Add session management page for Admin
- Add "Revoke Session" button

---

#### **10. Multi-Factor Authentication** (LOW PRIORITY)
**Required**:
- Passkey (WebAuthn)
- Authenticator App (TOTP)

**Implementation**:
- Install `@simplewebauthn/server` and `@simplewebauthn/browser`
- Install `otplib` for TOTP
- Add MFA setup page
- Update login flow to check for MFA

---

#### **11. Email Notifications** (LOW PRIORITY)
**Required**: Daily summary email to admin

**Implementation**:
- Install `nodemailer`
- Create email templates
- Add cron job for daily summary
- Send email with:
  - Total production
  - Total costs
  - Stock levels
  - Alerts

---

#### **12. Settings Customization** (HIGH PRIORITY)
**Required Customizable Values**:
- EB Rate (default: 10 INR per unit)
- Package Rate (default: 1.6 INR per KG)
- Maintenance Rate (default: 4 INR per KG)

**Implementation**:
- Add these fields to Settings page
- Store in database/localStorage
- Use in calculations across the app

---

## 📅 Implementation Priority

### **Phase 1: Critical Business Logic** (Do First)
1. ✅ Fix yarn counts (2, 4, 6, 8, 10)
2. ✅ Add 60 KG bag logic + remaining log
3. ✅ Add waste type breakdown
4. ✅ Auto-calculate Package cost
5. ✅ Auto-calculate Maintenance cost
6. ✅ Update Dashboard for 1-day view
7. ✅ Add customizable rates in Settings

### **Phase 2: User Management** (Do Second)
8. ⏳ Implement user roles
9. ⏳ Add role-based permissions
10. ⏳ Create user management page

### **Phase 3: Session & Security** (Do Third)
11. ⏳ Enhance session tracking (IP, location)
12. ⏳ Add session management page
13. ⏳ Implement session revoke

### **Phase 4: Advanced Auth** (Do Last)
14. ⏳ Add Passkey authentication
15. ⏳ Add TOTP authenticator
16. ⏳ Implement email notifications

---

## 🚀 Immediate Actions

I will now implement **Phase 1** (Critical Business Logic) which includes:

1. Update all yarn count references to 2, 4, 6, 8, 10
2. Add 60 KG bag calculation with remaining log
3. Add waste type breakdown (4 fields)
4. Implement auto-calculation for Package and Maintenance
5. Create 1-day dashboard view
6. Add customizable rates to Settings

This will ensure the core business logic matches your exact requirements.

---

**Estimated Time**: 
- Phase 1: ~2 hours
- Phase 2: ~3 hours  
- Phase 3: ~2 hours
- Phase 4: ~4 hours

**Total**: ~11 hours for complete implementation

Let's begin with Phase 1!
