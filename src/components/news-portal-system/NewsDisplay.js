import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CardMedia, Chip, Button,
  Container, Avatar, IconButton, Paper, CardActionArea, Skeleton,
  Tooltip, Snackbar
} from '@mui/material';
import { AccessTime, Visibility, Share, BookmarkBorder, CalendarToday, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../api-services/newsPortalService';
import { newsPortalTheme } from './newsPortalTheme';

const NewsDisplay = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const navigate = useNavigate();

  // Modern gradient color schemes
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
  ];

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      const response = await getNews(1, 20, '', null, true);
      const newsItems = response.items || [];
      
      // Get featured news (first 3 items)
      setFeaturedNews(newsItems.slice(0, 3));
      // Get latest news (next 9 items for 3x3 grid)
      setLatestNews(newsItems.slice(3, 12));
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      year: date.getFullYear()
    };
  };

  // Share functionality
  const handleWhatsAppShare = (article, event) => {
    event.stopPropagation();
    const newsUrl = `${window.location.origin}/news-portal-system/news/${article.id}`;
    const shareText = `Check out this news article: ${article.title}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + newsUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async (article, event) => {
    event.stopPropagation();
    const newsUrl = `${window.location.origin}/news-portal-system/news/${article.id}`;
    
    try {
      await navigator.clipboard.writeText(newsUrl);
      setShowCopyToast(true);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = newsUrl;
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

  // Custom WhatsApp SVG Icon Component
  const WhatsAppIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
    </svg>
  );

  // Featured News Card Component
  const FeaturedCard = ({ article, index }) => {
    const dateInfo = formatDate(article.createdDate || article.publishDate);
    
    return (
      <Card 
        sx={{
          height: '100%',
          minHeight: 400,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
        onClick={() => navigate(`/news-portal-system/news/${article.id}`)}
      >
        <CardMedia
          component="img"
          height="400"
          image={article.featuredImageUrl || '/api/placeholder/600/400'}
          alt={article.title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Share Actions - Top Right */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 1,
            zIndex: 2
          }}
        >
          <Tooltip title="Share on WhatsApp">
            <IconButton
              onClick={(e) => handleWhatsAppShare(article, e)}
              sx={{
                backgroundColor: 'rgba(37, 211, 102, 0.9)',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: '#25D366'
                }
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Copy link">
            <IconButton
              onClick={(e) => handleCopyLink(article, e)}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)'
                }
              }}
            >
              <Share sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Overlay Content */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            color: 'white',
            p: 3
          }}
        >
          {/* Date Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: 20,
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#333',
              borderRadius: 2,
              p: 1.5,
              textAlign: 'center',
              minWidth: 70,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
              {dateInfo.day}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {dateInfo.month}
            </Typography>
          </Box>

          <Chip 
            label="FEATURED" 
            size="small" 
            sx={{ 
              backgroundColor: '#ff4757',
              color: 'white',
              mb: 2,
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
          
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.excerpt || article.content?.substring(0, 100) + '...'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 16 }} />
              <Typography variant="caption">{article.viewCount || 0}</Typography>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              By {article.createdByUserName || 'Admin'}
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  };

  // Latest News Card Component - Updated to show header images
  const LatestCard = ({ article, index }) => {
    const gradient = gradients[index % gradients.length];
    const dateInfo = formatDate(article.createdDate || article.publishDate);
    
    return (
      <Card 
        sx={{
          height: '100%',
          minHeight: 320,
          cursor: 'pointer',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
          }
        }}
        onClick={() => navigate(`/news-portal-system/news/${article.id}`)}
      >
        {/* Header Image */}
        <CardMedia
          component="img"
          height="180"
          image={article.headerImageUrl || article.featuredImageUrl || '/api/placeholder/400/180'}
          alt={article.title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Date Badge - Positioned over image */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 1,
            textAlign: 'center',
            minWidth: 60,
            zIndex: 2,
            color: 'white'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
            {dateInfo.day}
          </Typography>
          <Typography variant="caption" sx={{ lineHeight: 1, opacity: 0.9 }}>
            {dateInfo.month}
          </Typography>
        </Box>
        
        {/* Share Actions - Top Right over image */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 0.5,
            zIndex: 2
          }}
        >
          <Tooltip title="Share on WhatsApp">
            <IconButton
              onClick={(e) => handleWhatsAppShare(article, e)}
              sx={{
                backgroundColor: 'rgba(37, 211, 102, 0.9)',
                color: 'white',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#25D366'
                }
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Copy link">
            <IconButton
              onClick={(e) => handleCopyLink(article, e)}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)'
                }
              }}
            >
              <Share sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Content Section with Gradient Background */}
        <Box
          sx={{
            background: gradient,
            color: 'white',
            height: 'calc(100% - 180px)',
            position: 'relative'
          }}
        >
          <CardActionArea sx={{ height: '100%', p: 0 }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              position: 'relative'
            }}>
              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  zIndex: 0
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  zIndex: 0
                }}
              />

              {/* Content */}
              <Box sx={{ zIndex: 1 }}>
                <Chip 
                  label={article.categoryName || 'NEWS'} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'inherit',
                    mb: 2,
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  {article.title}
                </Typography>
              </Box>

              {/* Footer */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 'auto',
                zIndex: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                  <TrendingUp sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    {article.viewCount || Math.floor(Math.random() * 1000)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                  {article.createdByUserName || 'Admin'}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Box>
      </Card>
    );
  };

  // Loading Component
  const LoadingGrid = ({ count = 3 }) => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 3,
      '@media (max-width: 900px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      },
      '@media (max-width: 600px)': {
        gridTemplateColumns: '1fr'
      }
    }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={320}
          sx={{ borderRadius: 3 }}
        />
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Skeleton variant="text" width={400} height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={300} height={30} sx={{ mx: 'auto' }} />
        </Box>
        <LoadingGrid count={3} />
        <Box sx={{ mt: 8 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mx: 'auto', mb: 4 }} />
          <LoadingGrid count={9} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          Today's Top Highlights
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          Discover the most important headlines and trending stories from around the world
        </Typography>
      </Box>

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 4, 
              textAlign: 'center',
              color: '#2c3e50'
            }}
          >
            🔥 Featured Stories
          </Typography>
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
            '@media (max-width: 900px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            {featuredNews.map((article, index) => (
              <FeaturedCard key={article.id} article={article} index={index} />
            ))}
          </Box>
        </Box>
      )}

      {/* Latest News Section */}
      {latestNews.length > 0 && (
        <Box>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 4, 
              textAlign: 'center',
              color: '#2c3e50'
            }}
          >
            📰 Latest Updates
          </Typography>
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            '@media (max-width: 900px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            {latestNews.map((article, index) => (
              <LatestCard key={article.id} article={article} index={index} />
            ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {!loading && featuredNews.length === 0 && latestNews.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No news articles available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check back later for the latest updates
          </Typography>
        </Box>
      )}

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
};

export default NewsDisplay;