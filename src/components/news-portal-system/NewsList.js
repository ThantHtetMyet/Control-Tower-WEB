import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, TextField, MenuItem, FormControl, InputLabel, Select,
  Pagination, Card, CardContent, CardMedia
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Publish, UnpublishedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNews, deleteNews, publishNews, unpublishNews, getCategories } from '../api-services/newsPortalService';
import { getRedButtonStyle } from './newsPortalTheme';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [publishFilter, setPublishFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.items || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
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

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
          Loading news...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Remove <NewsNavBar /> from here */}
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            News Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/news-portal-system/news/new')}
            sx={getRedButtonStyle('contained')}
          >
            Add News
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
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
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
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
            </Box>
          </CardContent>
        </Card>

        {/* News Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.excerpt}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.categoryName} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.isPublished ? 'Published' : 'Draft'}
                      color={item.isPublished ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.viewCount}</TableCell>
                  <TableCell>
                    {new Date(item.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/news/${item.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/news/edit/${item.id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.isPublished ? 'Unpublish' : 'Publish'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handlePublishToggle(item.id, item.isPublished)}
                        >
                          {item.isPublished ? <UnpublishedOutlined /> : <Publish />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            sx={{
              '& .MuiPaginationItem-root': {
                '&.Mui-selected': {
                  background: 'linear-gradient(270deg, #DC143C 0%, #B22222 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(270deg, #B22222 0%, #8B0000 100%)'
                  }
                }
              }
            }}
          />
        </Box>
      </Box>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsList;