import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, Snackbar,
  MenuItem, FormControl, InputLabel, Select, CircularProgress
} from '@mui/material';
import { Save, Cancel, Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateCategory, 
  getCategoryById
} from '../api-services/newsPortalService';
import { getRedButtonStyle, newsPortalTheme } from './newsPortalTheme';
import { useCategories } from '../contexts/CategoryContext';

const NewsCategoryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { categories, refreshCategories } = useCategories();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryID: null
  });

  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchCategoryData();
  }, [id]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCategoryById(id);
      
      const categoryData = {
        name: response.name || '',
        slug: response.slug || '',
        description: response.description || '',
        parentCategoryID: response.parentCategoryID || ''
      };
      
      setFormData(categoryData);
      setOriginalData(categoryData);
    } catch (err) {
      // console.error('Error fetching category:', err);
      setError('Failed to load category data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
  
    if (!hasChanges()) {
      setError('No changes detected');
      return;
    }
  
    try {
      setSaving(true);
      setError('');
      
      const updateData = {
        id: id, // Add the ID field
        ...formData,
        parentCategoryID: formData.parentCategoryID || null,
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };
  
      // console.log('Updating category:', updateData);
      await updateCategory(id, updateData);
      
      setSuccessMessage('Category updated successfully!');
      
      // Refresh categories in context
      await refreshCategories();
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/news-portal-system/categories');
      }, 2000);
      
    } catch (err) {
      // console.error('Update error:', err);
      setError('Failed to update category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/news-portal-system/categories');
  };

  // Filter out current category from parent options to prevent circular reference
  const availableParentCategories = categories.filter(cat => cat.id !== id);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: newsPortalTheme.redPrimary }} />
        <Typography variant="h6" color="text.secondary">
          Loading category data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ 
        p: 4, 
        maxWidth: 800, 
        mx: 'auto',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Category Name */}
          <TextField
            fullWidth
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            variant="outlined"
            sx={{ mb: 3 }}
            helperText="Enter a descriptive name for this category"
          />

          {/* Slug */}
          <TextField
            fullWidth
            label="URL Slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            variant="outlined"
            sx={{ mb: 3 }}
            helperText="URL-friendly version (e.g., 'technology-news')"
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 3 }}
            helperText="Optional description for this category"
          />

          {/* Parent Category */}
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Parent Category</InputLabel>
            <Select
              name="parentCategoryID"
              value={formData.parentCategoryID}
              label="Parent Category"
              onChange={handleInputChange}
              displayEmpty
            >
              <MenuItem value="">None (Root Category)</MenuItem>
              {availableParentCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={saving}
              sx={{
                ...getRedButtonStyle('outlined'),
                px: 3,
                py: 1.5
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              disabled={saving || !hasChanges()}
              sx={{
                ...getRedButtonStyle('contained'),
                px: 3,
                py: 1.5,
                minWidth: 120
              }}
            >
              {saving ? 'Updating...' : 'Update Category'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsCategoryEdit;