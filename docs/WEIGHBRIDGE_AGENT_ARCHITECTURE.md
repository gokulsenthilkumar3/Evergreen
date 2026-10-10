# ⚖️ Weighbridge Hardware Agent Architecture & Anti-Tamper Specification
**Package:** `apps/weighbridge-agent`  
**Target Hardware:** Industrial Weighbridge Indicators (Avery, Essae, Mettler) & Digital Moisture Meters (MCU-5, KETT)  
**Host Environment:** Windows 10/11 Gate PC (Connected via RS-232 COM Port / USB-to-Serial FTDI)

---

## 1. System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WEIGHBRIDGE GATE TOPOLOGY                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ Avery / Essae Indicator ]            [ Digital Moisture Meter ]    │
│         (RS-232 / COM1)                       (RS-232 / COM2)          │
│                │                                     │                 │
│                ▼                                     ▼                 │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │               EverGreen TareZero Hardware Agent              │     │
│   │                    (Node.js / TypeScript)                    │     │
│   ├──────────────────────────────────────────────────────────────┤     │
│   │ 1. Streaming Protocol Parser (ST,GS,+14520kg)                │     │
│   │ 2. SIMA / CCI Moisture Deduction Engine (8.5% Standard Base) │     │
│   │ 3. Cryptographic HMAC-SHA256 Anti-Fraud Sealer               │     │
│   │ 4. Offline SQLite Buffer (Queue when factory Wi-Fi drops)    │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│            ┌─────────────────────┴─────────────────────┐               │
│            ▼                                           ▼               │
│   [ Thermal Barcode Printer ]             [ EverGreen Tenant Cloud API ]│
│   (TSC / Zebra via TSPL/ZPL)              (REST /inventory/inward/sync) │
│   Prints 2"x1" Bale / Lot Sticker         Generates Inward Batch & Lot  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Supported Indicator Hardware Protocols

The agent runs continuous streaming parsers that read raw ASCII byte frames from standard 9600 baud serial connections:

### 2.1 Avery Weigh-Tronix (E1205 / ZM Series)
* **Frame Structure:** `<CR><LF>ST,GS,+014520kg<CR><LF>`
* **Status Flags:** `ST` (Stable), `US` (Unstable), `GS` (Gross), `NT` (Net)
* **Regex Engine:** `/ST,GS,\+?0*(\d+(?:\.\d+)?)\s*kg/i`
* **Anti-Cheat Rule:** Weight is rejected if indicator status is `US` (unstable).

### 2.2 Essae-Teraoka (DS-215 / DS-415 Series)
* **Frame Structure:** `<STX>+014520<ETX>` or `+014520 kg G`
* **Regex Engine:** `/(?:\+|-)?0*(\d{4,6})\s*(?:kg)?\s*[G|N]?/i`

### 2.3 Mettler-Toledo (SICS Standard Interface)
* **Command Sent:** `S\r\n` (Send stable weight)
* **Frame Received:** `S S     14520.00 kg\r\n`
* **Regex Engine:** `/S\s+S\s+(\d+(?:\.\d+)?)\s*kg/i`

---

## 3. Cotton Moisture Deduction Calculations (SIMA / CCI Standard)

Cotton in Southern India is traded on an **8.5% standard moisture regain basis** (Southern India Mills' Association standard).

$$\text{Net Weight} = \text{Gross Weight} - \text{Tare Weight}$$

$$\text{Excess Moisture \%} = \max(0, \text{Measured Moisture \%} - 8.5\%)$$

$$\text{Moisture Deduction (kg)} = \frac{\text{Net Weight} \times \text{Excess Moisture \%}}{100}$$

$$\text{Final Billable Weight (kg)} = \text{Net Weight} - \text{Moisture Deduction (kg)}$$

### Example Calculation:
* Gross Weight: 14,500 kg
* Tare Weight: 4,200 kg
* Net Weight: 10,300 kg
* Moisture Meter: 9.2%
* Excess: $9.2 - 8.5 = 0.7\%$
* Deduction: $10,300 \times 0.007 = 72.10\text{ kg}$
* Final Billable Weight: **10,227.90 kg**
* **Financial Recovery at ₹200/kg:** **₹14,420 saved on this single truckload.**

---

## 4. Cryptographic Anti-Tamper Sealing (HMAC-SHA256)

To prevent mill gate operators from manually doctoring the paper slip or overriding numbers:
1. Every gate PC holds a unique device secret key provisioned during hardware pairing.
2. The agent generates a cryptographic HMAC-SHA256 hash across:
   `deviceSerial:comPort:grossKg:tareKg:moisturePercent:finalBillableKg:timestamp`
3. The first 8 hexadecimal characters are formatted as an uppercase security seal: `A9B4C2D1`.
4. The seal is printed as a QR code and printed code on the paper weighment slip.
5. When the truck arrives at the godown, the unloading supervisor scans the QR code; the EverGreen mobile app recomputes the HMAC hash against the server secret to verify zero tampering.

---

## 5. Thermal Barcode Label Generation (TSPL / ZPL)

The agent talks directly to factory USB/Ethernet thermal barcode printers (TSC TTP-244 Pro, Zebra ZD220):

### TSPL Command Structure (TSC Printers, 203 DPI):
```ts
SIZE 50 mm, 25 mm
GAP 2 mm, 0 mm
DIRECTION 1
CLS
TEXT 20, 20, "3", 0, 1, 1, "EVERGREEN SPINNING MILLS"
TEXT 20, 50, "2", 0, 1, 1, "LOT: LOT-40S-9921"
TEXT 20, 80, "2", 0, 1, 1, "SUPPLIER: Mahalakshmi Ginning"
TEXT 20, 110, "3", 0, 1, 1, "BILLABLE: 10227.9 kg"
TEXT 20, 140, "2", 0, 1, 1, "SEAL: A9B4C2D1"
BARCODE 20, 170, "128", 50, 1, 0, 2, 2, "LOT-40S-9921"
PRINT 1, 1
```

Labels are printed in **1.2 seconds**, affixed to the cotton bale stack, and scanned directly by blowroom operators.
