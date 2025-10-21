import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, Snackbar,
  MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  createCategory
} from '../api-services/newsPortalService';
import { getRedButtonStyle } from './newsPortalTheme';
import { useCategories } from '../contexts/CategoryContext';

const NewsCategoryForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { categories, refreshCategories } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryID: null
  });

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Name is required');
      return;
    }
  
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const submitData = {
        ...formData,
        parentCategoryID: formData.parentCategoryID || null,
        createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };
  
      console.log('Submitting data:', submitData);
  
      const result = await createCategory(submitData);
      console.log('Create result:', result);
      setSuccessMessage('Category created successfully');
      await refreshCategories();
      
      setTimeout(() => navigate('/news-portal-system/categories'), 2000);
    } catch (err) {
      // console.error('Submit error:', err);
      setError('Error saving category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Create Category
        </Typography>

        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
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
              helperText="URL-friendly version of the name"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Parent Category</InputLabel>
              <Select
                name="parentCategoryID"
                value={formData.parentCategoryID}
                label="Parent Category"
                onChange={handleInputChange}
                displayEmpty
              >
                <MenuItem value="">None (Root Category)</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={getRedButtonStyle('contained')}
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/news-portal-system/categories')}
                sx={getRedButtonStyle('outlined')}
              >
                Cancel
              </Button>
            </Box>
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

export default NewsCategoryForm;