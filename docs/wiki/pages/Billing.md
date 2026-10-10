# Billing

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Billing.tsx](../../../apps/web/src/pages/Billing.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {t.label} ([apps/web/src/pages/Billing.tsx:1277](../../../apps/web/src/pages/Billing.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Full | `{() => setPaymentData({ ...paymentData, amount: remaining.toFixed(2) })}` | [apps/web/src/pages/Billing.tsx:219](../../../apps/web/src/pages/Billing.tsx) |
| Cancel | `{onClose}` | [apps/web/src/pages/Billing.tsx:260](../../../apps/web/src/pages/Billing.tsx) |
| Record Payment | `{handleSubmit}` | [apps/web/src/pages/Billing.tsx:261](../../../apps/web/src/pages/Billing.tsx) |
| Back to List | `{onCancel}` | [apps/web/src/pages/Billing.tsx:392](../../../apps/web/src/pages/Billing.tsx) |
| Share | `{handleShare}` | [apps/web/src/pages/Billing.tsx:408](../../../apps/web/src/pages/Billing.tsx) |
| Print / PDF | `{handlePrint}` | [apps/web/src/pages/Billing.tsx:411](../../../apps/web/src/pages/Billing.tsx) |
| Save Invoice | `{handleSave}` | [apps/web/src/pages/Billing.tsx:414](../../../apps/web/src/pages/Billing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => removeItem(item.id)}` | [apps/web/src/pages/Billing.tsx:609](../../../apps/web/src/pages/Billing.tsx) |
| Add Line Item | `{addItem}` | [apps/web/src/pages/Billing.tsx:618](../../../apps/web/src/pages/Billing.tsx) |
| Create Invoice | `{onCreateNew}` | [apps/web/src/pages/Billing.tsx:899](../../../apps/web/src/pages/Billing.tsx) |
| {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} | `{() => setExpandedInvoice(isExpanded ? null : invoice.id)}` | [apps/web/src/pages/Billing.tsx:938](../../../apps/web/src/pages/Billing.tsx) |
| <PaymentIcon fontSize="small" /> | `{() => onAddPayment(invoice)}` | [apps/web/src/pages/Billing.tsx:985](../../../apps/web/src/pages/Billing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => onDelete(invoice.id)}` | [apps/web/src/pages/Billing.tsx:991](../../../apps/web/src/pages/Billing.tsx) |
| <DeleteIcon fontSize="small" /> | `{() => handleDeletePayment(payment.id)}` | [apps/web/src/pages/Billing.tsx:1036](../../../apps/web/src/pages/Billing.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| POST | `'/billing/invoice/${invoice.id}/payment'` | [apps/web/src/pages/Billing.tsx:174](../../../apps/web/src/pages/Billing.tsx) |
| DELETE | `'/billing/payment/${paymentId}'` | [apps/web/src/pages/Billing.tsx:807](../../../apps/web/src/pages/Billing.tsx) |
| GET | `/billing/invoices` | [apps/web/src/pages/Billing.tsx:1105](../../../apps/web/src/pages/Billing.tsx) |
| GET | `/settings` | [apps/web/src/pages/Billing.tsx:1110](../../../apps/web/src/pages/Billing.tsx) |
| GET | `/inventory/yarn-stock` | [apps/web/src/pages/Billing.tsx:1115](../../../apps/web/src/pages/Billing.tsx) |
| POST | `/billing/invoice` | [apps/web/src/pages/Billing.tsx:1134](../../../apps/web/src/pages/Billing.tsx) |
| DELETE | `'/billing/invoice/${id}'` | [apps/web/src/pages/Billing.tsx:1146](../../../apps/web/src/pages/Billing.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [ConfirmContext.tsx](../../../apps/web/src/context/ConfirmContext.tsx)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [TableSkeleton.tsx](../../../apps/web/src/components/common/TableSkeleton.tsx)
- [TablePagination.tsx](../../../apps/web/src/components/common/TablePagination.tsx)
- [PaymentStatusChip.tsx](../../../apps/web/src/components/common/PaymentStatusChip.tsx)
- [GlassDatePicker.tsx](../../../apps/web/src/components/common/GlassDatePicker.tsx)
- [CreditNotes.tsx](../../../apps/web/src/components/billing/CreditNotes.tsx)
- [EInvoices.tsx](../../../apps/web/src/components/billing/EInvoices.tsx)
- [Subscriptions.tsx](../../../apps/web/src/components/billing/Subscriptions.tsx)
- [PurchaseOrders.tsx](../../../apps/web/src/components/billing/PurchaseOrders.tsx)
- [DebitNotes.tsx](../../../apps/web/src/components/billing/DebitNotes.tsx)
- [Quotations.tsx](../../../apps/web/src/components/billing/Quotations.tsx)
- [PackingLists.tsx](../../../apps/web/src/components/billing/PackingLists.tsx)
- [DeliveryChallans.tsx](../../../apps/web/src/components/billing/DeliveryChallans.tsx)
- [ProformaInvoices.tsx](../../../apps/web/src/components/billing/ProformaInvoices.tsx)
- [SalesOrders.tsx](../../../apps/web/src/components/billing/SalesOrders.tsx)
- [Expenses.tsx](../../../apps/web/src/components/billing/Expenses.tsx)
- [IndirectIncomes.tsx](../../../apps/web/src/components/billing/IndirectIncomes.tsx)
- [ProductsServices.tsx](../../../apps/web/src/components/billing/ProductsServices.tsx)
- [BarcodeOptions.tsx](../../../apps/web/src/components/billing/BarcodeOptions.tsx)
- [DeletedView.tsx](../../../apps/web/src/components/billing/DeletedView.tsx)
- [Category.tsx](../../../apps/web/src/components/billing/Category.tsx)
- [Group.tsx](../../../apps/web/src/components/billing/Group.tsx)
- [Pricelists.tsx](../../../apps/web/src/components/billing/Pricelists.tsx)
- [ExpiryDatesBatches.tsx](../../../apps/web/src/components/billing/ExpiryDatesBatches.tsx)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
