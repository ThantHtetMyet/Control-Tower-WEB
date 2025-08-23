import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Button,
  Container, Divider, Avatar, IconButton, Paper
} from '@mui/material';
import { AccessTime, Visibility, Share, BookmarkBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNews, getCategories } from '../api-services/newsPortalService';
import { newsPortalTheme } from './newsPortalTheme';

const NewsDisplay = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewsData();
    fetchCategories();
  }, []);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      const response = await getNews(1, 20, '', null, true); // Only published news
      const newsItems = response.items || [];
      
      // Get featured news (first 4 items)
      setFeaturedNews(newsItems.slice(0, 4));
      // Get latest news (remaining items)
      setLatestNews(newsItems.slice(4));
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const FeaturedArticle = ({ article, isMain = false }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
      onClick={() => navigate(`/news/${article.id}`)}
    >
      <CardMedia
        component="img"
        height={isMain ? 300 : 200}
        image={article.imageUrl || '/api/placeholder/400/300'}
        alt={article.title}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={article.categoryName} 
            size="small" 
            color="primary" 
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
            {formatDate(article.createdDate)}
          </Typography>
        </Box>
        <Typography 
          variant={isMain ? "h5" : "h6"} 
          component="h2" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: isMain ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {article.title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: isMain ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2
          }}
        >
          {article.excerpt}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {article.viewCount} views
            </Typography>
          </Box>
          <Box>
            <IconButton size="small">
              <Share sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small">
              <BookmarkBorder sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const NewsListItem = ({ article }) => (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'grey.50',
          boxShadow: 1
        }
      }}
      onClick={() => navigate(`/news/${article.id}`)}
    >
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <CardMedia
            component="img"
            height={100}
            image={article.imageUrl || '/api/placeholder/200/100'}
            alt={article.title}
            sx={{ borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              label={article.categoryName} 
              size="small" 
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(article.createdDate)}
            </Typography>
          </Box>
          <Typography 
            variant="subtitle1" 
            component="h3" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
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
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.excerpt}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Loading news...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Latest News
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Stay updated with the latest news and updates
        </Typography>
      </Box>

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Featured Stories
          </Typography>
          <Grid container spacing={3}>
            {/* Main featured article */}
            <Grid item xs={12} md={8}>
              <FeaturedArticle article={featuredNews[0]} isMain={true} />
            </Grid>
            {/* Side featured articles */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                {featuredNews.slice(1, 3).map((article) => (
                  <Grid item xs={12} key={article.id}>
                    <FeaturedArticle article={article} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Latest News Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Latest Updates
          </Typography>
          {latestNews.map((article) => (
            <NewsListItem key={article.id} article={article} />
          ))}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Categories */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  variant="outlined"
                  clickable
                  onClick={() => navigate(`/news/category/${category.id}`)}
                  sx={{ 
                    mb: 1,
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
          </Paper>

          {/* Trending */}
          {featuredNews.length > 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                Trending Now
              </Typography>
              {featuredNews.slice(3, 6).map((article, index) => (
                <Box 
                  key={article.id}
                  sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'grey.50' },
                    p: 1,
                    borderRadius: 1
                  }}
                  onClick={() => navigate(`/news/${article.id}`)}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 'bold', 
                      mr: 2,
                      minWidth: 24
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {article.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(article.createdDate)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default NewsDisplay;