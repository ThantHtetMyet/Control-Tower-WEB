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
    CardMedia,
    Tooltip,
    Snackbar
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
    const [showCopyToast, setShowCopyToast] = useState(false);

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

    const handleWhatsAppShare = () => {
        const currentUrl = window.location.href;
        const shareText = `Check out this news article: ${news.title}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = async () => {
        const currentUrl = window.location.href;
        
        try {
            await navigator.clipboard.writeText(currentUrl);
            setShowCopyToast(true);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setShowCopyToast(true);
        }
    };

    const handleCloseToast = () => {
        setShowCopyToast(false);
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

    // Custom WhatsApp SVG Icon Component
    const WhatsAppIcon = () => (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
        </svg>
    );

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
                        {/* Share Actions */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Share on WhatsApp">
                                <IconButton 
                                    onClick={handleWhatsAppShare}
                                    sx={{ 
                                        color: '#25D366',
                                        '&:hover': {
                                            backgroundColor: 'rgba(37, 211, 102, 0.1)'
                                        }
                                    }}
                                >
                                    <WhatsAppIcon />
                                </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Copy link">
                                <IconButton onClick={handleShare}>
                                    <ShareIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        
                        {/* Comments and Reactions Count */}
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

            {/* Toast Notification */}
            <Snackbar
                open={showCopyToast}
                autoHideDuration={3000}
                onClose={handleCloseToast}
                message="Link copied to clipboard!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
}

export default NewsDetail;