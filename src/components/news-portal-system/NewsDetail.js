import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Chip,
    IconButton,
    Divider,
    Avatar,
    CircularProgress,
    Alert,
    Button,
    Card,
    CardMedia
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Visibility as ViewIcon,
    ThumbUp as ThumbUpIcon,
    Comment as CommentIcon,
    Share as ShareIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsBySlug, getNewsById } from '../api-services/newsPortalService';

function NewsDetail() {
    const { slug, id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                setLoading(true);
                let response;
                
                // Try to fetch by slug first, then by ID
                if (slug) {
                    response = await getNewsBySlug(slug);
                } else if (id) {
                    response = await getNewsById(id);
                }
                
                // Fix: Check response directly instead of response.data
                if (response) {
                    setNews(response);
                } else {
                    setError('News article not found');
                }
            } catch (err) {
                console.error('Error fetching news detail:', err);
                setError('Failed to load news article');
            } finally {
                setLoading(false);
            }
        };

        if (slug || id) {
            fetchNewsDetail();
        }
    }, [slug, id]);

    const handleBack = () => {
        navigate('/news-portal-system');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper function to get header image only (exclude thumbnails)
    const getHeaderImage = () => {
        if (!news.images || news.images.length === 0) return null;
        
        // Look for header-type image only, exclude thumbnails
        const headerImage = news.images.find(img => 
            img.name && 
            img.name.toLowerCase().includes('header') && 
            !img.name.toLowerCase().includes('thumbnail')
        );
        
        if (headerImage) {
            return headerImage.imageUrl;
        }
        
        // No fallback to featuredImageUrl since we don't want thumbnails
        return null;
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !news) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'News article not found'}
                </Alert>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Back to News List
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ mb: 2 }}
                >
                    Back to News List
                </Button>
            </Box>

            {/* Main Content */}
            <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                {/* Thumbnail Image - Properly sized */}
                {news.featuredImageUrl && (
                    <Card sx={{ mb: 0 }}>
                        <CardMedia
                            component="img"
                            sx={{
                                height: { xs: 250, sm: 350, md: 400 },
                                objectFit: 'cover',
                                width: '100%'
                            }}
                            image={news.featuredImageUrl}
                            alt={news.title}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </Card>
                )}

                {/* Header Image - Display header-type image instead of featured */}
                {getHeaderImage() && (
                    <Card sx={{ mb: 0 }}>
                        <CardMedia
                            component="img"
                            sx={{
                                height: { xs: 250, sm: 350, md: 400 },
                                objectFit: 'cover',
                                width: '100%'
                            }}
                            image={getHeaderImage()}
                            alt={news.title}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </Card>
                )}

                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Category and Status */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {news.categoryName && (
                            <Chip 
                                label={news.categoryName} 
                                color="primary" 
                                size="small"
                            />
                        )}
                        <Chip 
                            label={news.isPublished ? 'Published' : 'Draft'} 
                            color={news.isPublished ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>

                    {/* Title */}
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                            fontWeight: 'bold',
                            lineHeight: 1.2,
                            mb: 3
                        }}
                    >
                        {news.title}
                    </Typography>

                    {/* Meta Information */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 3, 
                        mb: 3,
                        flexWrap: 'wrap',
                        color: 'text.secondary'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon fontSize="small" />
                            <Typography variant="body2">
                                {formatDate(news.publishDate || news.createdDate)}
                            </Typography>
                        </Box>
                        
                        {news.createdByUserName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon fontSize="small" />
                                <Typography variant="body2">
                                    {news.createdByUserName}
                                </Typography>
                            </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ViewIcon fontSize="small" />
                            <Typography variant="body2">
                                {news.viewCount || 0} views
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Excerpt */}
                    {news.excerpt && (
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                mb: 3,
                                fontSize: '1.1rem',
                                lineHeight: 1.6
                            }}
                        >
                            {news.excerpt}
                        </Typography>
                    )}

                    {/* Content */}
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            lineHeight: 1.8,
                            fontSize: '1rem',
                            mb: 4,
                            '& p': {
                                mb: 2
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: news.description || 'No content available.' }}
                    />

                    <Divider sx={{ mb: 3 }} />

                    {/* Action Buttons */}
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {news.commentsCount > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    {news.commentsCount} comments
                                </Typography>
                            )}
                            {news.reactionsCount > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    {news.reactionsCount} reactions
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default NewsDetail;
