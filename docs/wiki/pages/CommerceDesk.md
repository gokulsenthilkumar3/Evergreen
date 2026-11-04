# CommerceDesk

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CommerceDesk.tsx](../../../apps/web/src/pages/CommerceDesk.tsx).

Direct routes: `/business`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- {uiText("Catalogue", 'tabs')} ([apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx))
- {uiText("Customers & Ledger", 'tabs')} ([apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx))
- {uiText("Sales Orders", 'tabs')} ([apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx))
- {uiText("Invoices", 'tabs')} ([apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {uiText("+ Add line")} | `{() => setSales((old: any) => ({ ...old, lines: [...old.lines, { itemId: '', quantity: '', rate: '', discount: '' }] }))}` | [apps/web/src/pages/CommerceDesk.tsx:99](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Customer")} | `{() => setCustomerOpen(true)}` | [apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Order")} | `{() => setOrderOpen(true)}` | [apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Invoice Studio")} | `{() => setInvoiceOpen(true)}` | [apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Add catalogue item")} | `{() => { setEditingItemId(null); setItem(emptyItem()); setItemOpen(true); }}` | [apps/web/src/pages/CommerceDesk.tsx:101](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Edit", 'tables')} | `{() => editItem(x)}` | [apps/web/src/pages/CommerceDesk.tsx:101](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("History", 'tables')} | `{() => setHistoryItem(x)}` | [apps/web/src/pages/CommerceDesk.tsx:101](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Adjust", 'tables')} | `{() => setAdjustItem(x)}` | [apps/web/src/pages/CommerceDesk.tsx:101](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Archive", 'tables')} | `{async () => { if (!window.confirm('Archive ${x.name}? Historical documents will remain.')) return; try { await api.delete('/commerce/items/${x.id}'); await refresh(['commerce-items']); toast.success(uiText('Item archived', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message \|\| 'Could not archive item', 'feedback')); } }}` | [apps/web/src/pages/CommerceDesk.tsx:101](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Edit", 'tables')} | `{() => editCustomer(x)}` | [apps/web/src/pages/CommerceDesk.tsx:102](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Ledger", 'tables')} | `{async () => { try { setLedgerName(x.name); setLedger((await api.get('/commerce/customers/${x.id}/ledger')).data); } catch { toast.error(uiText('Could not load ledger', 'feedback')); } }}` | [apps/web/src/pages/CommerceDesk.tsx:102](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Invoice", 'tables')} | `{() => convertOrder(x)}` | [apps/web/src/pages/CommerceDesk.tsx:103](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Cancel remaining", 'tables')} | `{async()=>{try{await api.post('/commerce/orders/${x.id}/cancel',{notes:'Cancelled from Business Desk'});await refresh(['commerce-orders','commerce-items']);toast.success(uiText('Order cancelled and stock released', 'feedback'));}catch(e:any){toast.error(uiText(e.response?.data?.message\|\|'Could not cancel order', 'feedback'))}}}` | [apps/web/src/pages/CommerceDesk.tsx:103](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Download PDF", 'tables')} | `{()=>downloadInvoicePdf(x)}` | [apps/web/src/pages/CommerceDesk.tsx:104](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Payments", 'tables')} | `{() => { setPaymentInvoiceId(x.id); setPaymentKey(crypto.randomUUID()); setPaymentAmount(''); setPaymentNotes(''); }}` | [apps/web/src/pages/CommerceDesk.tsx:104](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Void", 'tables')} | `{async()=>{if(!window.confirm('Void invoice ${x.invoiceNo}? This reverses billing. Direct-sale stock is returned; an existing dispatch stays dispatched.'))return;try{await api.post('/commerce/invoices/${x.id}/void',{notes:'Voided from Invoice Studio'});await refresh(['commerce-invoices','commerce-customers','commerce-items']);toast.success(uiText('Invoice voided', 'feedback'))}catch(e:any){toast.error(uiText(e.response?.data?.message\|\|'Could not void invoice', 'feedback'))}}}` | [apps/web/src/pages/CommerceDesk.tsx:104](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Record payment")} | `{async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments', { amount: Number(paymentAmount), method: paymentMethod, reference: paymentNotes, idempotencyKey: paymentKey }); setPaymentAmount(''); setPaymentKey(crypto.randomUUID()); await refresh(['commerce-invoices', 'commerce-customers']); toast.success(uiText('Payment recorded', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message \|\| 'Could not record payment', 'feedback')); } finally { setPaymentSaving(false); } }}` | [apps/web/src/pages/CommerceDesk.tsx:114](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Reverse")} | `{async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments/' + payment.id + '/reverse', { notes: paymentNotes }); await refresh(['commerce-invoices', 'commerce-customers']); toast.success(uiText('Payment reversed; original receipt retained', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message \|\| 'Could not reverse payment', 'feedback')); } finally { setPaymentSaving(false); } }}` | [apps/web/src/pages/CommerceDesk.tsx:121](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Close")} | `{() => setPaymentInvoiceId(null)}` | [apps/web/src/pages/CommerceDesk.tsx:125](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Cancel")} | `{() => setItemOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:143](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {busy ? uiText("Saving…") : uiText("Save")} | `{saveItem}` | [apps/web/src/pages/CommerceDesk.tsx:143](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Cancel")} | `{() => setCustomerOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:145](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {busy ? uiText("Saving…") : uiText("Save")} | `{saveCustomer}` | [apps/web/src/pages/CommerceDesk.tsx:145](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Cancel")} | `{() => setAdjustItem(null)}` | [apps/web/src/pages/CommerceDesk.tsx:146](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Record adjustment")} | `{submitAdjustment}` | [apps/web/src/pages/CommerceDesk.tsx:146](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Close")} | `{() => setHistoryItem(null)}` | [apps/web/src/pages/CommerceDesk.tsx:147](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Cancel")} | `{() => setOrderOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:148](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {busy ? uiText("Reserving…") : uiText("Reserve stock")} | `{submitOrder}` | [apps/web/src/pages/CommerceDesk.tsx:148](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Cancel")} | `{() => setInvoiceOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:224](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Finalise")} | `{() => submitInvoice(false)}` | [apps/web/src/pages/CommerceDesk.tsx:226](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Finalise & Download PDF")} | `{() => submitInvoice(true)}` | [apps/web/src/pages/CommerceDesk.tsx:227](../../../apps/web/src/pages/CommerceDesk.tsx) |
| {uiText("Close")} | `{() => setLedger(null)}` | [apps/web/src/pages/CommerceDesk.tsx:231](../../../apps/web/src/pages/CommerceDesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `'/commerce/items/${historyItem!.id}/movements'` | [apps/web/src/pages/CommerceDesk.tsx:34](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/items` | [apps/web/src/pages/CommerceDesk.tsx:35](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/brands` | [apps/web/src/pages/CommerceDesk.tsx:36](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/categories` | [apps/web/src/pages/CommerceDesk.tsx:37](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/CommerceDesk.tsx:38](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/orders` | [apps/web/src/pages/CommerceDesk.tsx:39](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/invoices` | [apps/web/src/pages/CommerceDesk.tsx:40](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/settings` | [apps/web/src/pages/CommerceDesk.tsx:41](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/inventory/outward` | [apps/web/src/pages/CommerceDesk.tsx:42](../../../apps/web/src/pages/CommerceDesk.tsx) |
| PATCH | `'/commerce/items/${editingItemId}'` | [apps/web/src/pages/CommerceDesk.tsx:61](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/items` | [apps/web/src/pages/CommerceDesk.tsx:61](../../../apps/web/src/pages/CommerceDesk.tsx) |
| PATCH | `'/commerce/customers/${editingCustomerId}'` | [apps/web/src/pages/CommerceDesk.tsx:62](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/customers` | [apps/web/src/pages/CommerceDesk.tsx:62](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/items/${adjustItem.id}/adjust'` | [apps/web/src/pages/CommerceDesk.tsx:65](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/orders` | [apps/web/src/pages/CommerceDesk.tsx:66](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/invoices` | [apps/web/src/pages/CommerceDesk.tsx:71](../../../apps/web/src/pages/CommerceDesk.tsx) |
| DELETE | `'/commerce/items/${x.id}'` | [apps/web/src/pages/CommerceDesk.tsx:101](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `'/commerce/customers/${x.id}/ledger'` | [apps/web/src/pages/CommerceDesk.tsx:102](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/orders/${x.id}/cancel'` | [apps/web/src/pages/CommerceDesk.tsx:103](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/invoices/${x.id}/void'` | [apps/web/src/pages/CommerceDesk.tsx:104](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/invoices/' + paymentInvoice.id + '/payments'` | [apps/web/src/pages/CommerceDesk.tsx:114](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/invoices/' + paymentInvoice.id + '/payments/' + payment.id + '/reverse'` | [apps/web/src/pages/CommerceDesk.tsx:121](../../../apps/web/src/pages/CommerceDesk.tsx) |

## Composed behavior

- [dateKey.ts](../../../apps/web/src/utils/dateKey.ts)
- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)
- [CatalogueTaxonomy.tsx](../../../apps/web/src/pages/CatalogueTaxonomy.tsx)
- [invoiceDocument.ts](../../../apps/web/src/utils/invoiceDocument.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
