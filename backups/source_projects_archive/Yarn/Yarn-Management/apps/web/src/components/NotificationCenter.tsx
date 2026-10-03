import { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Badge,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Button,
    Divider,
    CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import QualityIcon from '@mui/icons-material/HighQuality';
import PaymentIcon from '@mui/icons-material/Payment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import api from '../lib/api';

const notificationIcons: Record<string, any> = {
    INFO: InfoIcon,
    WARNING: WarningIcon,
    ERROR: ErrorIcon,
    SUCCESS: CheckCircleIcon,
    LOW_STOCK: InventoryIcon,
    QUALITY_ALERT: QualityIcon,
    PAYMENT_DUE: PaymentIcon,
    PRODUCTION_DELAY: ScheduleIcon,
};

const notificationColors: Record<string, string> = {
    INFO: '#2196f3',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    SUCCESS: '#4caf50',
    LOW_STOCK: '#ff5722',
    QUALITY_ALERT: '#9c27b0',
    PAYMENT_DUE: '#00bcd4',
    PRODUCTION_DELAY: '#ff5722',
};

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: any;
}

export default function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            const deletedNotification = notifications.find((n) => n.id === id);
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Drawer anchor="right" open={open} onClose={handleClose}>
                <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NotificationsIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                Notifications
                            </Typography>
                            {unreadCount > 0 && (
                                <Chip label={unreadCount} size="small" color="error" sx={{ ml: 1 }} />
                            )}
                        </Box>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Actions */}
                    {unreadCount > 0 && (
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Button
                                startIcon={<DoneAllIcon />}
                                onClick={handleMarkAllAsRead}
                                size="small"
                                fullWidth
                            >
                                Mark all as read
                            </Button>
                        </Box>
                    )}

                    {/* Notifications List */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : notifications.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No notifications
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    You're all caught up!
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {notifications.map((notification, index) => {
                                    const Icon = notificationIcons[notification.type] || InfoIcon;
                                    const color = notificationColors[notification.type] || '#2196f3';

                                    return (
                                        <Box key={notification.id}>
                                            <ListItem
                                                sx={{
                                                    bgcolor: notification.read ? 'transparent' : 'action.selected',
                                                    py: 2,
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                }}
                                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(notification.id);
                                                        }}
                                                        size="small"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: `${color}20`, color }}>
                                                        <Icon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {notification.title}
                                                            </Typography>
                                                            {!notification.read && (
                                                                <Box
                                                                    sx={{
                                                                        width: 8,
                                                                        height: 8,
                                                                        borderRadius: '50%',
                                                                        bgcolor: 'primary.main',
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                {notification.message}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {formatTime(notification.createdAt)}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            {index < notifications.length - 1 && <Divider />}
                                        </Box>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
