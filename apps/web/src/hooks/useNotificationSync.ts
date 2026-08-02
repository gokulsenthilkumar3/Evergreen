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
        if (!yarnStock || !settings) return;
        const threshold: number = Number(settings.lowStockThreshold) || 100;

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
            const res = await api.get('/billing/invoices');
            return res.data as any[];
        },
        staleTime: SYNC_INTERVAL_MS,
    });

    useEffect(() => {
        if (!invoices) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        invoices.forEach((inv: any) => {
            if (!inv.dueDate || (inv.paidAmount ?? 0) >= (inv.totalAmount ?? 0)) return;
            const due = new Date(inv.dueDate);
            due.setHours(0, 0, 0, 0);
            if (due < today) {
                const key = `overdue-invoice-${inv.id}`;
                if (!alreadyFired.current.has(key)) {
                    alreadyFired.current.add(key);
                    const outstanding = (inv.totalAmount ?? 0) - (inv.paidAmount ?? 0);
                    addNotification({
                        title: `Overdue Invoice: ${inv.invoiceNumber || inv.id}`,
                        message: `₹${Number(outstanding).toLocaleString('en-IN')} outstanding. Due ${new Date(inv.dueDate).toLocaleDateString('en-IN')}.`,
                        type: 'error',
                        dedupeKey: key,
                        link: 'billing',
                    });
                }
            }
        });
    }, [invoices, addNotification]);

    // ── 3. No Production Today (only after 10am IST) ──────────────────────────
    const { data: productionHistory, refetch: refetchProduction } = useQuery({
        queryKey: ['notif-production'],
        queryFn: async () => {
            const res = await api.get('/production');
            return res.data as any[];
        },
        staleTime: SYNC_INTERVAL_MS,
    });

    useEffect(() => {
        if (!productionHistory) return;
        const now = new Date();
        // Don't nag before PRODUCTION_ALERT_HOUR
        if (now.getHours() < PRODUCTION_ALERT_HOUR) return;

        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        const key = `no-production-${todayStr}`;
        const hasToday = productionHistory.some(
            (p: any) => p.date?.startsWith(todayStr)
        );
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
