import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent, CardMedia, CardActions,
    Button, Chip, Tabs, Tab, IconButton, CircularProgress, Divider, List, ListItem,
    ListItemButton, ListItemText, Avatar, Alert, useTheme, alpha, TextField, InputAdornment,
    Collapse, Drawer, useMediaQuery, Stack, Tooltip
} from '@mui/material';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import RedditIcon from '@mui/icons-material/Reddit';
import CodeIcon from '@mui/icons-material/Code'; // For HN
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PublicIcon from '@mui/icons-material/Public';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FactoryIcon from '@mui/icons-material/Factory';
import GavelIcon from '@mui/icons-material/Gavel';
import ScienceIcon from '@mui/icons-material/Science';
import MenuIcon from '@mui/icons-material/Menu';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RecyclingIcon from '@mui/icons-material/Recycling';
import BusinessIcon from '@mui/icons-material/Business';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import FlagIcon from '@mui/icons-material/Flag';

import { http } from '../lib/http';

// ============================================
// TYPES
// ============================================

interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    url: string;
    imageUrl?: string;
    source: string;
    sourceType: string;
    sourceLogo?: string;
    pillar: string;
    category: string;
    sectors: string[];
    priority: string;
    regions: {
        cities: string[];
        countries: string[];
        continents: string[];
        states?: string[];
    };
    tags: string[];
    publishedAt: string;
    readTime?: number;
    engagement?: { views?: number; comments?: number };
}

interface SocialPost {
    id: string;
    platform: string;
    title: string;
    url: string;
    author: string;
    upvotes: number;
    comments: number;
    subreddit?: string;
}

interface TrendingTopic {
    topic: string;
    hashtag: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
}

interface RegionNode {
    id: string;
    name: string;
    type: string;
    articleCount: number;
    children?: RegionNode[];
}

interface SectorStat {
    sector: string;
    count: number;
}

// ============================================
// CONSTANTS
// ============================================

const PILLARS = [
    { id: 'all', label: 'All Intelligence', icon: <PublicIcon /> },
    { id: 'Market Intelligence', label: 'Markets', icon: <ShowChartIcon /> },
    { id: 'Policy & Trade', label: 'Policy & Trade', icon: <GavelIcon /> },
    { id: 'Business & Investments', label: 'Business', icon: <BusinessIcon /> },
    { id: 'Innovation & Tech', label: 'Innovation', icon: <ScienceIcon /> },
    { id: 'Sustainability & Compliance', label: 'Sustainability', icon: <RecyclingIcon /> },
    { id: 'Cluster Spotlight', label: 'Cluster Spotlight', icon: <LocationCityIcon /> }
];

