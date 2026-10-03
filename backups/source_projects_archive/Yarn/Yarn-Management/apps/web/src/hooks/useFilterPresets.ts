import { useState, useEffect } from 'react';

export interface FilterPreset {
    id: string;
    name: string;
    filters: Record<string, any>;
}

export function useFilterPresets(pageKey: string) {
    const storageKey = `yarn_mgmt_presets_${pageKey}`;
    const [presets, setPresets] = useState<FilterPreset[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setPresets(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse filter presets", e);
            }
        }
    }, [storageKey]);

    const savePreset = (name: string, filters: Record<string, any>) => {
        const newPreset: FilterPreset = {
            id: Date.now().toString(),
            name,
            filters
        };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const deletePreset = (id: string) => {
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    return { presets, savePreset, deletePreset };
}
