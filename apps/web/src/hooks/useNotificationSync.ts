/**
 * useNotificationSync
 *
 * Runs on mount (and every 5 minutes) to check real application data and
 * push actionable notifications into the NotificationsContext.
 *
 * Checks:
 *  1. Low yarn stock (any count below the configured threshold)
 *  2. Overdue invoices (outstanding balance + due date passed)
 *  3. No production entry recorded today (after 10:00 am IST)
 */
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from '../context/NotificationsContext';
import api from '../utils/api';
import { hasProductionOn, lowStockThreshold, overdueInvoices, type InvoiceForAlert } from '../utils/alerts';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const PRODUCTION_ALERT_HOUR = 10;        // don't alert before 10am

export function useNotificationSync(settings: any) {
    const { addNotification, notifications } = useNotifications();
    const alreadyFired = useRef<Set<string>>(new Set());

    // Pre-populate the already-fired set from existing notifications so we
    // don't duplicate on re-mount within the same session.
    useEffect(() => {
        notifications.forEach(n => alreadyFired.current.add(n.dedupeKey ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 1. Low Stock ──────────────────────────────────────────────────────────
    const { data: yarnStock, refetch: refetchStock } = useQuery({
        queryKey: ['notif-yarn-stock'],
        queryFn: async () => {
            const res = await api.get('/inventory/yarn-stock');
            return res.data as Record<string, number>;
        },
        staleTime: SYNC_INTERVAL_MS,
        enabled: !!settings,
    });

    useEffect(() => {
        if (!yarnStock || typeof yarnStock !== 'object' || !settings) return;
        const threshold = lowStockThreshold(settings);

        Object.entries(yarnStock).forEach(([count, qty]) => {
            if (typeof qty !== 'number') return;
            const key = `low-stock-${count}`;
            if (qty < threshold && !alreadyFired.current.has(key)) {
                alreadyFired.current.add(key);
                addNotification({
                    title: `Low Stock: Count ${count}`,
                    message: `Only ${qty.toFixed(1)} kg remaining (threshold: ${threshold} kg).`,
                    type: 'warning',
                    dedupeKey: key,
                    link: 'inventory',
                });
            }
        });
    }, [yarnStock, settings, addNotification]);

    // ── 2. Overdue Invoices ───────────────────────────────────────────────────
    const { data: invoices, refetch: refetchInvoices } = useQuery({
        queryKey: ['notif-invoices'],
        queryFn: async () => {
            // Live invoicing is /commerce/invoices; the retired billing list used other field names.
            const res = await api.get('/commerce/invoices');
            return (Array.isArray(res.data) ? res.data : []) as InvoiceForAlert[];
        },
        staleTime: SYNC_INTERVAL_MS,
    });

    useEffect(() => {
        if (!invoices || !Array.isArray(invoices)) return;
        for (const { invoice, outstanding } of overdueInvoices(invoices)) {
            const key = `overdue-invoice-${invoice.id}`;
            if (alreadyFired.current.has(key)) continue;
            alreadyFired.current.add(key);
            addNotification({
                title: `Overdue Invoice: ${invoice.invoiceNo || invoice.id}`,
                message: `₹${outstanding.toLocaleString('en-IN')} outstanding. Due ${new Date(invoice.dueDate!).toLocaleDateString('en-IN')}.`,
                type: 'error',
                dedupeKey: key,
                link: 'business',
            });
        }
    }, [invoices, addNotification]);

    // ── 3. No Production Today (only after 10am IST) ──────────────────────────
    const { data: productionHistory, refetch: refetchProduction } = useQuery({
        queryKey: ['notif-production'],
        queryFn: async () => {
            const today = new Date().toLocaleDateString('en-CA');
            const res = await api.get('/production', { params: { from: today, to: today } });
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        staleTime: SYNC_INTERVAL_MS,
    });

    useEffect(() => {
        if (!productionHistory || !Array.isArray(productionHistory)) return;
        const now = new Date();
        // Don't nag before PRODUCTION_ALERT_HOUR
        if (now.getHours() < PRODUCTION_ALERT_HOUR) return;

        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        const key = `no-production-${todayStr}`;
        const hasToday = hasProductionOn(productionHistory, todayStr);
        if (!hasToday && !alreadyFired.current.has(key)) {
            alreadyFired.current.add(key);
            addNotification({
                title: 'No Production Today',
                message: `No production entry has been recorded yet for ${todayStr}.`,
                type: 'info',
                dedupeKey: key,
                link: 'production',
            });
        }
    }, [productionHistory, addNotification]);

    // ── Periodic re-sync ──────────────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            // Clear fired keys so re-checks can re-alert if conditions persist
            alreadyFired.current.clear();
            refetchStock();
            refetchInvoices();
            refetchProduction();
        }, SYNC_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [refetchStock, refetchInvoices, refetchProduction]);
}
