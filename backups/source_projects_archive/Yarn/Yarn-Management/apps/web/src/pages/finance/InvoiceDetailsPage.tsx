import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';
import { useNotification } from '../../context/NotificationContext';
import InvoiceStatusTracker from '../../components/billing/InvoiceStatusTracker';
import './InvoiceDetailsPage.css';

interface InvoiceDetails {
    id: string;
    invoiceNumber: string;
    status: string;
    customerName: string;
    totalAmount: number;
    date: string;
    dueDate: string;
    createdAt: string;
    sentAt: string | null;
    viewedAt: string | null;
    paidAt: string | null;
    reminders: any[];
    items: any[];
}

const InvoiceDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const { showError, showSuccess } = useNotification();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Fetch base invoice + tracking data. 
                // Our new tracking endpoint returns tracking info, but we need full details.
                // Assuming we can fetch generic invoice details via existing endpoint
                // or we need to update the tracking endpoint to return everything.
                // For now, let's try fetching from the tracking endpoint we made which returns tracking info.
                // Wait, 'getInvoiceTracking' returning just tracking fields.
                // I might need to fetch generic invoice first then tracking.

                // Let's assume we can get tracking info from /billing/invoices/:id/tracking
                const trackingRes = await http.get(`/billing/invoices/${id}/tracking`);
                const trackingData = trackingRes.data;

                setInvoice(trackingData);
            } catch (error: any) {
                console.error('Failed to fetch invoice:', error);
                showError('Failed to load invoice details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInvoice();
    }, [id, showError]);

    const handleSendReminder = async () => {
        try {
            await http.post(`/billing/invoices/${id}/reminders`, {
                reminderType: 'MANUAL',
            });
            showSuccess('Reminder sent');
            // Refresh data logic here
        } catch (error: any) {
            showError('Failed to send reminder');
        }
    };

    const handleStatusUpdate = async (status: string) => {
        try {
            await http.patch(`/billing/invoices/${id}/status`, { status });
            showSuccess('Status updated');
            // Refresh
            const trackingRes = await http.get(`/billing/invoices/${id}/tracking`);
            setInvoice(trackingRes.data);
        } catch (error: any) {
            showError('Failed to update status');
        }
    }

    if (loading) return <div className="loading-screen">Loading...</div>;
    if (!invoice) return <div className="error-screen">Invoice not found</div>;

    return (
        <div className="invoice-details-page">
            <div className="page-header">
                <button onClick={() => navigate('/billing')} className="back-btn">&larr; Back to Invoices</button>
                <h1>Invoice Tracking</h1>
            </div>

            <div className="details-container">
                <div className="main-content">
                    {/* We use the InvoiceStatusTracker component here */}
                    <div className="tracker-card">
                        <h3>Timeline</h3>
                        <InvoiceStatusTracker invoice={invoice} />
                    </div>
                </div>

                <div className="sidebar">
                    <div className="actions-card">
                        <h3>Actions</h3>
                        <div className="action-buttons">
                            <button onClick={() => handleStatusUpdate('SENT')} disabled={invoice.status === 'SENT' || invoice.status === 'PAID'}>Mark Sent</button>
                            <button onClick={handleSendReminder}>Send Reminder</button>
                            <button onClick={() => handleStatusUpdate('PAID')} className="primary" disabled={invoice.status === 'PAID'}>Mark Paid</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsPage;
