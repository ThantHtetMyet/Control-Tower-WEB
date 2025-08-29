import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, TextField, MenuItem, FormControl, InputLabel, Select,
  Pagination, Card, CardContent, Grid, Container
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Publish, UnpublishedOutlined, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNews, deleteNews, publishNews, unpublishNews } from '../api-services/newsPortalService';
import { getRedButtonStyle, newsPortalTheme } from './newsPortalTheme';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [publishFilter, setPublishFilter] = useState('');
  
  const navigate = useNavigate();
  const { hasNewsPortalAdminAccess } = useAuth();
  const { categories } = useCategories();
  
  useEffect(() => {
    fetchNews();
  }, [page, search, selectedCategory, publishFilter]);
  
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews(
        page, 
        10, 
        search, 
        selectedCategory || null, 
        publishFilter === '' ? null : publishFilter === 'true'
      );
      setNews(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError('Error fetching news: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // New search handler
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to first page when searching
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteNews(id);
        setSuccessMessage('News deleted successfully');
        fetchNews();
      } catch (err) {
        setError('Error deleting news: ' + err.message);
      }
    }
  };

  const handlePublishToggle = async (id, isPublished) => {
    try {
      if (isPublished) {
        await unpublishNews(id);
        setSuccessMessage('News unpublished successfully');
      } else {
        await publishNews(id);
        setSuccessMessage('News published successfully');
      }
      fetchNews();
    } catch (err) {
      setError('Error updating publish status: ' + err.message);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate stats
  const totalNews = news.length;
  const publishedNews = news.filter(item => item.isPublished).length;
  const draftNews = totalNews - publishedNews;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <LinearProgress
            sx={{
              mb: 3,
              height: 6,
              borderRadius: 3,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                bgcolor: newsPortalTheme.redGradient,
              },
            }}
          />
          <Typography variant="h6" color="text.secondary">
            Loading news...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          News Management
        </Typography>
        {hasNewsPortalAdminAccess() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/news-portal-system/news/new')}
            sx={getRedButtonStyle('contained')}
          >
            Add News
          </Button>
        )}
      </Box>
        
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: newsPortalTheme.redPrimary }}>
          Search & Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search News"
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>            <InputLabel>Status</InputLabel>
            <Select
              value={publishFilter}
              label="Status"
              onChange={(e) => setPublishFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Published</MenuItem>
              <MenuItem value="false">Draft</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            sx={getRedButtonStyle('contained')}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* News Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Views</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.length > 0 ? (
                news.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.excerpt}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.categoryName} 
                        size="small"
                        sx={{
                          bgcolor: newsPortalTheme.redPrimary + "15",
                          color: newsPortalTheme.redPrimary,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.isPublished ? 'Published' : 'Draft'}
                        color={item.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.viewCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(item.createdDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/news-portal-system/news/${item.id}`)}
                            sx={{
                              color: "info.main",
                              "&:hover": {
                                bgcolor: "info.light",
                                color: "white",
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/news-portal-system/news/edit/${item.id}`)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: "primary.light",
                                color: "white",
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(item.id, item.title)}
                            sx={{
                              color: "error.main",
                              "&:hover": {
                                bgcolor: "error.light",
                                color: "white",
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                      No news found
                    </Typography>
                    {hasNewsPortalAdminAccess() && (
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => navigate('/news-portal-system/news/new')}
                        sx={{ mt: 2, ...getRedButtonStyle('outlined') }}
                      >
                        Create News
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-root': {
                  '&.Mui-selected': {
                    background: newsPortalTheme.redGradient,
                    color: 'white',
                    '&:hover': {
                      background: newsPortalTheme.redGradientHover
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewsList;