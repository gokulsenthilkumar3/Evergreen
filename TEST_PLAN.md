# EverGreen — Comprehensive Test Plan

**Application:** EverGreen Yarn Management System  
**Version:** 1.0  
**Date:** 2026-02-20  
**Scope:** Frontend UI Validation, Backend Business Logic, Boundary Value Analysis, Integration, and Security Testing

---

## Table of Contents
1. [Test Scope & Approach](#1-test-scope--approach)
2. [Module: Authentication](#2-module-authentication)
3. [Module: Inward Batch Entry](#3-module-inward-batch-entry)
4. [Module: Production Entry](#4-module-production-entry)
5. [Module: Outward / Sales Entry](#5-module-outward--sales-entry)
6. [Module: Inventory Ledger](#6-module-inventory-ledger)
7. [Module: Costing](#7-module-costing)
8. [Module: Billing / Invoicing](#8-module-billing--invoicing)
9. [Module: Settings](#9-module-settings)
10. [Module: User Management](#10-module-user-management)
11. [Cross-Module: Dashboard & KPIs](#11-cross-module-dashboard--kpis)
12. [Non-Functional Testing](#12-non-functional-testing)
13. [Boundary Value Analysis (BVA) Summary Table](#13-boundary-value-analysis-bva-summary-table)
14. [Business Scenario Tests](#14-business-scenario-tests)

---

## 1. Test Scope & Approach

### 1.1 Testing Levels
- **Unit Testing** – Individual functions (calculations, formatters)
- **Component Testing** – Individual React components in isolation
- **Integration Testing** – API + DB interactions
- **End-to-End Testing** – Full user flows
- **Security Testing** – Auth, RBAC, input injection

### 1.2 Roles Under Test
| Role | Permissions |
|------|-------------|
| AUTHOR | Full access: create, edit, delete, manage users |
| MODIFIER | Create + Edit only. No delete, no user management |
| VIEWER | Read-only |

### 1.3 Test Environment
- **API:** http://localhost:3001
- **Web:** http://localhost:3000
- **DB:** SQLite via Prisma (file-based) 

---

## 2. Module: Authentication

### 2.1 Functional Tests
| ID | Test Case | Input | Expected Output | Actual | Status |
|----|-----------|-------|-----------------|--------|--------|
| AUTH-01 | Valid login | username: `author`, pw: `author123` | Redirected to Dashboard, user avatar shown | | |
| AUTH-02 | Invalid password | username: `author`, pw: `wrongpassword` | Error toast: "Invalid credentials" | | |
| AUTH-03 | Empty username | username: ``, pw: `author123` | Error: Username required | | |
| AUTH-04 | Empty password | username: `author`, pw: `` | Error: Password required | | |
| AUTH-05 | Non-existent user | username: `ghost`, pw: `anything` | Error toast: "Invalid credentials" | | |
| AUTH-06 | Session persistence | Login, refresh page | User still logged in | | |
| AUTH-07 | Logout | Click avatar → Logout | Redirected to login page, localStorage cleared | | |
| AUTH-08 | Direct API without token | `GET /inventory/inward` (no header) | 401 Unauthorized | | |
| AUTH-09 | Case sensitivity | username: `AUTHOR` | Configurable — document behavior | | |

### 2.2 Boundary Value Analysis
| Field | Min | Max | Below Min | Above Max |
|-------|-----|-----|-----------|-----------|
| Username length | 3 chars | 50 chars | Rejected | Rejected |
| Password length | 6 chars | 100 chars | Rejected | Rejected |

### 2.3 Security Tests
| ID | Test Case | Expected |
|----|-----------|----------|
| SEC-01 | SQL Injection in login | `' OR '1'='1` → Rejected, no bypass |
| SEC-02 | XSS in username | `<script>alert(1)</script>` → Escaped, no execution |
| SEC-03 | VIEWER cannot access AUTHOR-only API | 403 Forbidden |

---

## 3. Module: Inward Batch Entry

### 3.1 Functional Tests
| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| INW-01 | Add valid batch | Date: today, Supplier: "ABC", Bale: 10, Kg: 1700 | Batch created, cotton inventory +1700kg |
| INW-02 | Batch ID auto-generated | Date: 2026-02-20 | Batch ID prefix = "202602" + 3 random alphanum |
| INW-03 | Custom Batch ID suffix | Overwrite suffix to "XYZ" | Batch saved with ID "202602XYZ" |
| INW-04 | Supplier from autocomplete | Type partial name | Suggestions from existing suppliers appear |
| INW-05 | New supplier (free-text) | Enter new supplier name | Accepted and saved |
| INW-06 | Delete batch | Click delete on a batch | Batch removed, cotton inventory recalculated |
| INW-07 | Delete batch (VIEWER role) | Attempt delete | Delete button not visible |
| INW-08 | Date filter - Today | Filter: Today | Only today's batches |
| INW-09 | Date filter - Custom | From: 2026-01-01, To: 2026-01-31 | Only January batches |
| INW-10 | Export PDF | Click PDF export | PDF downloaded with all history |
| INW-11 | Export Excel | Click Excel | XLSX file downloaded |
| INW-12 | Missing supplier | Submit with empty supplier | Error: "Please fill in all required fields" |

### 3.2 Boundary Value Analysis
| Field | Min Valid | Max Valid | Below Min | Above Max | Notes |
|-------|-----------|-----------|-----------|-----------|-------|
| Bale count | 1 | 9999 | Error: must be > 0 | Warn: unusually high | Integer only |
| Weight (kg) | 0.01 | 999,999 | Error: must be > 0 | Warn: unusually high | Avg bale ≈ 170kg |
| Date | 2000-01-01 | Today | Rejected if future | — | No future inward |
| Batch Suffix | 3 chars | 3 chars | Auto-padded | Truncated to 3 | Alphanumeric only |

### 3.3 Business Rules
- **BR-INW-01:** Batch ID must be unique. Duplicate IDs must be rejected.
- **BR-INW-02:** Every inward batch creates a corresponding CottonInventory ledger entry.
- **BR-INW-03:** Batch deletion recalculates all subsequent CottonInventory balances.
- **BR-INW-04:** Average bale weight (Kg/Bale) informs the dashboard Cotton Bales KPI.

### 3.4 Negative Tests
| ID | Scenario | Expected |
|----|----------|----------|
| INW-N01 | Bales = 0 | Rejected |
| INW-N02 | Kg = 0 | Rejected |
| INW-N03 | Bale count > Kg (e.g., 100 bales, 10 kg) | Should warn: avg bale weight < 1kg |
| INW-N04 | Future date | Should reject or warn |
| INW-N05 | Duplicate Batch ID | Rejected with error message |

---

## 4. Module: Production Entry

### 4.1 Functional Tests
| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| PRD-01 | Add valid production | Batch: valid, Consumed: 1000kg. Yarn: 930kg, Waste: 70kg | Saved. Cotton−1000, Yarn+930, Waste+70 |
| PRD-02 | Multi-batch consumption | 2 batches used | Both batches deducted, totals correct |
| PRD-03 | Multi-count yarn | Count 4: 500kg, Count 6: 430kg | Both yarn counts updated |
| PRD-04 | Balance check passes | Input = Output + Waste + Intermediate | Save button enabled |
| PRD-05 | Balance check fails | Input ≠ Output + Waste + Intermediate | Error: "Material balance mismatch: X kg" |
| PRD-06 | Intermediate material | Intermediate: 50kg | Saved, balance = 0 |
| PRD-07 | Step 1 validation | No batch selected | Cannot proceed to Step 2 |
| PRD-08 | Delete production | Delete an entry | All inventory balances recalculated |
| PRD-09 | Export | PDF/Excel | Report generated |
| PRD-10 | Yarn count not in stock | Count entered not in existing stock | Dropdown shows existing counts |

### 4.2 Boundary Value Analysis
| Field | Min Valid | Max Valid | Below Min | Above Max |
|-------|-----------|-----------|-----------|-----------|
| Consumed Bale | 1 | batch.bale | 0 → Error | > batch.bale → Error: "exceeds available" |
| Consumed Weight | 0.01 | batch.kg (remaining) | 0 → Error | > remaining → Error |
| Yarn produced | 0.01 | Total Consumed | 0 (not enough) | > Input → Balance mismatch |
| Waste values | 0 | Total Consumed | Negative → Rejected | > Input → Balance mismatch |
| Intermediate | 0 | Total Consumed | Negative → Reject | > Input → Balance fail |
| Balance tolerance | 0 | 0.01 kg | > 0.01 → ERROR | — | Floating point tolerance |

### 4.3 Business Rules
- **BR-PRD-01:** Sum(Yarn) + Sum(Waste) + Intermediate = Total Consumed ± 0.01 kg
- **BR-PRD-02:** Batch consumption cannot exceed the batch's remaining balance
- **BR-PRD-03:** Efficiency = (Produced / Consumed) × 100. Should be between 80–95% for healthy production
- **BR-PRD-04:** Waste breakdown: BlowRoom + Carding + OE + Others = Total Waste
- **BR-PRD-05:** Production date cannot be in the future

### 4.4 Negative Tests
| ID | Scenario | Expected |
|----|----------|----------|
| PRD-N01 | Over-consume a batch (weight > remaining) | Rejected with max value error |
| PRD-N02 | Yarn weight = 0 but save attempted | Error: no valid yarn items |
| PRD-N03 | Negative waste value | Rejected (input type=number, min=0) |
| PRD-N04 | Same batch twice in consumption list | Should aggregate or warn about total |
| PRD-N05 | Balance mismatch of 0.2kg | Error toast with exact mismatch |

---

## 5. Module: Outward / Sales Entry

### 5.1 Functional Tests
| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| OUT-01 | Valid outward | Customer: ABC, Vehicle: TN01AB1234, 10 bags count 4 | Yarn inventory -600kg |
| OUT-02 | Vehicle format validation | TN 01 AB 1234 (with spaces) | Accepted |
| OUT-03 | Invalid vehicle format | XXXX-000 | Error: "Invalid Vehicle Number format" |
| OUT-04 | Date = today | Submit | Accepted |
| OUT-05 | Future date | Date: tomorrow | Error: "date cannot be in the future" |
| OUT-06 | Past date warning | Date: yesterday | Warning toast shown |
| OUT-07 | Insufficient stock | 100 bags, only 50 available | Error: "Insufficient stock for Count X" |
| OUT-08 | Duplicate count in items | Two rows with Count 4 | Error: "Duplicate yarn counts" |
| OUT-09 | Delete outward | Click delete | Yarn stock restored, ledger updated |
| OUT-10 | Date filter | This month | Only this month's outwards |
| OUT-11 | Export PDF | — | Report generated |
| OUT-12 | Auto-calculate weight | Bags = 5, Count 4 | Weight auto-set to 300kg (5 × 60) |

### 5.2 Boundary Value Analysis
| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| Bags | 1 | Stock available | 0 bags → Error |
| Weight | 60kg | Available stock (kg) | Auto-calculated, read-only |
| Customer Name | 2 chars | 100 chars | Empty → Rejected |
| Vehicle No | 8 chars | 13 chars | Invalid format → Rejected |
| Driver Name | 2 chars | 60 chars | Empty → Rejected |

### 5.3 Business Rules
- **BR-OUT-01:** Available stock MUST be verified before submission (frontend + backend checks)
- **BR-OUT-02:** Vehicle number must match Indian registration format
- **BR-OUT-03:** Weight = Bags × 60 (1 bag = 60 kg fixed)
- **BR-OUT-04:** Outward creates a negative yarn inventory entry

### 5.4 Negative Tests
| ID | Scenario | Expected |
|----|----------|----------|
| OUT-N01 | Vehicle: `TN01AB12345` (too long) | Error |
| OUT-N02 | Bags = 0 | Error: must be > 0 |
| OUT-N03 | Submit without any items | Error: at least one item required |
| OUT-N04 | Customer name = spaces only | Trimmed → treated as empty → Error |

---

## 6. Module: Inventory Ledger

### 6.1 Functional Tests
| ID | Test Case | Expected Output |
|----|-----------|-----------------|
| INV-01 | View cotton ledger | All inward/production debits shown with running balance |
| INV-02 | View yarn ledger by count | Filter by count shows only that count's movements |
| INV-03 | View waste ledger | Blow room, carding etc. shown |
| INV-04 | All history tab | Combined view, sortable |
| INV-05 | Date filter | Correct period filtered |
| INV-06 | KPI dashboard | Total Cotton, Total Yarn, Waste shown |
| INV-07 | Waste recycle | Waste → Cotton inventory, ledger updated |
| INV-08 | Balance continuity | Balance[n] = Balance[n-1] + Quantity[n] for all rows |

### 6.2 Business Rules
- **BR-INV-01:** Running balance must always equal the sum of all movements (no gaps)
- **BR-INV-02:** Negative balance should NOT be allowed (error if deduction > current stock)
- **BR-INV-03:** Waste export/recycle must update waste AND cotton/yarn ledgers atomically

### 6.3 Calculation Audit
| Test | Formula | Verification Method |
|------|---------|---------------------|
| Cotton balance | Sum(Inward kg) − Sum(Production consumed) | Query CottonInventory last balance |
| Yarn balance (per count) | Sum(Production produced count X) − Sum(Outward count X) | Query YarnInventory last balance |
| Waste balance | Sum(Production waste) − Sum(Waste exported/recycled) | Query WasteInventory last balance |

---

## 7. Module: Costing

### 7.1 Functional Tests
| ID | Test Case | Input | Expected |
|----|-----------|-------|----------|
| CST-01 | Add Electricity cost | Amount: 5000, kWh: 1200, EB rate: 5.5 | Saved, appears in history |
| CST-02 | Add Labor cost | Workers: 25, days: 26, rate: 500 | Total = 3,25,000 |
| CST-03 | Add Maintenance cost | Category: Mechanical, Amount: 2000 | Saved |
| CST-04 | Edit existing entry | Change amount | Updated in DB |
| CST-05 | Delete entry | AUTHOR role | Entry removed |
| CST-06 | Period summary | Select month | Total cost breakdown shown |
| CST-07 | Cost per kg | Total cost / Total production kg | Calculated correctly |

### 7.2 Boundary Value Analysis
| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| Amount (₹) | 0.01 | 99,99,999 | 0 → Error |
| kWh units | 1 | 9,999,999 | — |
| Workers | 1 | 999 | — |
| Working Days | 1 | 31 | Max = days in month |
| Rate | 0.01 | 99,999 | — |

### 7.3 Business Rules
- **BR-CST-01:** Electricity cost = Units × EB Rate (from Settings)
- **BR-CST-02:** Labor cost = Workers × Days × Rate per day
- **BR-CST-03:** Cost per kg = Total period cost / Period production kg

---

## 8. Module: Billing / Invoicing

### 8.1 Functional Tests
| ID | Test Case | Input | Expected |
|----|-----------|-------|----------|
| BIL-01 | Create invoice | Customer, items, GST | Invoice created, PDF printable |
| BIL-02 | Invoice number | — | Auto-generated, unique |
| BIL-03 | Add payment | Amount ≤ remaining | Status: Partial or Paid |
| BIL-04 | Overpayment | Amount > balance | Error: "Amount exceeds remaining balance" |
| BIL-05 | Full payment | Exact balance | Status: PAID |
| BIL-06 | GST calculation | Sub-total: 10000, GST: 18% | Tax: 1800, Total: 11800 |
| BIL-07 | Print invoice | Click Print | Print dialog opens |
| BIL-08 | Delete invoice | AUTHOR only | Invoice removed |
| BIL-09 | Filter by status | PENDING / PARTIAL / PAID | Correct invoices shown |

### 8.2 Boundary Value Analysis
| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| Invoice item weight (kg) | 0.01 | 99,999 | 0 → Error |
| Rate per kg | 0.01 | 9,999 | 0 → Error |
| GST % | 0 | 28 | Standard GST rates: 0, 5, 12, 18, 28 |
| Payment amount | 0.01 | Remaining balance | 0 → Error, > remaining → Error |

### 8.3 Business Rules
- **BR-BIL-01:** Invoice Total = (∑ Weight × Rate) + GST
- **BR-BIL-02:** Status = PENDING (0 paid), PARTIAL (partial paid), PAID (fully paid)
- **BR-BIL-03:** Payment can only be ≤ remaining amount
- **BR-BIL-04:** Multiple payments allowed per invoice until fully paid

---

## 9. Module: Settings

### 9.1 Functional Tests
| ID | Test Case | Expected |
|----|-----------|----------|
| SET-01 | Update company name | Reflected in AppBar and document title |
| SET-02 | Update admin email | Saved to DB |
| SET-03 | Upload logo | Logo displayed in AppBar |
| SET-04 | Save Rates & Defaults | EB Rate, Packaging Rate, GST% saved |
| SET-05 | View system logs | Logs show recent API activity |
| SET-06 | VIEWER cannot edit settings | Settings page read-only for VIEWERs |

### 9.2 Business Rules
- **BR-SET-01:** EB Rate set in Settings is the default for Costing electricity calculations
- **BR-SET-02:** GST % set in Settings is the default for new Billing invoices

---

## 10. Module: User Management

### 10.1 Functional Tests
| ID | Test Case | Expected |
|----|-----------|----------|
| USR-01 | Create user (AUTHOR) | User appears in list |
| USR-02 | Create user (MODIFIER role) | Can create batches but not delete |
| USR-03 | Create duplicate username | Error: "Username already taken" |
| USR-04 | MODIFIER attempts user creation | Option not visible / 403 |
| USR-05 | AUTHOR deletes user | User removed |
| USR-06 | Self-deletion prevention | Cannot delete own account |

### 10.2 Boundary Value Analysis
| Field | Min | Max |
|-------|-----|-----|
| Username | 3 chars | 50 chars |
| Password | 6 chars | 100 chars |

---

## 11. Cross-Module: Dashboard & KPIs

### 11.1 Data Accuracy Tests
| KPI | Formula | Verified Against |
|-----|---------|-----------------|
| Total Cotton | Sum(CottonInventory.balance) last per batch | Inventory > Cotton tab |
| Total Yarn (kg) | Sum(last balance per yarn count) | Inventory > Yarn tab |
| Period Production | Sum(Production.totalProduced WHERE date BETWEEN from AND to) | Production history |
| Period Waste | Sum(Production.totalWaste WHERE date in period) | Inventory > Waste tab |
| Cotton Bales | TotalCotton / AvgBaleWeight | Inward batch data |

### 11.2 Date Filter Tests
| Filter | From | To | Expected |
|--------|------|----|----------|
| Today | Today 00:00 | Today 23:59 | Same-day entries |
| This Week | Mon 00:00 | Sun 23:59 | Weekly data |
| This Month | 1st 00:00 | Last day 23:59 | Monthly |
| Custom | User input | User input | Custom range |

---

## 12. Non-Functional Testing

### 12.1 Performance
| Scenario | Acceptable Time | Notes |
|----------|-----------------|-------|
| Dashboard load | < 2 seconds | With 1000 records |
| Inventory ledger (1000+ rows) | < 3 seconds | With pagination |
| Batch creation | < 1 second | Single API call |
| Report generation (PDF) | < 5 seconds | |

### 12.2 Accessibility
| Check | Standard |
|-------|----------|
| Keyboard navigation | All forms tabable |
| Error messages | Announced to screen readers |
| Color contrast | WCAG AA (minimum 4.5:1) |
| Focus indicators | Visible on all interactive elements |

### 12.3 Responsiveness
| Viewport | Components to verify |
|----------|---------------------|
| 1920×1080 | Full layout, no overflow |
| 1366×768 | Sidebar collapses cleanly |
| 768×1024 (Tablet) | Forms usable |
| 375×812 (Mobile) | Critical info visible |

### 12.4 Browser Compatibility
| Browser | Expected |
|---------|----------|
| Chrome 120+ | Full support |
| Firefox 115+ | Full support |
| Edge 120+ | Full support |
| Safari 17+ | Test print functionality |

---

## 13. Boundary Value Analysis (BVA) Summary Table

| Module | Field | Min (Valid) | Min−1 (Invalid) | Max (Valid) | Max+1 (Invalid) |
|--------|-------|-------------|-----------------|-------------|-----------------|
| Inward | Bale | 1 | 0 | 9999 | 10000 |
| Inward | Weight (kg) | 0.01 | 0 | 999999 | 1000000 |
| Production | Consumed Wt | 0.01 | 0 | batch.remaining | batch.remaining+0.01 |
| Production | Produced Wt | 0.01 | 0 | Consumed total | Consumed+0.01 |
| Production | Balance diff | 0 | — | 0.01 (tolerance) | 0.02 → ERROR |
| Outward | Bags | 1 | 0 | floor(stock/60) | floor(stock/60)+1 |
| Outward | Date | 2000-01-01 | — | Today | Tomorrow |
| Billing | Payment | 0.01 | 0 | Remaining balance | Remaining+0.01 |
| Billing | GST % | 0 | -1 | 28 | 29 |
| Auth | Password | 6 chars | 5 chars | 100 chars | 101 chars |

---

## 14. Business Scenario Tests

### Scenario BS-01: Full Monthly Cycle
**Description:** Simulate one full month of operations.  
**Steps:**
1. Start of month: Add 5 inward batches (totaling 8,500 kg cotton)
2. Week 1: Add 3 production entries (7,000 kg consumed → 6,500 kg yarn, 500 kg waste)
3. Week 2: Add 2 outward entries (4,200 kg dispatched to 3 customers)
4. End of month: Add electricity costs, labor costs
5. Generate billing invoices for customers
6. Record payments received
7. View Dashboard for month summary

**Pass Criteria:**
- Cotton balance = 8,500 − 7,000 = 1,500 kg ✓
- Yarn balance = 6,500 − 4,200 = 2,300 kg ✓
- Waste = 500 kg ✓
- Invoice total = sum of outward weights × rates + GST ✓
- Efficiency ≈ (6,500 / 7,000) × 100 = 92.86% ✓

---

### Scenario BS-02: Stock Correction Flow
**Description:** An incorrect production entry was saved. Admin must correct it.  
**Steps:**
1. Production entry was saved with wrong yarn weight (1000kg instead of 900kg)
2. AUTHOR deletes the incorrect entry
3. Verify yarn and cotton balances are correctly restored
4. Add corrected production entry

**Pass Criteria:**
- After delete: Yarn balance reverts, ledger recalculated ✓
- After re-entry: All balances match expected values ✓

---

### Scenario BS-03: Waste Recycling
**Description:** Part of waste is recycled back into production.  
**Steps:**
1. 500 kg waste accumulated across multiple entries
2. Recycle 200 kg of waste back to cotton inventory
3. Use this new cotton stock in a production entry

**Pass Criteria:**
- Waste inventory: 500 − 200 = 300 kg ✓
- Cotton inventory: +200 kg from recycle ✓
- Production can now use recycled cotton ✓

---

### Scenario BS-04: Multi-Customer Billing Month
**Description:** 3 customers, different yarn counts, multiple shipments.  
**Steps:**
1. Customer A: 2 outward entries (Count 4: 20 bags, Count 6: 15 bags)
2. Customer B: 1 outward entry (Count 2: 30 bags)
3. Customer C: 1 entry (Count 8: 10 bags)
4. Generate invoices for each customer with different rates per count
5. Customer A pays partially
6. Generate aging report (PENDING / PARTIAL / PAID filter)

**Pass Criteria:**
- 3 separate invoices generated ✓
- Customer A invoice = PARTIAL after payment ✓
- Total receivables = sum of unpaid invoices ✓

---

### Scenario BS-05: New Employee (MODIFIER) Onboarding
**Description:** New employee is given MODIFIER access.  
**Steps:**
1. AUTHOR creates new user `emp001` with MODIFIER role
2. `emp001` logs in
3. `emp001` adds an inward batch ✓
4. `emp001` adds a production entry ✓
5. `emp001` attempts to delete a batch → Button not visible ✓
6. `emp001` attempts to visit user management → Not visible ✓
7. `emp001` attempts to call DELETE API directly → 403 ✓

**Pass Criteria:**
- MODIFIER can create but not delete ✓
- No unauthorized access ✓

---

## Test Execution Checklist

Before each release, run through:

- [ ] AUTH-01 through AUTH-09
- [ ] INW-01 through INW-12, all negative tests
- [ ] PRD-01 through PRD-10, balance mismatch scenarios
- [ ] OUT-01 through OUT-12, stock validation
- [ ] INV-01 through INV-08, balance continuity check
- [ ] CST-01 through CST-07
- [ ] BIL-01 through BIL-09
- [ ] Business Scenarios BS-01 through BS-05
- [ ] Dashboard KPI accuracy check
- [ ] Performance benchmarks
- [ ] RBAC validation for all roles

---

*Document maintained by: Dev Team | Next review: Monthly or after major feature changes*
