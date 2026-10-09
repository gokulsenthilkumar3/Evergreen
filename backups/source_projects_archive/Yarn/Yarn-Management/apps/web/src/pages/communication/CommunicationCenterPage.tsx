import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Grid,
    Card,
    CardContent,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Badge
} from '@mui/material';
import { MessageSquare, Send, Bell, Plus } from 'lucide-react';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const CommunicationCenterPage = () => {
    const [messages, setMessages] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [composeDialogOpen, setComposeDialogOpen] = useState(false);
    const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
    const [newMessage, setNewMessage] = useState({
        recipientId: '',
        subject: '',
        content: ''
    });
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        priority: 'NORMAL'
    });

    useEffect(() => {
        fetchMessages();
        fetchAnnouncements();
        fetchUnreadCount();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await http.get('/communication/messages', {
                params: { userId: 'current-user' }
            });
            setMessages(response.data.messages);
        } catch (error) {
            notify.showError('Failed to fetch messages');
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await http.get('/communication/announcements', {
                params: { isActive: true }
            });
            setAnnouncements(response.data.announcements);
        } catch (error) {
            notify.showError('Failed to fetch announcements');
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await http.get('/communication/messages/unread/count', {
                params: { userId: 'current-user' }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count');
        }
    };

    const handleSendMessage = async () => {
        try {
            await http.post('/communication/messages', {
                ...newMessage,
                senderId: 'current-user'
            });
            notify.showSuccess('Message sent successfully');
            setComposeDialogOpen(false);
            setNewMessage({ recipientId: '', subject: '', content: '' });
            fetchMessages();
        } catch (error) {
            notify.showError('Failed to send message');
        }
    };

    const handleCreateAnnouncement = async () => {
        try {
            await http.post('/communication/announcements', {
                ...newAnnouncement,
                publishedBy: 'current-user'
            });
            notify.showSuccess('Announcement created successfully');
            setAnnouncementDialogOpen(false);
            setNewAnnouncement({ title: '', content: '', priority: 'NORMAL' });
            fetchAnnouncements();
        } catch (error) {
            notify.showError('Failed to create announcement');
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await http.post(`/communication/messages/${id}/read`);
            fetchMessages();
            fetchUnreadCount();
        } catch (error) {
            notify.showError('Failed to mark as read');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'error';
            case 'HIGH': return 'warning';
            case 'NORMAL': return 'info';
            case 'LOW': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <MessageSquare size={28} style={{ marginRight: 12 }} />
                    <Typography variant="h4">Communication Center</Typography>
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Bell size={18} />}
                        onClick={() => setAnnouncementDialogOpen(true)}
                        sx={{ mr: 1 }}
                    >
                        New Announcement
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Send size={18} />}
                        onClick={() => setComposeDialogOpen(true)}
                    >
                        Compose Message
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper>
                        <Box p={2} borderBottom={1} borderColor="divider" display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6">Messages</Typography>
                            <Badge badgeContent={unreadCount} color="error">
                                <MessageSquare size={24} />
                            </Badge>
                        </Box>
                        <List>
                            {messages.map((message: any) => (
                                <ListItemButton
                                    key={message.id}
                                    onClick={() => !message.isRead && handleMarkAsRead(message.id)}
                                    sx={{
                                        bgcolor: message.isRead ? 'transparent' : 'action.hover',
                                        fontWeight: message.isRead ? 'normal' : 'bold'
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {message.subject || 'No Subject'}
                                                {!message.isRead && (
                                                    <Chip label="NEW" size="small" color="primary" />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {message.content.substring(0, 100)}...
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                            {messages.length === 0 && (
                                <ListItem>
                                    <ListItemText
                                        primary="No messages"
                                        secondary="Your inbox is empty"
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper>
                        <Box p={2} borderBottom={1} borderColor="divider">
                            <Typography variant="h6">Announcements</Typography>
                        </Box>
                        <List>
                            {announcements.map((announcement: any) => (
                                <ListItem key={announcement.id}>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {announcement.title}
                                                <Chip
                                                    label={announcement.priority}
                                                    size="small"
                                                    color={getPriorityColor(announcement.priority) as any}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {announcement.content.substring(0, 80)}...
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(announcement.publishedAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                            {announcements.length === 0 && (
                                <ListItem>
                                    <ListItemText
                                        primary="No announcements"
                                        secondary="No active announcements"
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Compose Message Dialog */}
            <Dialog open={composeDialogOpen} onClose={() => setComposeDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Compose Message</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Recipient ID"
                        value={newMessage.recipientId}
                        onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Subject"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Message"
                        value={newMessage.content}
                        onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setComposeDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSendMessage} startIcon={<Send size={16} />}>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Announcement Dialog */}
            <Dialog open={announcementDialogOpen} onClose={() => setAnnouncementDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Content"
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Priority"
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                        SelectProps={{ native: true }}
                    >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnnouncementDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateAnnouncement}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommunicationCenterPage;
