import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, Snackbar,
  MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel,
  Card, CardContent, Divider, Grid, IconButton, ImageList, ImageListItem,
  ImageListItemBar, Chip
} from '@mui/material';
import { Save, Cancel, CloudUpload, Delete, Image } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  createNews, 
  updateNews, 
  getNewsById, 
  getCategories 
} from '../api-services/newsPortalService';
import { getRedButtonStyle } from './newsPortalTheme';

const NewsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    excerpt: '',
    remark: '',
    newscategoryid: '',
    isPublished: false,
    publishDate: ''
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchNews();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      // Option 1: Call without pagination to get all categories
      const response = await getCategories();
      setCategories(response.items || response || []); // Handle both paginated and non-paginated responses
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNewsById(id);
      setFormData({
        title: response.title || '',
        slug: response.slug || '',
        description: response.description || '',
        excerpt: response.excerpt || '',
        remark: response.remark || '',
        newscategoryid: response.categoryID || '',
        isPublished: response.isPublished || false,
        publishDate: response.publishDate ? response.publishDate.split('T')[0] : ''
      });
    } catch (err) {
      setError('Error fetching news: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  // Image handling functions
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }
    
    // Add new images to existing ones
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index].url);
    
    // Remove from both arrays
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.newscategoryid) {
      setError('Title and Category are required');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'publishDate' && formData[key]) {
            submitData.append(key, new Date(formData[key]).toISOString());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      // Add user info
      if (user?.id) {
        submitData.append('createdBy', user.id);
      }
      
      // Add images
      selectedImages.forEach((image) => {
        submitData.append('images', image);
      });
  
      if (isEdit) {
        await updateNews(id, submitData);
        setSuccessMessage('News updated successfully');
      } else {
        await createNews(submitData);
        setSuccessMessage('News created successfully');
      }
      
      setTimeout(() => navigate('/news-portal-system/news'), 2000);
    } catch (err) {
      setError('Error saving news: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {isEdit ? 'Edit News' : 'Create News'}
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Content</Typography>
                    
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      helperText="URL-friendly version of the title"
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      helperText="Brief summary of the news"
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={10}
                      helperText="Full content of the news"
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Remark"
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                      helperText="Internal notes or remarks"
                    />
                  </CardContent>
                </Card>

                {/* Image Upload Section */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Image sx={{ mr: 1 }} />
                      Images
                    </Typography>
                    
                    {/* Upload Button */}
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        multiple
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={getRedButtonStyle('outlined')}
                        >
                          Upload Images
                        </Button>
                      </label>
                      <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        Supported formats: JPEG, PNG, GIF, WebP
                      </Typography>
                    </Box>

                    {/* Image Previews */}
                    {imagePreviewUrls.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Selected Images ({imagePreviewUrls.length})
                        </Typography>
                        <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={120}>
                          {imagePreviewUrls.map((preview, index) => (
                            <ImageListItem key={index}>
                              <img
                                src={preview.url}
                                alt={preview.name}
                                loading="lazy"
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                              <ImageListItemBar
                                title={preview.name}
                                actionIcon={
                                  <IconButton
                                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <Delete />
                                  </IconButton>
                                }
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      </Box>
                    )}

                    {imagePreviewUrls.length === 0 && (
                      <Box 
                        sx={{ 
                          border: '2px dashed #ccc', 
                          borderRadius: 1, 
                          p: 3, 
                          textAlign: 'center',
                          backgroundColor: 'grey.50'
                        }}
                      >
                        <Image sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No images selected. Click "Upload Images" to add images to your news article.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
                 
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="newscategoryid"
                        value={formData.newscategoryid}
                        label="Category"
                        onChange={handleInputChange}
                        required
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Publish Date"
                      name="publishDate"
                      type="date"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          name="isPublished"
                          checked={formData.isPublished}
                          onChange={handleInputChange}
                        />
                      }
                      label="Published"
                    />

                    {/* Image Summary */}
                    {selectedImages.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Media Summary</Typography>
                        <Chip 
                          icon={<Image />} 
                          label={`${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected`}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(220, 20, 60, 0.1)',
                            color: '#DC143C'
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    fullWidth
                    sx={getRedButtonStyle('contained')}
                  >
                    {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/news-portal-system/news')}
                    fullWidth
                    sx={getRedButtonStyle('outlined')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
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

export default NewsForm;