const PRIORITY_COLORS: Record<string, string> = {
    breaking: '#d32f2f',
    high: '#f57c00',
    medium: '#1976d2',
    low: '#757575'
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function TextilePulsePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    // State
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [breaking, setBreaking] = useState<NewsArticle[]>([]);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [trending, setTrending] = useState<TrendingTopic[]>([]);
    const [regions, setRegions] = useState<RegionNode[]>([]);
    const [sectors, setSectors] = useState<SectorStat[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Filters
    const [activePillar, setActivePillar] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState<{ name: string, type: string } | null>(null);
    const [selectedSector, setSelectedSector] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['Asia', 'India', 'Europe']));

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // ============================================
    // DATA FETCHING
    // ============================================

    const fetchData = useCallback(async (forceRefresh = false) => {
        try {
            if (forceRefresh) {
                setRefreshing(true);
                await http.post('/news-intelligence/refresh');
            }

            const params = new URLSearchParams();
            if (activePillar !== 'all') params.append('pillar', activePillar);

            // Handle region filter smartly
            if (selectedRegion) {
                if (selectedRegion.type === 'country') params.append('country', selectedRegion.name);
                else if (selectedRegion.type === 'city') params.append('city', selectedRegion.name);
                else if (selectedRegion.type === 'continent') params.append('search', selectedRegion.name); // loose match
            }

            if (selectedSector) params.append('sector', selectedSector);
            if (searchQuery) params.append('search', searchQuery);
            params.append('limit', '50');

            const [feedRes, breakingRes, socialRes, trendingRes, regionsRes, sectorsRes] = await Promise.all([
                http.get(`/news-intelligence/feed?${params.toString()}`),
                http.get('/news-intelligence/breaking'),
                http.get('/news-intelligence/social?limit=5'),
                http.get('/news-intelligence/trending'),
                http.get('/news-intelligence/regions'),
                http.get('/news-intelligence/sectors')
            ]);

            setArticles(feedRes.data.data || []);
            setBreaking(breakingRes.data.data || []);
            setSocialPosts(socialRes.data.data || []);
            setTrending(trendingRes.data.data || []);
            setRegions(regionsRes.data.data || []);
            setSectors(sectorsRes.data.data || []);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Error fetching TextilePulse data:', err);
            setError('Failed to load intelligence. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activePillar, selectedRegion, selectedSector, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleRefresh = () => fetchData(true);
    const handlePillarChange = (_: any, value: string) => setActivePillar(value);

    const handleRegionClick = (name: string, type: string) => {
        setSelectedRegion(selectedRegion?.name === name ? null : { name, type });
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const clearFilters = () => {
        setActivePillar('all');
        setSelectedRegion(null);
        setSelectedSector(null);
        setSearchQuery('');
    };

    // ============================================
    // RENDER: SIDEBAR (REGION TREE)
    // ============================================

    const renderRegionNode = (node: RegionNode, level = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const isSelected = selectedRegion?.name === node.name;

        return (
            <React.Fragment key={node.id}>
                <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                        handleRegionClick(node.name, node.type);
                        if (hasChildren) toggleExpand(node.id);
                    }}
                    sx={{
                        pl: level * 2 + 2,
                        py: 0.5,
                        borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent'
                    }}
                >
                    <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                        {node.type === 'continent' && <PublicIcon fontSize="small" color="disabled" />}
                        {node.type === 'country' && <FlagIcon fontSize="small" color="primary" />}
                        {node.type === 'city' && <LocationCityIcon fontSize="small" color="action" />}
                    </Box>
                    <ListItemText
                        primary={node.name}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400 }}
                    />
                    <Chip label={node.articleCount} size="small" sx={{ height: 16, fontSize: 10, minWidth: 20 }} />
                    {hasChildren && (
                        <Box onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}>
                            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </Box>
                    )}
                </ListItemButton>
                <Collapse in={isExpanded}>
                    <List component="div" disablePadding dense>
                        {node.children?.map(child => renderRegionNode(child, level + 1))}
                    </List>
                </Collapse>
            </React.Fragment>
        );
    };

    const renderSidebar = () => (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto', bgcolor: 'transparent' }}>
            {/* Search */}
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth size="small" placeholder="Search TextilePulse..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                    }}
                />
            </Box>
            <Divider />

            {/* Geographical Hierarchy */}
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicIcon fontSize="inherit" /> GEOGRAPHIC PULSE
            </Typography>
            <List dense disablePadding>
                {regions.map(r => renderRegionNode(r))}
            </List>
            <Divider sx={{ my: 1 }} />

            {/* Sectors */}
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FactoryIcon fontSize="inherit" /> SECTORS
            </Typography>
            <Box sx={{ px: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {sectors.slice(0, 15).map(s => (
                    <Chip
                        key={s.sector} label={`${s.sector} (${s.count})`}
                        size="small" onClick={() => setSelectedSector(selectedSector === s.sector ? null : s.sector)}
                        color={selectedSector === s.sector ? 'primary' : 'default'}
                        variant={selectedSector === s.sector ? 'filled' : 'outlined'}
                        sx={{ fontSize: 11, borderRadius: 1 }}
                    />
                ))}
            </Box>

            <Box sx={{ mt: 4, px: 2 }}>
                <Button size="small" fullWidth variant="outlined" color="inherit" onClick={clearFilters}>
                    Clear All Filters
                </Button>
            </Box>
        </Box>
    );

    // ============================================
    // RENDER: MAIN CONTENT
    // ============================================

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f4f6f8' }}>
            {/* Mobile Sidebar */}
            <Drawer
                variant="temporary" open={sidebarOpen && isMobile} onClose={() => setSidebarOpen(false)}
                sx={{ display: { xs: 'block', md: 'none' } }}
            >
                <Box sx={{ width: 280 }}>{renderSidebar()}</Box>
            </Drawer>

            {/* Desktop Sidebar */}
            {!isMobile && (
                <Paper
                    elevation={0}
                    sx={{
                        width: 280, flexShrink: 0,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        display: { xs: 'none', md: 'block' }
                    }}
                >
                    {renderSidebar()}
                </Paper>
            )}

            {/* Content Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, md: 3 } }}>
                <Container maxWidth="xl" disableGutters>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isMobile && <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>}
                                <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                                    Textile<Box component="span" sx={{ color: theme.palette.primary.main }}>Pulse</Box>
                                </Typography>
                                <Chip label="BETA" size="small" color="primary" sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Central Intelligence for the Global Fabric Economy
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {lastUpdated &&
                                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, alignSelf: 'center' }}>
                                    Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            }
                            <IconButton onClick={handleRefresh} disabled={refreshing} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Breaking News Ticker */}
                    {breaking.length > 0 && (
                        <Paper
                            variant="outlined"
                            sx={{
                                mb: 3, p: 1, px: 2,
                                display: 'flex', alignItems: 'center', gap: 2,
                                borderColor: alpha(theme.palette.error.main, 0.3),
                                bgcolor: alpha(theme.palette.error.main, 0.05)
                            }}
                        >
                            <Chip label="BREAKING" color="error" size="small" sx={{ fontWeight: 'bold', borderRadius: 0.5 }} />
                            <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1 }}>
                                <Typography variant="body2" component="span" fontWeight="500">
                                    {breaking[0].title}
                                </Typography>
                            </Box>
                            <Button
                                size="small" color="error" endIcon={<OpenInNewIcon />}
                                href={breaking[0].url} target="_blank"
                            >
                                Read
                            </Button>
                        </Paper>
                    )}

                    {/* Pillars Navigation */}
                    <Tabs
                        value={activePillar}
                        onChange={handlePillarChange}
                        variant="scrollable" scrollButtons="auto"
                        sx={{
                            mb: 3,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 }
                        }}
                    >
                        {PILLARS.map(p => (
                            <Tab key={p.id} value={p.id} label={p.label} icon={p.icon} iconPosition="start" />
                        ))}
                    </Tabs>

                    {/* Active Filters */}
                    {(selectedRegion || selectedSector) && (
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            {selectedRegion && <Chip label={`Region: ${selectedRegion.name}`} onDelete={() => setSelectedRegion(null)} color="primary" variant="outlined" />}
                            {selectedSector && <Chip label={`Sector: ${selectedSector}`} onDelete={() => setSelectedSector(null)} color="secondary" variant="outlined" />}
                        </Stack>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Main Feed */}
                            <Grid item xs={12} lg={9}>
                                <Grid container spacing={3}>
                                    {articles.map((article, index) => (
                                        <Grid item xs={12} md={index === 0 ? 12 : 6} lg={index === 0 ? 12 : 4} key={article.id}>
                                            <Card
                                                elevation={0}
                                                variant="outlined"
                                                sx={{
                                                    height: '100%', display: 'flex', flexDirection: index === 0 ? { xs: 'column', md: 'row' } : 'column',
                                                    '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)' },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {article.imageUrl && (
                                                    <CardMedia
                                                        component="img"
                                                        image={article.imageUrl}
                                                        alt={article.title}
                                                        sx={{
                                                            width: index === 0 ? { xs: '100%', md: 400 } : '100%',
                                                            height: index === 0 ? { xs: 200, md: 'auto' } : 180,
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                )}
                                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <Chip label={article.pillar} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }} color={article.priority === 'breaking' ? 'error' : 'default'} />
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                                                            {new Date(article.publishedAt).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>

                                                    <Typography
                                                        variant={index === 0 ? 'h5' : 'subtitle1'}
                                                        fontWeight="bold"
                                                        gutterBottom
                                                        sx={{
                                                            lineHeight: 1.3, cursor: 'pointer',
                                                            '&:hover': { color: theme.palette.primary.main }
                                                        }}
                                                        onClick={() => window.open(article.url, '_blank')}
                                                    >
                                                        {article.title}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, display: '-webkit-box', WebkitLineClamp: index === 0 ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {article.summary}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {article.sourceLogo && <Avatar src={article.sourceLogo} sx={{ width: 16, height: 16 }} />}
                                                            <Typography variant="caption" fontWeight="bold">{article.source}</Typography>
                                                        </Box>

                                                        {article.regions.cities.length > 0 && (
                                                            <Chip
                                                                icon={<LocationCityIcon sx={{ fontSize: '12px !important' }} />}
                                                                label={article.regions.cities[0]}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ height: 20, fontSize: 10 }}
                                                            />
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>

                            {/* Right Sidebar Widgets */}
                            <Grid item xs={12} lg={3}>
                                <Stack spacing={3}>
                                    {/* Trending Topics */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrendingUpIcon color="error" /> TRENDING NOW
                                        </Typography>
                                        <List disablePadding dense>
                                            {trending.slice(0, 8).map((t, i) => (
                                                <ListItem key={t.topic} disablePadding sx={{ py: 0.5 }}>
                                                    <Typography variant="caption" sx={{ width: 20, color: 'text.secondary' }}>{i + 1}</Typography>
                                                    <ListItemText
                                                        primary={t.hashtag}
                                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                    />
                                                    {t.trend === 'up' && <TrendingUpIcon fontSize="small" color="success" />}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>

                                    {/* Community Pulse */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CommentIcon color="primary" /> COMMUNITY PULSE
                                        </Typography>
                                        <Stack spacing={2}>
                                            {socialPosts.map(post => (
                                                <Box key={post.id} onClick={() => window.open(post.url, '_blank')} sx={{ cursor: 'pointer', '&:hover h6': { color: theme.palette.primary.main } }}>
                                                    <Typography variant="subtitle2" sx={{ lineHeight: 1.2, mb: 0.5, fontSize: '0.85rem' }}>
                                                        {post.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {post.platform === 'reddit' ? <RedditIcon sx={{ fontSize: 12, color: '#FF4500' }} /> : <CodeIcon sx={{ fontSize: 12, color: '#ff6600' }} />}
                                                            {post.author}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ThumbUpIcon sx={{ fontSize: 12 }} /> {post.upvotes}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>

                                    {/* Market Ticker Placeholder */}
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.1) : '#e8f5e9' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'success.main' }}>
                                            MARKET MOVERS (LIVE)
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption">Cotlook A Index</Typography>
                                                <Typography variant="caption" fontWeight="bold" color="success.main">95.45 (+0.5%)</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption">Polyester Staple</Typography>
                                                <Typography variant="caption" fontWeight="bold" color="error.main">102.1 (-0.2%)</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption">Cotton Yarn 30s</Typography>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">₹265/kg (0%)</Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </Box>
        </Box>
    );
}
