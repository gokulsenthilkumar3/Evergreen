# 📊 Executive Pitch Deck: BaleTrust / EverGreen TareZero Engine
**Audience:** Spinning Mill Owners, Managing Directors, and Head Accountants (Tirupur, Coimbatore, Karur)  
**Format:** 10 Slides (High-Impact, Direct Financial ROI)

---

## Slide 1: The Title & The One-Line Promise
### **TareZero by BaleTrust**
#### *Stop the Invisible Money Leaking at Your Weighbridge Gate*
* **Sub-headline:** The First Anti-Fraud Weighbridge, Moisture Deduction & Tally Prime Integration Engine Built Exclusively for Spinning Mills.
* **Presenters:** EverGreen Engineering Team (Field Office: Tirupur / Coimbatore)

---

## Slide 2: The Bleeding Neck Problem (The Reality of Raw Cotton)
### **Where Does a 25,000-Spindle Mill Lose ₹20+ Lakhs Every Year?**
1. **Tare Weight Discrepancies:** Truck drivers swap spare tires, modify fuel tanks, or manipulate manual tare entries in the register.
2. **Moisture Overcharges:** Raw cotton Shankar-6 arrived at 9.4% moisture instead of the standard 8.5% regain base. An operator manually guessing the deduction costs the mill ₹18,000 on a single 10-tonne truck.
3. **Double Entry Chaos:** Accountants spend 2 to 3 hours every evening manually re-keying gate weight slips into Tally purchase vouchers—introducing human calculation errors.
4. **Missing Invoices:** Dispatch delivery challans go out without an invoice being raised within 7 days, locking up lakhs in untracked working capital.

---

## Slide 3: The Hard Math of a Single Cotton Truck
### **Every Truckload is ₹20 Lakhs of Risk**
* **Gross Truck Weight:** 14,500 kg
* **Truck Tare Weight:** 4,200 kg
* **Actual Net Cotton:** 10,300 kg
* **Lab Moisture Reading:** 9.2% (Excess: +0.7% over 8.5% SIMA standard)
* **Required Moisture Deduction:** 72.1 kg
* **Financial Loss If Missed (at ₹210/kg):** **₹15,141 per truckload**
* **Monthly Volume:** 80 to 120 trucks
* **Annual Unrecovered Leakage:** **₹14.5 Lakhs to ₹21.8 Lakhs**

---

## Slide 4: Our P0 Solution: The TareZero Engine
### **Hardware-Locked Truth at the Mill Gate**
* **Direct Serial Port Listener (RS-232 / RS-485):** Connects to your existing Avery Weigh-Tronix, Essae-Teraoka, or Mettler Toledo indicator.
* **Zero Manual Override:** Weight frames are pulled directly from hardware. Operators cannot type arbitrary weights.
* **Instant Moisture Deduction Calculation:** Automated application of SIMA/CCI formulas based on digital moisture meter readings (MCU-5, KETT).
* **Cryptographic Verification Seal (HMAC-SHA256):** Every printed slip gets an un-forgeable 8-character cryptographic seal. If the printed slip doesn't match the database, fraud is caught immediately.

---

## Slide 5: The Thermal Barcode & QR Lot Identification
### **Complete Traceability from Bale to Blowroom**
* **High-Speed Thermal Labels:** Generates standard TSPL/ZPL barcode stickers on TSC and Zebra printers in 1.2 seconds.
* **Label Contents:** Lot Number, Ginning Supplier Name, Net Billable Weight (kg), Moisture %, and Security Seal.
* **Floor Validation:** Scanning the bale tag at the blowroom mixing floor verifies lot purity and eliminates cotton contamination.

---

## Slide 6: The Tally Prime Bridge (We Don't Replace Tally, We Power It)
### **1-Click XML Export: Zero Double Entry for Your Accountant**
* **The Accountant's Dream:** Click **"Export Tally Prime XML"** in the Book-Ellam register.
* **Canonical Tally Envelope:** Automatically creates:
  - **Purchase Vouchers:** Raw Cotton Inward mapped to Supplier Sundry Creditors, Input CGST 2.5%, and Input SGST 2.5%.
  - **Sales Vouchers:** Yarn Tax Invoices mapped to Knitter/Weaver Debtors, HSN 5205, Output CGST/SGST/IGST.
  - **Receipt Vouchers:** Bank NEFT/RTGS collections mapped to customer accounts.
* **Time Saved:** 15+ accountant hours per week saved with zero transcription errors.

---

## Slide 7: Cash-Flow Protection: The Missing Invoice Alert
### **Never Let a Delivery Challan Age Without an Invoice**
* **The Leak:** A vehicle leaves the gate with 100 bags of 40s Combed yarn on a delivery challan. The accounts desk forgets to generate the GST tax invoice.
* **The Dashboard Alert:** Automatic amber warning flags all delivery challans older than 7 days lacking an invoice.
* **1-Click Conversion:** Turn the delivery challan into a compliant GST tax invoice with e-Way bill mapping in one click.

---

## Slide 8: Automated WhatsApp Collections (Tamil + English)
### **Accelerate Working Capital with Zero Awkward Phone Calls**
* **Automated Bi-Monthly Statements:** Sent on the 1st and 15th directly to knitting and weaving unit owners.
* **Native Tamil Wording:**
  > *"வணக்கம் Kongu Tex, Ever Green மில்லில் இருந்து தங்களின் தற்போதைய நூல் நிலுவைத் தொகை ₹14,50,000. NEFT மூலம் செலுத்தி விவரங்களை பகிரவும்."*
* **1-Click WhatsApp Deep Link:** Direct `wa.me` links allow the mill owner or accountant to send verified ledger balance PDFs with payment dispute options (`OK` or `DISPUTE`).

---

## Slide 9: Total Data Sovereignty & Security
### **Your Costing and Production Data Never Leaks to Competitors**
* **Dual-Plane Architecture:** 100% database isolation. Your mill data lives in an isolated SQLite/PostgreSQL database instance.
* **Bank-Grade Field Encryption:** All sensitive vendor rates, GSTIN keys, and passwords are encrypted using AES-256-GCM.
* **Flexible Deployment:** Runs on your local factory Windows PC/server or dedicated secure Google Cloud (GCP) Indian data center.

---

## Slide 10: The Pilot Proposal: Zero Risk, Guaranteed ROI
### **The 30-Day TEA / SIMA Cluster Trial**
* **Our Commitment:**
  - We install the RS-232 weighbridge agent and TSC label printer on your gate PC within 2 hours.
  - We configure your Tally Prime company chart of accounts.
  - We run in parallel with your physical register for 30 days.
* **The Guarantee:**
  - If TareZero does not catch at least **₹1 Lakh in moisture/tare leakage** and save your accountant 20+ hours in month one, you pay **₹0**.
* **Contact:**
  - Phone: `+91 98421 XXXXX` (Tamil & English On-Ground Support)
  - Web: `https://evergreenos.in`
