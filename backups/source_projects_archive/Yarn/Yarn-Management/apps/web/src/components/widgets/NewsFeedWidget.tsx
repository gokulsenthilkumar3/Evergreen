import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    CircularProgress,
    Button
} from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { http } from '../../lib/http';

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    category: string;
    relevanceScore: number;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    businessImpact: string;
    publishedAt: string;
}

const NewsFeedWidget = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        if (news.length === 0) fetchNews();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await http.get('/news-intelligence/feed?limit=5&priority=high');
            // Adapt API response to widget format
            const articles = res.data.data || [];
            setNews(articles.map((a: any) => ({
                id: a.id,
                title: a.title,
                summary: a.summary || a.content?.substring(0, 100) + '...',
                category: a.category || 'Industry',
                relevanceScore: a.relevanceScore || 85,
                businessImpact: a.pillar || 'Market Intelligence', // Use pillar as impact context
                publishedAt: a.publishedAt,
                sentiment: 'NEUTRAL' // Default
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={news.length} color="secondary">
                    <FeedIcon />
                </Badge>
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            AI Market Intelligence
                        </Typography>
                        <Button size="small" sx={{ color: 'white' }} onClick={fetchNews} startIcon={<AutoAwesomeIcon />}>
                            Refresh
                        </Button>
                    </Box>
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                    ) : (
                        <List>
                            {news.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No breaking news found.</Typography>
                                </Box>
                            ) : news.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip label={item.category} size="small" color={item.category === 'Breaking' ? 'error' : 'primary'} />
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(item.publishedAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {item.summary}
                                        </Typography>

                                        <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <AutoAwesomeIcon fontSize="small" color="secondary" />
                                            <Typography variant="caption" fontWeight="bold" color="secondary.main">
                                                Context: {item.businessImpact}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                    {index < news.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NewsFeedWidget;
