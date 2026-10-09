import { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Chip,
    ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import FactoryIcon from '@mui/icons-material/Factory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const typeIcons: Record<string, any> = {
    supplier: BusinessIcon,
    raw_material: InventoryIcon,
    batch: FactoryIcon,
    invoice: ReceiptIcon,
    finished_good: CheckCircleIcon,
};

const typeColors: Record<string, string> = {
    supplier: '#3b82f6',
    raw_material: '#8b5cf6',
    batch: '#f59e0b',
    invoice: '#10b981',
    finished_good: '#06b6d4',
};

const typeLabels: Record<string, string> = {
    supplier: 'Supplier',
    raw_material: 'Raw Material',
    batch: 'Production Batch',
    invoice: 'Invoice',
    finished_good: 'Finished Good',
};

const typeRoutes: Record<string, string> = {
    supplier: '/suppliers',
    raw_material: '/procurement',
    batch: '/manufacturing',
    invoice: '/billing',
    finished_good: '/inventory',
};

interface SearchResult {
    id: string;
    type: string;
    title: string;
    subtitle: string;
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Load history
    useEffect(() => {
        const saved = localStorage.getItem('search_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved).slice(0, 5));
            } catch (e) { console.error(e); }
        }
    }, []);

    const addToHistory = (term: string) => {
        if (!term.trim()) return;
        const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
    };

    const clearHistory = (e: React.MouseEvent) => {
        e.stopPropagation();
        setHistory([]);
        localStorage.removeItem('search_history');
    };

    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const response = await api.get(`/search?q=${encodeURIComponent(query)}&limit=10`);
                    setResults(response.data.results);
                    setShowResults(true);
                    // Don't add to history automatically on type, only on click/enter ideally. 
                    // But for now, we leave it. We'll add on selection.
                } catch (error) {
                    console.error('Search failed:', error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                // Show history if initialized
                setShowResults(query === '');
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [query]);

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    const handleResultClick = (result: SearchResult) => {
        addToHistory(result.title); // Or query? Let's save the result title or the current query if matches.
        // Actually saving the query string is better for "Recent Searches" content reuse.
        if (query) addToHistory(query);

        const route = typeRoutes[result.type];
        if (route) {
            navigate(route);
            handleClear();
        }
    };

    const handleHistoryClick = (term: string) => {
        setQuery(term);
        // Will trigger effect
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    const openPanel = () => {
        setShowResults(true);
    };

    return (
        <ClickAwayListener onClickAway={() => setShowResults(false)}>
            <Box sx={{ position: 'relative', width: { xs: '100%', sm: 400 } }} ref={searchRef}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={openPanel}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: query && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClear}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: { bgcolor: 'background.paper', borderRadius: 2 },
                    }}
                />

                {showResults && (query.length >= 2 || (query === '' && history.length > 0)) && (
                    <Paper
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            mt: 1,
                            maxHeight: 400,
                            overflow: 'auto',
                            zIndex: 1300,
                            boxShadow: 3,
                            bgcolor: 'background.paper', // explicitly for dark mode
                            backgroundImage: 'none'
                        }}
                    >
                        {/* History Section */}
                        {query === '' && history.length > 0 && (
                            <Box>
                                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        RECENT SEARCHES
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="primary"
                                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                        onClick={clearHistory}
                                    >
                                        Clear
                                    </Typography>
                                </Box>
                                <List dense sx={{ py: 0 }}>
                                    {history.map((term, i) => (
                                        <ListItem
                                            key={i}
                                            disablePadding
                                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                        >
                                            <ListItemButton onClick={() => handleHistoryClick(term)}>
                                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                                    <SearchIcon fontSize="small" color="action" />
                                                </ListItemAvatar>
                                                <ListItemText primary={term} primaryTypographyProps={{ variant: 'body2' }} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {/* Results Section */}
                        {loading ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Searching...
                                </Typography>
                            </Box>
                        ) : results.length > 0 ? (
                            <List sx={{ py: 0 }}>
                                {results.map((result) => {
                                    const Icon = typeIcons[result.type] || SearchIcon;
                                    const color = typeColors[result.type] || '#64748b';
                                    const label = typeLabels[result.type] || 'Item';

                                    return (
                                        <ListItem
                                            key={`${result.type}-${result.id}`}
                                            component="div"
                                            onClick={() => handleResultClick(result)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'action.hover' },
                                                borderBottom: 1,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: `${color}20`, color }}>
                                                    <Icon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2" color="text.primary">{result.title}</Typography>
                                                        <Chip label={label} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    </Box>
                                                }
                                                secondary={result.subtitle}
                                                secondaryTypographyProps={{ color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        ) : query.length >= 2 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No results found for "{query}"
                                </Typography>
                            </Box>
                        ) : null}
                    </Paper>
                )}
            </Box>
        </ClickAwayListener>
    );
}
