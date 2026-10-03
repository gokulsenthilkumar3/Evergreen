import React from 'react';
import './InvoiceStatusTracker.css';

interface InvoiceTimelineEvent {
    label: string;
    date: string | null;
    status: 'completed' | 'current' | 'pending';
    icon?: string;
    description?: string;
}

interface InvoiceReminder {
    id: string;
    reminderType: 'AUTO' | 'MANUAL';
    sentAt: string;
}

interface Invoice {
    id: string;
    status: string;
    createdAt: string;
    sentAt: string | null;
    viewedAt: string | null;
    paidAt: string | null;
    reminders: InvoiceReminder[];
}

interface Props {
    invoice: Invoice;
}

const InvoiceStatusTracker: React.FC<Props> = ({ invoice }) => {
    const getTimeline = (): InvoiceTimelineEvent[] => {
        const steps: InvoiceTimelineEvent[] = [
            {
                label: 'Draft',
                date: invoice.createdAt,
                status: 'completed',
                description: 'Invoice created',
            },
            {
                label: 'Sent',
                date: invoice.sentAt,
                status: invoice.sentAt ? 'completed' : invoice.status === 'SENT' ? 'current' : 'pending',
                description: invoice.sentAt ? 'Email sent to customer' : 'Waiting to be sent',
            },
            {
                label: 'Viewed',
                date: invoice.viewedAt,
                status: invoice.viewedAt ? 'completed' : invoice.status === 'VIEWED' ? 'current' : 'pending',
                description: invoice.viewedAt ? 'Customer viewed the invoice' : 'Not yet viewed',
            },
            {
                label: 'Paid',
                date: invoice.paidAt,
                status: invoice.paidAt ? 'completed' : invoice.status === 'PAID' ? 'current' : 'pending',
                description: invoice.paidAt ? 'Payment received' : 'Payment pending',
            },
        ];

        // Mark current based on status if dates shouldn't overwrite logic (e.g. overdue)
        if (invoice.status === 'OVERDUE') {
            steps[3].status = 'pending';
            steps[3].description = 'Payment Overdue!';
        }

        return steps;
    };

    const timeline = getTimeline();

    return (
        <div className="invoice-status-tracker">
            <div className="timeline">
                {timeline.map((step, index) => (
                    <div key={index} className={`timeline-item ${step.status}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <div className="step-header">
                                <span className="step-label">{step.label}</span>
                                {step.date && (
                                    <span className="step-date">
                                        {new Date(step.date).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <p className="step-description">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {invoice.reminders && invoice.reminders.length > 0 && (
                <div className="reminders-section">
                    <h4>Reminders Sent</h4>
                    <ul className="reminder-list">
                        {invoice.reminders.map(reminder => (
                            <li key={reminder.id} className="reminder-item">
                                <span className="reminder-type">{reminder.reminderType}</span>
                                <span className="reminder-date">{new Date(reminder.sentAt).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InvoiceStatusTracker;
