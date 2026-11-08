# EverGreen knowledge wiki

Welcome to the documentation and operating wiki for **EverGreen**, a business application for textile manufacturing and job-work operations. Source references describe implementation surfaces; they do not certify live integrations or operational acceptance.

---

## 🚀 Quick Navigation

### 1. Operations & Mill Floor
* **[Inward Entry](pages/InwardEntry.md)**: Cotton and yarn receipt workflows with weighbridge utilities and quality-check records. Live hardware capture needs a supported-device pilot.
* **[Production Entry](pages/ProductionEntry.md)**: Production, output and waste-recording workflows.
* **[Job Work Processing](pages/JobWork.md)**: Job-work orders and return recording; partial-return and reconciliation acceptance still needs verification.
* **[Inventory Ledger](pages/Inventory.md)**: Stock and lot transaction records. Multi-site transfer acceptance requires deployment-specific verification.

### 2. Commercials, Billing & Accounting
* **[Commerce Desk](pages/CommerceDesk.md)**: Customer orders, invoices and dispatch workflows.
* **[Book-Ellam (Double Entry)](pages/BookEllam.md)**: Financial records and ledger views; reconcile saved documents against the source records.
* **[Tax & Compliance](pages/yarn-ComplianceReports.md)**: Tax reports and e-Way Bill readiness checks. Statutory registration and filing are not established by these screens.

### 3. Mill Floor IoT & Security
* **[Hardware Integrations](pages/Integrations.md)**: Indicator parsing and signed-slip utilities; live serial capture and printer operation require a supported-hardware pilot.
* **[Security & RBAC](pages/SecuritySettings.md)**: Role-based permissions and TOTP options. Deployment controls require verification in the target environment.
* **[Helpdesk & Staff Support](pages/Helpdesk.md)**: Staff ticketing and support workflows.

---

## 📖 Operational Pillars

```mermaid
flowchart LR
    A["Inward Receipt"] --> B["Quality Check"]
    B --> C["Stock Ledger"]
    C --> D["Job-Work / Production"]
    D --> E["Tax Invoicing"]
    E --> F["Payment Ledger"]
```

1. **Reconciliation-first**: Operational commands use transaction boundaries and reconciliation paths. Replay, cancellation and recovery still require workflow acceptance testing.
2. **Customer-specific installations**: The architecture keeps customer installations separate from the provider system. Isolation and restore behavior must be verified for each deployment.
3. **Desktop delivery**: The desktop package includes a local backend. Offline write synchronization and conflict handling are not established capabilities.
4. **Language support**: English and Tamil (தமிழ்) are available in the interface; action-level translation QA remains necessary.

---

## 🛠️ Need Help?
For operational guidance, consult the **[Operating Guide](OPERATING_GUIDE.md)** or use the [Helpdesk](pages/Helpdesk.md).
