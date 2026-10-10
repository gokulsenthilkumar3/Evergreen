# 📑 Tally Prime XML Integration Specification & Ledger Schema
**Target Standard:** Tally Prime (Release 1.0 through 4.x+) XML Voucher Import Protocol  
**Implementation File:** `apps/api/src/modules/integrations/tally/tally.service.ts`  
**API Endpoints:**
- `GET /integrations/tally/export` — Streamable `.xml` file attachment
- `GET /integrations/tally/summary` — JSON audit summary of voucher counts and preview

---

## 1. Architectural Philosophy: "Feed Tally, Never Replace It"

Textile accountants in India rely on Tally Prime for:
- Statutory balance sheet finalization.
- Form GSTR-1, GSTR-3B, and GSTR-2B reconciliation.
- Auditor sign-offs and chartered accountant review.

EverGreen OS / BaleTrust acts as the **factory-floor operational engine**. It captures weighbridge gross/tare weights, moisture deductions, spindle shift productions, and delivery challans, and transforms them into **canonical Tally Prime XML vouchers**. The accountant simply opens Tally Prime, goes to **Import -> Vouchers**, and selects the generated XML file.

---

## 2. Canonical `<ENVELOPE>` Document Structure

```xml
<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters &amp; Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Evergreen Spinning Mills</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <!-- VOUCHER 1: Raw Cotton Inward (Purchase) -->
        <!-- VOUCHER 2: Yarn Tax Invoice (Sales) -->
        <!-- VOUCHER 3: Customer Receipt (Receipt) -->
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
```

---

## 3. Voucher Types & Ledger Double-Entry Mapping

### 3.1 Raw Cotton Purchase Voucher (`Purchase`)
Triggered when an inward cotton bale batch is verified at the weighbridge.

| Ledger Account | Type | Debit / Credit | Tally Field | Notes |
|:---|:---|:---|:---|:---|
| **Supplier Creditor** *(e.g., Mahalakshmi Ginning Mill)* | Sundry Creditor | **Credit** (Payable) | `<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>2146437.50</AMOUNT>` | Total billable amount including GST |
| **Raw Cotton Purchases** | Purchase Account | **Debit** (Expense/Asset) | `<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-2044226.19</AMOUNT>` | Taxable value after moisture deduction |
| **Input CGST 2.5%** | Duties & Taxes | **Debit** (Input Credit) | `<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-51105.65</AMOUNT>` | CGST under HSN 5201 |
| **Input SGST 2.5%** | Duties & Taxes | **Debit** (Input Credit) | `<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-51105.65</AMOUNT>` | SGST under HSN 5201 |

#### XML Snippet:
```xml
<TALLYMESSAGE xmlns:UDF="TallyUDF">
  <VOUCHER VCHTYPE="Purchase" ACTION="Create" OBJVIEW="Accounting Voucher View">
    <DATE>20261010</DATE>
    <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
    <VOUCHERNUMBER>PUR-WB-20261010-9821</VOUCHERNUMBER>
    <REFERENCE>LOT-40S-9921</REFERENCE>
    <PARTYLEDGERNAME>Mahalakshmi Ginning Mill</PARTYLEDGERNAME>
    <NARRATION>Raw Cotton Bale Inward - Lot: LOT-40S-9921, Bales: 48, Net Wt: 10227.9 kg @ Rs.200/kg. Supplier: Mahalakshmi Ginning Mill. Moisture: 9.2% (Deducted 72.1 kg). Anti-Fraud Seal: A9B4C2D1.</NARRATION>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>Mahalakshmi Ginning Mill</LEDGERNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <AMOUNT>2147859.00</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>Raw Cotton Purchases</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <AMOUNT>-2045580.00</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>Input CGST 2.5%</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <AMOUNT>-51139.50</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>Input SGST 2.5%</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <AMOUNT>-51139.50</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
  </VOUCHER>
</TALLYMESSAGE>
```

---

### 3.2 Cotton Yarn Sales Voucher (`Sales`)
Triggered when a yarn tax invoice is generated for a knitting or weaving customer.

| Ledger Account | Type | Debit / Credit | Tally Field | Notes |
|:---|:---|:---|:---|:---|
| **Customer Debtor** *(e.g., Kongu Tex Knittings)* | Sundry Debtor | **Debit** (Receivable) | `<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-1522500.00</AMOUNT>` | Total invoice value |
| **Cotton Yarn Sales** | Sales Account | **Credit** (Revenue) | `<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>1450000.00</AMOUNT>` | Taxable amount (HSN 5205) |
| **Output CGST 2.5%** *(Intrastate)* | Duties & Taxes | **Credit** (Tax Liability) | `<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>36250.00</AMOUNT>` | 2.5% within Tamil Nadu |
| **Output SGST 2.5%** *(Intrastate)* | Duties & Taxes | **Credit** (Tax Liability) | `<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>36250.00</AMOUNT>` | 2.5% within Tamil Nadu |
| **Output IGST 5.0%** *(Interstate)* | Duties & Taxes | **Credit** (Tax Liability) | `<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>72500.00</AMOUNT>` | 5.0% to Tirupati / Surat / Ichalkaranji |

---

### 3.3 Customer Payment Receipt Voucher (`Receipt`)
Triggered when an incoming bank deposit (NEFT, RTGS, Cheque) is reconciled.

| Ledger Account | Type | Debit / Credit | Tally Field | Notes |
|:---|:---|:---|:---|:---|
| **Bank Account (Current)** | Bank Accounts | **Debit** (Asset) | `<ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-1450000.00</AMOUNT>` | Bank ledger receiving payment |
| **Customer Debtor** | Sundry Debtor | **Credit** (Asset Reduction) | `<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>1450000.00</AMOUNT>` | Clears customer outstanding |

---

## 4. Tally Import Execution Guide

1. In EverGreen OS, open the **Book-Ellam (எல்லாம் புத்தகம்)** register (`/book-ellam`).
2. Click **"Export Tally Prime XML"**.
3. Save the downloaded file: `Tally-Prime-Import-Evergreen_Spinning_Mills-2026-10-10.xml`.
4. Open **Tally Prime**:
   - Ensure the active company matches the company name in the XML header.
   - Press `Alt + O` (Import) -> select **Vouchers**.
   - Browse to the downloaded XML file and press `Enter`.
5. Tally imports all vouchers in 2 to 4 seconds, updating Day Book, Ledgers, and GST registers simultaneously.
