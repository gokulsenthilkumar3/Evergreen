# Ever Green Yarn Management System - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Ensure Servers are Running
Both the API and Web servers should already be running:
- **API Server**: http://localhost:3001 ✅
- **Web Server**: http://localhost:3000 ✅

If not running, start them with:
```bash
# Terminal 1 - API
npm run dev -w apps/api

# Terminal 2 - Web
npm run dev -w apps/web
```

### Step 2: Login
1. Open http://localhost:3000 in your browser
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin123`

### Step 3: Explore Features

## 📱 Feature Tour

### 1. **Dashboard** (Home Page)
- View KPIs: Production, Stock, Waste
- Check recent notifications
- Monitor production trends

### 2. **Inventory Management**
- **Inventory History**: View historical data with charts
  - Filter by date range (Month, 3 Months, Year, All)
  - Tabs: Inward/Outward, Production, Cotton, Yarn, Waste
- **Inward / Batch Entry**: Add new stock
  - Enter invoice details
  - Add bales/bags with serial numbers
  - Auto-calculate totals
  - View recent entries

### 3. **Production**
- **Production Entry**: Record daily production
  - Cotton consumption (batch-wise)
  - Yarn output (count-wise: 30s, 40s, 60s)
  - Waste tracking
  - **Invisible loss** calculation
- **Mixing Planner**: Plan cotton blends
  - Set target weight and yarn count
  - Define mix percentages
  - Validate against available stock

### 4. **Costing**
- **Costing History**: View cost analytics
  - Cost breakdown pie charts
  - Daily trends
  - Cost per kg analysis
- **Costing Entry**: Record costs (4 tabs)
  - **EB (Electricity)**: Units, rate, charges
  - **Employee**: Shift-wise, overtime
  - **Packaging**: Bags, cones, labels
  - **Maintenance**: Machine-wise, downtime

### 5. **Billing**
- Create GST-compliant invoices
- Add multiple items (yarn counts)
- Auto-calculate CGST (9%) + SGST (9%)
- Track customer details and transport info
- View recent invoices

### 6. **Settings**
- Update company information
- Configure system settings
- Manage notifications and alerts

---

## 🎯 Common Workflows

### **Workflow 1: Receiving Cotton Stock**
1. Go to **Inward / Batch**
2. Fill invoice details (Date, Invoice No, Party, Item Type, Rate)
3. Add bales with serial numbers and weights
4. Click **Save Inward Entry**
5. View in **Inventory History** → Cotton Inventory tab

### **Workflow 2: Recording Production**
1. Go to **Production**
2. Select date
3. Add consumed cotton batches
4. Add produced yarn (count, bags, weight)
5. Enter waste weight
6. Review **Invisible Loss** calculation
7. Click **Save Production**

### **Workflow 3: Planning a Mix**
1. Go to **Mixing Planner**
2. Enter target weight and yarn count
3. Add cotton types with percentages (must total 100%)
4. Enter available stock for each type
5. Click **Calculate Mix**
6. Check feasibility status

### **Workflow 4: Creating an Invoice**
1. Go to **Billing**
2. Enter invoice number and customer details
3. Add items (yarn count, bags, weight, rate)
4. Review auto-calculated GST
5. Enter transport details
6. Click **Save Invoice**

### **Workflow 5: Tracking Costs**
1. Go to **Costing Entry**
2. Select appropriate tab (EB/Employee/Packaging/Maintenance)
3. Fill in the details
4. Review calculated total
5. Click **Save**
6. View trends in **Costing History**

---

## 📊 Understanding Key Metrics

### **Production Metrics**
- **Invisible Loss**: Difference between input and (output + waste)
  - Formula: `Input - (Yarn + Waste)`
  - Indicates process efficiency
  - Typical range: 1-3%

### **Cost Metrics**
- **Cost per Kg**: Total costs divided by production
  - Helps in pricing decisions
  - Track trends over time

### **Inventory Metrics**
- **Current Stock**: Real-time inventory levels
- **Inward vs Outward**: Material flow tracking
- **Waste %**: Waste as percentage of input

---

## 🎨 UI Tips

### **Charts & Filters**
- All charts are **interactive** - hover for details
- Use **date range filters** to zoom in/out
- **Tabs** organize related data

### **Forms**
- **Add/Remove rows** dynamically in tables
- **Auto-calculations** update in real-time
- **Validation** prevents invalid entries
- **Notifications** confirm actions

### **Navigation**
- **Sidebar** shows all modules
- **Active page** highlighted in green
- **Collapsible** for more screen space

---

## 🔍 Data Notes

### **Current Implementation**
- All data is stored **in-memory** (mock storage)
- Data **persists** during server runtime
- Data **resets** when server restarts

### **For Production Use**
- Connect to PostgreSQL database
- Prisma ORM is already configured
- Run migrations to create tables
- Update controllers to use database

---

## 🛠️ Troubleshooting

### **Issue: Cannot login**
- Ensure API server is running on port 3001
- Check browser console for errors
- Try clearing localStorage

### **Issue: Charts not showing**
- Check date range filter
- Ensure there's data for selected period
- Refresh the page

### **Issue: Form not submitting**
- Check for validation errors (red text)
- Ensure required fields are filled
- Check browser console

### **Issue: Server not starting**
- Check if ports 3000/3001 are available
- Run `npm install` to ensure dependencies
- Check terminal for error messages

---

## 📚 Additional Resources

- **Full Documentation**: `IMPLEMENTATION_COMPLETE.md`
- **Feature List**: `FEATURE_SUMMARY.md`
- **Implementation Plan**: `implementation_plan.md`

---

## 🎉 You're All Set!

The Ever Green Yarn Management System is fully functional and ready to use.

**Happy Managing! 🧵**
