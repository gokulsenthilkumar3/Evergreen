import { useState } from 'react';

/** Persist a list of items to localStorage. Each item must have an `id` string field. */
export function usePersist<T extends { id: string }>(key: string, initial: T[] = []) {
    const [items, setItems] = useState<T[]>(() => {
        try {
            const stored = localStorage.getItem(`evergreen_${key}`);
            return stored ? JSON.parse(stored) : initial;
        } catch {
            return initial;
        }
    });

    const persist = (next: T[]) => {
        setItems(next);
        localStorage.setItem(`evergreen_${key}`, JSON.stringify(next));
    };

    const add = (item: Omit<T, 'id'>): T => {
        const newItem = { ...item, id: `${key}-${Date.now()}` } as T;
        persist([...items, newItem]);
        return newItem;
    };

    const update = (id: string, patch: Partial<T>) => {
        persist(items.map(i => i.id === id ? { ...i, ...patch } : i));
    };

    const remove = (id: string) => {
        persist(items.filter(i => i.id !== id));
    };

    return { items, add, update, remove };
}

export const today = () => new Date().toLocaleDateString('en-CA');
export const fmtDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtAmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
