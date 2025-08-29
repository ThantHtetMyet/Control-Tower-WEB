import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CardMedia, Chip, Button,
  Container, Avatar, IconButton, Paper, CardActionArea, Skeleton
} from '@mui/material';
import { AccessTime, Visibility, Share, BookmarkBorder, CalendarToday, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../api-services/newsPortalService';
import { newsPortalTheme } from './newsPortalTheme';

const NewsDisplay = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
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

              {/* Date Badge */}
              <Box sx={{ 
                position: 'absolute',
                top: -200, // Position over the image
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 1,
                textAlign: 'center',
                minWidth: 60,
                zIndex: 2,
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                  {dateInfo.day}
                </Typography>
                <Typography variant="caption" sx={{ lineHeight: 1, opacity: 0.9 }}>
                  {dateInfo.month}
                </Typography>
              </Box>

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
                    WebkitLineClamp: 3, // Reduced to fit with image
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
    </Container>
  );
};

export default NewsDisplay;