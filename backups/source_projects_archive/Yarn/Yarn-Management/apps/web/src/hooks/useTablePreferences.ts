import { useState, useEffect } from 'react';

export function useTablePreferences(key: string, defaultColumns: string[]) {
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(`table_prefs_${key}`);
            return saved ? JSON.parse(saved) : defaultColumns;
        } catch {
            return defaultColumns;
        }
    });

    useEffect(() => {
        localStorage.setItem(`table_prefs_${key}`, JSON.stringify(visibleColumns));
    }, [key, visibleColumns]);

    const toggleColumn = (column: string) => {
        setVisibleColumns((prev) =>
            prev.includes(column)
                ? prev.filter((c) => c !== column)
                : [...prev, column]
        );
    };

    const isVisible = (column: string) => visibleColumns.includes(column);

    return { visibleColumns, toggleColumn, isVisible };
}
