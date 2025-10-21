import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, Snackbar,
  MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel,
  Card, CardContent, Divider, Grid, IconButton, Chip, Container
} from '@mui/material';
import { Save, Cancel, CloudUpload, Delete, PhotoCamera, Wallpaper, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateNews, 
  getNewsById, 
  getCategories,
  uploadThumbnailImage,
  uploadHeaderImage
} from '../api-services/newsPortalService';
import { getRedButtonStyle } from './newsPortalTheme';

const NewsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Separate state for thumbnail and header images
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  
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
    if (id) {
      fetchCategories();
      fetchNews();
    } else {
      navigate('/news-portal-system/news');
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.items || response || []);
    } catch (err) {
      // console.error('Error fetching categories:', err);
      setError('Error fetching categories: ' + err.message);
    }
  };

  // Update the fetchNews function to handle all image types
  const fetchNews = async () => {
    try {
      setInitialLoading(true);
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
      
      // Process existing images - handle both header and thumbnail
      if (response.images && response.images.length > 0) {
        // Look for header image (by imageType or filename pattern)
        const headerImage = response.images.find(img => 
          img.imageType === 'header' || 
          (img.imageType === null && img.name && img.name.toLowerCase().includes('header'))
        );
        if (headerImage) {
          setHeaderPreview(headerImage.imageUrl);
        }
        
        // Look for thumbnail image (by imageType or filename pattern)
        const thumbnailImage = response.images.find(img => 
          img.imageType === 'thumbnail' || 
          (img.imageType === null && img.name && img.name.toLowerCase().includes('thumbnail'))
        );
        if (thumbnailImage) {
          setThumbnailPreview(thumbnailImage.imageUrl);
        }
      }
      
      // Fallback to featuredThumbnailImageUrl if no thumbnail found in images array
      if (!thumbnailPreview && response.featuredThumbnailImageUrl) {
        setThumbnailPreview(response.featuredThumbnailImageUrl);
      }
      
    } catch (err) {
      // console.error('Error fetching news:', err);
      setError('Error fetching news: ' + err.message);
    } finally {
      setInitialLoading(false);
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

    // Auto-generate slug from title if slug is empty or matches previous title
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  // Thumbnail image handling
  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Clean up previous preview
    if (thumbnailPreview && thumbnailImage) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailImage(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // Header image handling
  const handleHeaderUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Clean up previous preview
    if (headerPreview && headerImage) {
      URL.revokeObjectURL(headerPreview);
    }

    setHeaderImage(file);
    setHeaderPreview(URL.createObjectURL(file));
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview && thumbnailImage) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailImage(null);
    setThumbnailPreview(null);
    
    // Reset the file input
    const fileInput = document.getElementById('thumbnail-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveHeader = () => {
    if (headerPreview && headerImage) {
      URL.revokeObjectURL(headerPreview);
    }
    setHeaderImage(null);
    setHeaderPreview(null);
    
    // Reset the file input
    const fileInput = document.getElementById('header-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.newscategoryid) {
      setError('Title and Category are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for news update (without images)
      const submitData = new FormData();
      
      // **FIX 1**: Add the ID to FormData
      submitData.append('id', id);
      
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
        submitData.append('updatedBy', user.id);
      }
  
      // Update the news
      // 1. Update news data (text fields only)
      await updateNews(id, submitData);
      
      // **FIX 2**: Uncomment and enable image uploads
      // 2. Upload thumbnail if new image selected
      if (thumbnailImage && user?.id) {
        await uploadThumbnailImage(id, thumbnailImage, user.id);
      }
      
      // 3. Upload header if new image selected
      if (headerImage && user?.id) {
        await uploadHeaderImage(id, headerImage, user.id);
      }
      
      // **FIX 3**: Remove refreshNewsData call to prevent clearing file states
      // await refreshNewsData(); // Remove this line
  
      setSuccessMessage('News updated successfully');
      setTimeout(() => navigate('/news-portal-system/news'), 2000);
    } catch (err) {
      // console.error('Update error:', err);
      setError('Error updating news: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // **NEW FUNCTION**: Refresh news data after successful update
  // Update the refreshNewsData function around line 270-285
  const refreshNewsData = async () => {
  try {
    const response = await getNewsById(id);
    
    // DON'T clear image file states if they contain new uploads
    // Only clear them if they're not new file uploads
    if (!thumbnailImage) {
      setThumbnailImage(null);
    }
    if (!headerImage) {
      setHeaderImage(null);
    }
    
    // Update with fresh image URLs from server
    if (response.images && response.images.length > 0) {
      // Look for header image (by imageType or filename pattern)
      const headerImg = response.images.find(img => 
        img.imageType === 'header' || 
        (img.imageType === null && img.name && img.name.toLowerCase().includes('header'))
      );
      
      // Look for thumbnail image (by imageType or filename pattern)
      const thumbnailImg = response.images.find(img => 
        img.imageType === 'thumbnail' || 
        (img.imageType === null && img.name && img.name.toLowerCase().includes('thumbnail'))
      );
      
      // Only update preview if we don't have a new file upload
      if (headerImg && !headerImage) {
        if (headerPreview && headerPreview.startsWith('blob:')) {
          URL.revokeObjectURL(headerPreview);
        }
        setHeaderPreview(headerImg.imageUrl);
      }
      
      if (thumbnailImg && !thumbnailImage) {
        if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
          URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailPreview(thumbnailImg.imageUrl);
      }
    }
    
    // Use dedicated properties as fallback (only if no new uploads)
    if (!headerPreview && response.featuredHeaderImageUrl && !headerImage) {
      setHeaderPreview(response.featuredHeaderImageUrl);
    }
    
    if (!thumbnailPreview && response.featuredThumbnailImageUrl && !thumbnailImage) {
      setThumbnailPreview(response.featuredThumbnailImageUrl);
    }
    
  } catch (error) {
    console.error('Error refreshing news data:', error);
    // toast.error('Failed to refresh news data');
  }
};

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailImage) URL.revokeObjectURL(thumbnailPreview);
      if (headerPreview && headerImage) URL.revokeObjectURL(headerPreview);
    };
  }, []);

  if (initialLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading news data...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/news-portal-system/news')}
            sx={{ mr: 2 }}
          >
            Back to News
          </Button>
          <Typography variant="h4" component="h1">
            Edit News
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {/* Content Card */}
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

                {/* Thumbnail Image Upload Section */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PhotoCamera sx={{ mr: 1 }} />
                      Thumbnail Image
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Upload a thumbnail image that will be displayed in news listings and previews.
                    </Typography>
                    
                    {/* Thumbnail Upload Button */}
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="thumbnail-upload"
                        type="file"
                        onChange={handleThumbnailUpload}
                        disabled={thumbnailPreview && !thumbnailImage}
                      />
                      <label htmlFor="thumbnail-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={getRedButtonStyle('outlined')}
                          disabled={thumbnailPreview && !thumbnailImage}
                        >
                          {thumbnailImage ? 'Change Thumbnail' : 'Upload New Thumbnail'}
                        </Button>
                      </label>
                      <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        Recommended: 400x300px, JPEG/PNG
                      </Typography>
                    </Box>

                    {/* Thumbnail Preview */}
                    {thumbnailPreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          style={{
                            width: '200px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                        <IconButton
                          onClick={handleRemoveThumbnail}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'error.dark' }
                          }}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box 
                        sx={{ 
                          border: '2px dashed #ccc', 
                          borderRadius: 1, 
                          p: 3, 
                          textAlign: 'center',
                          backgroundColor: 'grey.50',
                          width: '200px',
                          height: '150px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <PhotoCamera sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          No thumbnail selected
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Header Image Upload Section */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Wallpaper sx={{ mr: 1 }} />
                      Header Image
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Upload a header image that will be displayed at the top of the news article.
                    </Typography>
                    
                    {/* Header Upload Button */}
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="header-upload"
                        type="file"
                        onChange={handleHeaderUpload}
                        disabled={headerPreview && !headerImage}
                      />
                      <label htmlFor="header-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={getRedButtonStyle('outlined')}
                          disabled={headerPreview && !headerImage}
                        >
                          {headerImage ? 'Change Header' : 'Upload New Header'}
                        </Button>
                      </label>
                      <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        Recommended: 1200x400px, JPEG/PNG
                      </Typography>
                    </Box>

                    {/* Header Preview */}
                    {headerPreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={headerPreview}
                          alt="Header preview"
                          style={{
                            width: '400px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                        <IconButton
                          onClick={handleRemoveHeader}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'error.dark' }
                          }}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box 
                        sx={{ 
                          border: '2px dashed #ccc', 
                          borderRadius: 1, 
                          p: 3, 
                          textAlign: 'center',
                          backgroundColor: 'grey.50',
                          width: '400px',
                          height: '150px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Wallpaper sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          No header image selected
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Settings Card */}
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
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Media Summary</Typography>
                      
                      {(thumbnailImage || thumbnailPreview) && (
                        <Chip 
                          icon={<PhotoCamera />} 
                          label={thumbnailImage ? "New thumbnail selected" : "Current thumbnail"}
                          size="small"
                          sx={{ 
                            backgroundColor: thumbnailImage ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                            color: thumbnailImage ? '#FF9800' : '#4CAF50',
                            mb: 1,
                            mr: 1
                          }}
                        />
                      )}
                      
                      {(headerImage || headerPreview) && (
                        <Chip 
                          icon={<Wallpaper />} 
                          label={headerImage ? "New header selected" : "Current header"}
                          size="small"
                          sx={{ 
                            backgroundColor: headerImage ? 'rgba(255, 152, 0, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                            color: headerImage ? '#FF9800' : '#2196F3',
                            mb: 1
                          }}
                        />
                      )}
                      
                      {!thumbnailPreview && !headerPreview && (
                        <Typography variant="caption" color="text.secondary">
                          No images available
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    fullWidth
                    sx={getRedButtonStyle('contained')}
                  >
                    {loading ? 'Updating...' : 'Update News'}
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
    </Container>
  );
};

export default NewsEdit;