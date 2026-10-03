import { Card, CardContent, CardHeader, IconButton, CircularProgress, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ReactNode } from 'react';

interface DashboardWidgetProps {
    title: string;
    icon?: ReactNode;
    loading?: boolean;
    error?: string;
    onRefresh?: () => void;
    children: ReactNode;
}

export default function DashboardWidget({
    title,
    icon,
    loading,
    error,
    onRefresh,
    children,
}: DashboardWidgetProps) {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
                title={title}
                avatar={icon}
                action={
                    onRefresh && (
                        <IconButton onClick={onRefresh} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    )
                }
                sx={{ pb: 0 }}
            />
            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </div>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
