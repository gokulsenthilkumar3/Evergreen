# CommerceDesk

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CommerceDesk.tsx](../../../apps/web/src/pages/CommerceDesk.tsx).

Direct routes: `/business`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Catalogue ([apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx))
- Customers & Ledger ([apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx))
- Sales Orders ([apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx))
- Invoices ([apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| + Add line | `{() => setSales((old: any) => ({ ...old, lines: [...old.lines, { itemId: '', quantity: '', rate: '', discount: '' }] }))}` | [apps/web/src/pages/CommerceDesk.tsx:85](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Customer | `{() => setCustomerOpen(true)}` | [apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Order | `{() => setOrderOpen(true)}` | [apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Invoice Studio | `{() => setInvoiceOpen(true)}` | [apps/web/src/pages/CommerceDesk.tsx:86](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Add catalogue item | `{() => { setEditingItemId(null); setItem(emptyItem()); setItemOpen(true); }}` | [apps/web/src/pages/CommerceDesk.tsx:87](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Edit | `{() => editItem(x)}` | [apps/web/src/pages/CommerceDesk.tsx:87](../../../apps/web/src/pages/CommerceDesk.tsx) |
| History | `{() => setHistoryItem(x)}` | [apps/web/src/pages/CommerceDesk.tsx:87](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Adjust | `{() => setAdjustItem(x)}` | [apps/web/src/pages/CommerceDesk.tsx:87](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Archive | `{async () => { if (!window.confirm('Archive ${x.name}? Historical documents will remain.')) return; try { await api.delete('/commerce/items/${x.id}'); await refresh(['commerce-items']); toast.success('Item archived'); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not archive item'); } }}` | [apps/web/src/pages/CommerceDesk.tsx:87](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Edit | `{() => editCustomer(x)}` | [apps/web/src/pages/CommerceDesk.tsx:88](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Ledger | `{async () => { try { setLedgerName(x.name); setLedger((await api.get('/commerce/customers/${x.id}/ledger')).data); } catch { toast.error('Could not load ledger'); } }}` | [apps/web/src/pages/CommerceDesk.tsx:88](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Invoice | `{() => convertOrder(x)}` | [apps/web/src/pages/CommerceDesk.tsx:89](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Cancel remaining | `{async()=>{try{await api.post('/commerce/orders/${x.id}/cancel',{notes:'Cancelled from Business Desk'});await refresh(['commerce-orders','commerce-items']);toast.success('Order cancelled and stock released');}catch(e:any){toast.error(e.response?.data?.message\|\|'Could not cancel order')}}}` | [apps/web/src/pages/CommerceDesk.tsx:89](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Download PDF | `{()=>downloadInvoicePdf(x)}` | [apps/web/src/pages/CommerceDesk.tsx:90](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Payments | `{() => { setPaymentInvoiceId(x.id); setPaymentKey(crypto.randomUUID()); setPaymentAmount(''); setPaymentNotes(''); }}` | [apps/web/src/pages/CommerceDesk.tsx:90](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Void | `{async()=>{if(!window.confirm('Void invoice ${x.invoiceNo}? This reverses billing. Direct-sale stock is returned; an existing dispatch stays dispatched.'))return;try{await api.post('/commerce/invoices/${x.id}/void',{notes:'Voided from Invoice Studio'});await refresh(['commerce-invoices','commerce-customers','commerce-items']);toast.success('Invoice voided')}catch(e:any){toast.error(e.response?.data?.message\|\|'Could not void invoice')}}}` | [apps/web/src/pages/CommerceDesk.tsx:90](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Record payment | `{async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments', { amount: Number(paymentAmount), method: paymentMethod, reference: paymentNotes, idempotencyKey: paymentKey }); setPaymentAmount(''); setPaymentKey(crypto.randomUUID()); await refresh(['commerce-invoices', 'commerce-customers']); toast.success('Payment recorded'); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not record payment'); } finally { setPaymentSaving(false); } }}` | [apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Reverse | `{async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments/' + payment.id + '/reverse', { notes: paymentNotes }); await refresh(['commerce-invoices', 'commerce-customers']); toast.success('Payment reversed; original receipt retained'); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not reverse payment'); } finally { setPaymentSaving(false); } }}` | [apps/web/src/pages/CommerceDesk.tsx:107](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Close | `{() => setPaymentInvoiceId(null)}` | [apps/web/src/pages/CommerceDesk.tsx:111](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Cancel | `{() => setItemOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:129](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Save | `{saveItem}` | [apps/web/src/pages/CommerceDesk.tsx:129](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Cancel | `{() => setCustomerOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:131](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Save | `{saveCustomer}` | [apps/web/src/pages/CommerceDesk.tsx:131](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Cancel | `{() => setAdjustItem(null)}` | [apps/web/src/pages/CommerceDesk.tsx:132](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Record adjustment | `{submitAdjustment}` | [apps/web/src/pages/CommerceDesk.tsx:132](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Close | `{() => setHistoryItem(null)}` | [apps/web/src/pages/CommerceDesk.tsx:133](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Cancel | `{() => setOrderOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:134](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Reserve stock | `{submitOrder}` | [apps/web/src/pages/CommerceDesk.tsx:134](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Cancel | `{() => setInvoiceOpen(false)}` | [apps/web/src/pages/CommerceDesk.tsx:214](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Finalise | `{() => submitInvoice(false)}` | [apps/web/src/pages/CommerceDesk.tsx:216](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Finalise & Download PDF | `{() => submitInvoice(true)}` | [apps/web/src/pages/CommerceDesk.tsx:217](../../../apps/web/src/pages/CommerceDesk.tsx) |
| Close | `{() => setLedger(null)}` | [apps/web/src/pages/CommerceDesk.tsx:221](../../../apps/web/src/pages/CommerceDesk.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `'/commerce/items/${historyItem!.id}/movements'` | [apps/web/src/pages/CommerceDesk.tsx:30](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/items` | [apps/web/src/pages/CommerceDesk.tsx:31](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/brands` | [apps/web/src/pages/CommerceDesk.tsx:32](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/categories` | [apps/web/src/pages/CommerceDesk.tsx:33](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/CommerceDesk.tsx:34](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/orders` | [apps/web/src/pages/CommerceDesk.tsx:35](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/commerce/invoices` | [apps/web/src/pages/CommerceDesk.tsx:36](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/settings` | [apps/web/src/pages/CommerceDesk.tsx:37](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `/inventory/outward` | [apps/web/src/pages/CommerceDesk.tsx:38](../../../apps/web/src/pages/CommerceDesk.tsx) |
| PATCH | `'/commerce/items/${editingItemId}'` | [apps/web/src/pages/CommerceDesk.tsx:47](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/items` | [apps/web/src/pages/CommerceDesk.tsx:47](../../../apps/web/src/pages/CommerceDesk.tsx) |
| PATCH | `'/commerce/customers/${editingCustomerId}'` | [apps/web/src/pages/CommerceDesk.tsx:48](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/customers` | [apps/web/src/pages/CommerceDesk.tsx:48](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/items/${adjustItem.id}/adjust'` | [apps/web/src/pages/CommerceDesk.tsx:51](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/orders` | [apps/web/src/pages/CommerceDesk.tsx:52](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `/commerce/invoices` | [apps/web/src/pages/CommerceDesk.tsx:57](../../../apps/web/src/pages/CommerceDesk.tsx) |
| DELETE | `'/commerce/items/${x.id}'` | [apps/web/src/pages/CommerceDesk.tsx:87](../../../apps/web/src/pages/CommerceDesk.tsx) |
| GET | `'/commerce/customers/${x.id}/ledger'` | [apps/web/src/pages/CommerceDesk.tsx:88](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/orders/${x.id}/cancel'` | [apps/web/src/pages/CommerceDesk.tsx:89](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/invoices/${x.id}/void'` | [apps/web/src/pages/CommerceDesk.tsx:90](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/invoices/' + paymentInvoice.id + '/payments'` | [apps/web/src/pages/CommerceDesk.tsx:100](../../../apps/web/src/pages/CommerceDesk.tsx) |
| POST | `'/commerce/invoices/' + paymentInvoice.id + '/payments/' + payment.id + '/reverse'` | [apps/web/src/pages/CommerceDesk.tsx:107](../../../apps/web/src/pages/CommerceDesk.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [CatalogueTaxonomy.tsx](../../../apps/web/src/pages/CatalogueTaxonomy.tsx)
- [invoiceDocument.ts](../../../apps/web/src/utils/invoiceDocument.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
