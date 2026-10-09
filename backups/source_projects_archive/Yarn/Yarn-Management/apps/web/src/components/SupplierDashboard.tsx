import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Supplier {
    id: string;
    name: string;
    primaryContactName: string | null;
}

export default function SupplierDashboard() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSuppliers() {
            try {
                const { data, error } = await supabase
                    .from('Supplier')
                    .select('id, name, primaryContactName');

                if (error) {
                    console.error('Error fetching suppliers:', error);
                    setError(error.message);
                } else {
                    setSuppliers(data || []);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchSuppliers();
    }, []);

    if (loading) return <div>Loading Suppliers...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Supplier List</h1>
            {suppliers.length === 0 ? (
                <p>No suppliers found.</p>
            ) : (
                <ul>
                    {suppliers.map((s) => (
                        <li key={s.id}>
                            <strong>{s.name}</strong> - {s.primaryContactName || 'No Contact'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
