import React, { useEffect, useState } from 'react';
import { http } from '../lib/http';
import { useNotification } from '../context/NotificationContext';
import BatchStatusCard from '../components/production/BatchStatusCard';
import './LiveProductionDashboard.css';

interface DashboardData {
    batches: any[];
    metrics: {
        activeCount: number;
        alertCount: number;
        totalCount: number;
    };
}

const LiveProductionDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const { showError } = useNotification();

    const fetchData = async () => {
        try {
            const res = await http.get('/production/dashboard');
            setData(res.data);
        } catch (error: any) {
            console.error('Failed to load dashboard:', error);
            if (loading) showError('Failed to load production data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="live-production-dashboard">
            <h1 className="page-title">Live Production Monitoring</h1>

            {loading && !data ? (
                <div className="loading-screen">Loading live data...</div>
            ) : !data ? (
                <div className="error-screen">Failed to load data</div>
            ) : (
                <>
                    <div className="dashboard-stats">
                        <div className="stat-card active-card">
                            <h3>Active Batches</h3>
                            <div className="stat-value">{data.metrics.activeCount}</div>
                        </div>
                        <div className="stat-card alert-card">
                            <h3>Active Alerts</h3>
                            <div className="stat-value">{data.metrics.alertCount}</div>
                        </div>
                        <div className="stat-card total-card">
                            <h3>Total Scanned</h3>
                            <div className="stat-value">{data.metrics.totalCount}</div>
                        </div>
                    </div>

                    <div className="production-grid-section">
                        <div className="section-header">
                            <h2>Production Floor</h2>
                            <button onClick={fetchData} className="refresh-btn">Refresh</button>
                        </div>

                        {data.batches.length === 0 ? (
                            <div className="empty-state">No active production batches found.</div>
                        ) : (
                            <div className="batch-grid">
                                {data.batches.map((batch: any) => (
                                    <BatchStatusCard key={batch.id} batch={batch} onRefresh={fetchData} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default LiveProductionDashboard;
