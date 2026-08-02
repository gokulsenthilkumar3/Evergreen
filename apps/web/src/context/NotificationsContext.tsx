import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    Badge, IconButton, Tooltip, Box, Typography, Divider, Button,
    Drawer, List, ListItem, ListItemText, Avatar, Chip, Fade,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    DoneAll as MarkAllReadIcon,
    DeleteSweep as ClearAllIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NotificationsNone as EmptyIcon,
    ArrowForward as NavIcon,
} from '@mui/icons-material';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string;   // ISO string — serialisable for localStorage
    read: boolean;
    link?: string;       // page key to navigate to
    dedupeKey?: string;  // used by useNotificationSync to prevent duplicates
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'evergreen-notifications';
const MAX_STORED = 50;

function loadFromStorage(): Notification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Notification[]) : [];
    } catch {
        return [];
    }
}

function saveToStorage(notifications: Notification[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
    } catch { /* ignore quota errors */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(loadFromStorage);

    // Persist every change to localStorage
    useEffect(() => {
        saveToStorage(notifications);
    }, [notifications]);

    const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        setNotifications(prev => {
            // Deduplicate by dedupeKey if provided
            if (n.dedupeKey && prev.some(p => p.dedupeKey === n.dedupeKey)) return prev;
            const newN: Notification = {
                ...n,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                timestamp: new Date().toISOString(),
                read: false,
            };
            return [newN, ...prev].slice(0, MAX_STORED);
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationsContext.Provider
            value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

// ─── UI Helpers ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
    info:    { icon: <InfoIcon fontSize="small" />,    color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    success: { icon: <SuccessIcon fontSize="small" />, color: '#059669', bg: 'rgba(5,150,105,0.12)' },
    warning: { icon: <WarningIcon fontSize="small" />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    error:   { icon: <ErrorIcon fontSize="small" />,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Bell + Drawer Component ──────────────────────────────────────────────────

interface NotificationsBellProps {
    onNavigate?: (page: string) => void;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({ onNavigate }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);

    const unread = notifications.filter(n => !n.read);
    const read   = notifications.filter(n =>  n.read);

    const handleItemClick = (n: Notification) => {
        markAsRead(n.id);
        if (n.link && onNavigate) {
            onNavigate(n.link);
            setOpen(false);
        }
    };

    const NotifItem = ({ n }: { n: Notification }) => {
        const cfg = TYPE_CONFIG[n.type];
        return (
            <Fade in timeout={300}>
                <ListItem
                    disablePadding
                    sx={{
                        px: 2, py: 1.2,
                        bgcolor: n.read ? 'transparent' : cfg.bg,
                        borderLeft: `3px solid ${n.read ? 'transparent' : cfg.color}`,
                        cursor: n.link ? 'pointer' : 'default',
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: 'action.hover' },
                        position: 'relative',
                        gap: 1.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                    }}
                    onClick={() => handleItemClick(n)}
                >
                    <Avatar
                        sx={{
                            width: 34, height: 34, mt: 0.3, flexShrink: 0,
                            bgcolor: cfg.bg, color: cfg.color,
                        }}
                    >
                        {cfg.icon}
                    </Avatar>

                    <ListItemText
                        disableTypography
                        primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: n.read ? 500 : 700, fontSize: '0.82rem', lineHeight: 1.3 }}
                                    noWrap
                                >
                                    {n.title}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: '0.68rem' }}>
                                    {formatTime(n.timestamp)}
                                </Typography>
                            </Box>
                        }
                        secondary={
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4, mt: 0.3 }}>
                                    {n.message}
                                </Typography>
                                {n.link && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.5 }}>
                                        <NavIcon sx={{ fontSize: 12, color: cfg.color }} />
                                        <Typography variant="caption" sx={{ color: cfg.color, fontSize: '0.7rem', fontWeight: 600 }}>
                                            Go to {n.link}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        }
                    />

                    {/* Dismiss button */}
                    <IconButton
                        size="small"
                        sx={{
                            position: 'absolute', top: 6, right: 6,
                            opacity: 0, transition: 'opacity 0.15s',
                            '.MuiListItem-root:hover &': { opacity: 1 },
                            p: 0.3,
                        }}
                        onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                    >
                        <CloseIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                </ListItem>
            </Fade>
        );
    };

    return (
        <>
            <Tooltip title="Notifications" arrow>
                <IconButton onClick={() => setOpen(true)} sx={{ p: 0.5 }}>
                    <Badge
                        badgeContent={unreadCount > 0 ? unreadCount : undefined}
                        color="error"
                        max={99}
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                minWidth: 17,
                                height: 17,
                                animation: unreadCount > 0 ? 'pulse 1.8s ease-in-out infinite' : 'none',
                                '@keyframes pulse': {
                                    '0%, 100%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.18)' },
                                },
                            },
                        }}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '92vw', sm: 390 },
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2.5, py: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={700} fontSize="1rem">Notifications</Typography>
                        {unreadCount > 0 && (
                            <Chip
                                label={unreadCount}
                                size="small"
                                color="error"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {unreadCount > 0 && (
                            <Tooltip title="Mark all as read">
                                <IconButton size="small" onClick={markAllAsRead}>
                                    <MarkAllReadIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {notifications.length > 0 && (
                            <Tooltip title="Clear all">
                                <IconButton size="small" onClick={clearAll}>
                                    <ClearAllIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Close">
                            <IconButton size="small" onClick={() => setOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Body */}
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center', px: 3 }}>
                            <EmptyIcon sx={{ fontSize: 52, color: 'text.disabled', opacity: 0.4, mb: 1 }} />
                            <Typography color="text.secondary" fontWeight={500}>All caught up!</Typography>
                            <Typography variant="caption" color="text.disabled">
                                Alerts for low stock, overdue invoices, and production will appear here.
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {/* Unread section */}
                            {unread.length > 0 && (
                                <>
                                    <Box sx={{ px: 2, py: 0.8, bgcolor: 'action.hover' }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            New · {unread.length}
                                        </Typography>
                                    </Box>
                                    {unread.map(n => <NotifItem key={n.id} n={n} />)}
                                </>
                            )}

                            {/* Read section */}
                            {read.length > 0 && (
                                <>
                                    {unread.length > 0 && <Divider />}
                                    <Box sx={{ px: 2, py: 0.8, bgcolor: 'action.hover' }}>
                                        <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Earlier · {read.length}
                                        </Typography>
                                    </Box>
                                    {read.map(n => <NotifItem key={n.id} n={n} />)}
                                </>
                            )}
                        </List>
                    )}
                </Box>

                {/* Footer */}
                {notifications.length > 0 && (
                    <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                        <Button
                            fullWidth
                            size="small"
                            variant="text"
                            color="inherit"
                            startIcon={<ClearAllIcon />}
                            onClick={clearAll}
                            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}
                        >
                            Clear all notifications
                        </Button>
                    </Box>
                )}
            </Drawer>
        </>
    );
};

export default NotificationsBell;
