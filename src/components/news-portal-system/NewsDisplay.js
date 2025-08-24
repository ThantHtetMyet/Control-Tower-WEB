import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Button,
  Container, Divider, Avatar, IconButton, Paper, CardActionArea
} from '@mui/material';
import { AccessTime, Visibility, Share, BookmarkBorder, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNews, getCategories } from '../api-services/newsPortalService';
import { newsPortalTheme } from './newsPortalTheme';

const NewsDisplay = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Color palette for compact cards
  const cardColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#fff' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#fff' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#fff' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#fff' },
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#333' },
    { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', text: '#333' },
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#333' },
    { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', text: '#fff' },
    { bg: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', text: '#333' }
  ];

  useEffect(() => {
    fetchNewsData();
    fetchCategories();
  }, []);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      const response = await getNews(1, 20, '', null, true); // Only published news
      const newsItems = response.items || [];
      
      // Get featured news (first 2 items for hero section)
      setFeaturedNews(newsItems.slice(0, 2));
      // Get latest news (remaining items for compact cards)
      setLatestNews(newsItems.slice(2));
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.items || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
      day: date.getDate().toString().padStart(2, '0')
    };
  };

  // Hero Featured Article Component
  const HeroArticle = ({ article }) => (
    <Card 
      sx={{ 
        height: 400,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
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
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          color: 'white',
          p: 3
        }}
      >
        <Chip 
          label="NEWS" 
          size="small" 
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            mb: 1,
            fontWeight: 'bold'
          }}
        />
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            lineHeight: 1.2
          }}
        >
          {article.title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.9,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {article.excerpt}
        </Typography>
      </Box>
    </Card>
  );

  // Compact Card Component (similar to sample screenshots)
  const CompactCard = ({ article, index }) => {
    const colorScheme = cardColors[index % cardColors.length];
    const dateInfo = formatMonth(article.createdDate || article.publishDate);
    
    return (
      <Card 
        sx={{ 
          height: 280,
          cursor: 'pointer',
          background: colorScheme.bg,
          color: colorScheme.text,
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
        onClick={() => navigate(`/news-portal-system/news/${article.id}`)}
      >
        <CardActionArea sx={{ height: '100%', p: 0 }}>
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 3
          }}>
            {/* Date Badge */}
            <Box sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
              p: 1,
              textAlign: 'center',
              minWidth: 60
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {dateInfo.day}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1 }}>
                {dateInfo.month}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1, display: 'block' }}>
                {dateInfo.year}
              </Typography>
            </Box>

            {/* Content */}
            <Box>
              <Chip 
                label={article.categoryName || 'NEWS'} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  mb: 2,
                  fontWeight: 'bold'
                }}
              />
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
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
              mt: 'auto'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">
                  {article.viewCount || 0}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {article.createdByUserName || 'Admin'}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Loading news...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Today's Top Highlights
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Catch up on the most important headlines and trending news, all in one place.
        </Typography>
      </Box>

      {/* Hero Featured News Section */}
      {featuredNews.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {featuredNews.map((article) => (
              <Grid item xs={12} md={6} key={article.id}>
                <HeroArticle article={article} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Compact Cards Grid */}
      {latestNews.length > 0 && (
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Latest Updates
          </Typography>
          <Grid container spacing={3}>
            {latestNews.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={article.id}>
                <CompactCard article={article} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
            Browse by Category
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                variant="outlined"
                clickable
                onClick={() => navigate(`/news-portal-system/category/${category.id}`)}
                sx={{ 
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  borderColor: newsPortalTheme.redPrimary,
                  color: newsPortalTheme.redPrimary,
                  '&:hover': {
                    backgroundColor: 'rgba(220, 20, 60, 0.04)',
                    borderColor: newsPortalTheme.redSecondary
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default NewsDisplay;