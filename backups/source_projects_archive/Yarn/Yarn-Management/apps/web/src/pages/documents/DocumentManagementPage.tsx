import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Chip,
    IconButton,
    Breadcrumbs,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import {
    Folder,
    File,
    Plus,
    Upload,
    FolderPlus,
    Download,
    Eye,
    Clock,
    FileText,
    Shield
} from 'lucide-react';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const DocumentManagementPage = () => {
    const [currentFolder, setCurrentFolder] = useState<any>(null);
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [newDocument, setNewDocument] = useState({
        name: '',
        description: '',
        documentType: 'OTHER',
        accessLevel: 'INTERNAL'
    });

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [currentFolder]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [foldersRes, docsRes] = await Promise.all([
                http.get('/documents/folders', {
                    params: { parentId: currentFolder?.id }
                }),
                http.get('/documents/documents', {
                    params: { folderId: currentFolder?.id }
                })
            ]);
            setFolders(foldersRes.data.folders);
            setDocuments(docsRes.data.documents);
        } catch (error) {
            notify.showError('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await http.get('/documents/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleCreateFolder = async () => {
        try {
            await http.post('/documents/folders', {
                name: newFolderName,
                parentId: currentFolder?.id,
                createdBy: 'current-user'
            });
            notify.showSuccess('Folder created successfully');
            setCreateFolderOpen(false);
            setNewFolderName('');
            fetchData();
        } catch (error) {
            notify.showError('Failed to create folder');
        }
    };

    const handleCreateDocument = async () => {
        try {
            await http.post('/documents/documents', {
                ...newDocument,
                folderId: currentFolder?.id,
                uploadedBy: 'current-user'
            });
            notify.showSuccess('Document created successfully');
            setUploadDialogOpen(false);
            setNewDocument({
                name: '',
                description: '',
                documentType: 'OTHER',
                accessLevel: 'INTERNAL'
            });
            fetchData();
        } catch (error) {
            notify.showError('Failed to create document');
        }
    };

    const getDocumentIcon = (type: string) => {
        switch (type) {
            case 'CONTRACT': return <FileText size={20} color="#1976d2" />;
            case 'CERTIFICATE': return <Shield size={20} color="#2e7d32" />;
            case 'INVOICE': return <File size={20} color="#ed6c02" />;
            default: return <File size={20} />;
        }
    };

    const getAccessLevelColor = (level: string) => {
        switch (level) {
            case 'PUBLIC': return 'success';
            case 'INTERNAL': return 'info';
            case 'CONFIDENTIAL': return 'warning';
            case 'RESTRICTED': return 'error';
            default: return 'default';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Folder size={28} style={{ marginRight: 12 }} />
                    <Typography variant="h4">Document Management</Typography>
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<FolderPlus size={18} />}
                        onClick={() => setCreateFolderOpen(true)}
                        sx={{ mr: 1 }}
                    >
                        New Folder
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Upload size={18} />}
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        Upload Document
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Total Documents</Typography>
                            <Typography variant="h3">{stats.totalDocuments || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Folders</Typography>
                            <Typography variant="h3">{stats.totalFolders || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Total Size</Typography>
                            <Typography variant="h3">{formatFileSize(stats.totalSize || 0)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Contracts</Typography>
                            <Typography variant="h3">{stats.byType?.CONTRACT || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {currentFolder && (
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link
                        component="button"
                        variant="body1"
                        onClick={() => setCurrentFolder(null)}
                        sx={{ cursor: 'pointer' }}
                    >
                        Root
                    </Link>
                    <Typography color="text.primary">{currentFolder.name}</Typography>
                </Breadcrumbs>
            )}

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Folders</Typography>
                    <List>
                        {folders.map((folder: any) => (
                            <ListItemButton
                                key={folder.id}
                                onClick={() => setCurrentFolder(folder)}
                            >
                                <ListItemIcon>
                                    <Folder size={24} color="#1976d2" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={folder.name}
                                    secondary={`${folder._count.documents} documents, ${folder._count.children} subfolders`}
                                />
                            </ListItemButton>
                        ))}
                        {folders.length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary="No folders"
                                    secondary="Create a new folder to organize your documents"
                                />
                            </ListItem>
                        )}
                    </List>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Documents</Typography>
                    <List>
                        {documents.map((doc: any) => (
                            <ListItem
                                key={doc.id}
                                secondaryAction={
                                    <Box>
                                        <IconButton size="small">
                                            <Eye size={18} />
                                        </IconButton>
                                        <IconButton size="small">
                                            <Download size={18} />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemIcon>
                                    {getDocumentIcon(doc.documentType)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {doc.name}
                                            <Chip
                                                label={doc.accessLevel}
                                                size="small"
                                                color={getAccessLevelColor(doc.accessLevel) as any}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                                            <Typography variant="caption">
                                                v{doc.currentVersion}
                                            </Typography>
                                            <Typography variant="caption">
                                                {formatFileSize(doc.fileSize)}
                                            </Typography>
                                            <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                                                <Clock size={12} />
                                                {new Date(doc.updatedAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                        {documents.length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary="No documents"
                                    secondary="Upload a document to get started"
                                />
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>

            {/* Create Folder Dialog */}
            <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)}>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Folder Name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateFolder}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Upload Document Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Document Name"
                        value={newDocument.name}
                        onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Description"
                        value={newDocument.description}
                        onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Document Type"
                        value={newDocument.documentType}
                        onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="CONTRACT">Contract</MenuItem>
                        <MenuItem value="CERTIFICATE">Certificate</MenuItem>
                        <MenuItem value="INVOICE">Invoice</MenuItem>
                        <MenuItem value="REPORT">Report</MenuItem>
                        <MenuItem value="POLICY">Policy</MenuItem>
                        <MenuItem value="PROCEDURE">Procedure</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        select
                        label="Access Level"
                        value={newDocument.accessLevel}
                        onChange={(e) => setNewDocument({ ...newDocument, accessLevel: e.target.value })}
                    >
                        <MenuItem value="PUBLIC">Public</MenuItem>
                        <MenuItem value="INTERNAL">Internal</MenuItem>
                        <MenuItem value="CONFIDENTIAL">Confidential</MenuItem>
                        <MenuItem value="RESTRICTED">Restricted</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateDocument}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DocumentManagementPage;
