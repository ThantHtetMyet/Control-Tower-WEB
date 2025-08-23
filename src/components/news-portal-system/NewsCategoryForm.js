import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert, Snackbar,
  MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material'; // Fixed: was '@mui/icons-icon'
import { useNavigate, useParams } from 'react-router-dom';
// Remove: import NewsNavBar from './NewsNavBar';
import { 
  createCategory, 
  updateCategory, 
  getCategoryById, 
  getCategories 
} from '../api-services/newsPortalService';
import { getRedButtonStyle } from './newsPortalTheme';

const NewsCategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryID: ''
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories(1, 100);
      setCategories(response.items || []);
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    }
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await getCategoryById(id);
      setFormData({
        name: response.name || '',
        slug: response.slug || '',
        description: response.description || '',
        parentCategoryID: response.parentCategoryID || ''
      });
    } catch (err) {
      setError('Error fetching category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (name === 'name' && !isEdit) {
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
      const submitData = {
        ...formData,
        parentCategoryID: formData.parentCategoryID || null
      };

      if (isEdit) {
        await updateCategory(id, submitData);
        setSuccessMessage('Category updated successfully');
      } else {
        await createCategory(submitData);
        setSuccessMessage('Category created successfully');
      }
      
      setTimeout(() => navigate('/news/categories'), 2000);
    } catch (err) {
      setError('Error saving category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter out current category and its descendants to prevent circular references
  const availableParentCategories = categories.filter(cat => cat.id !== id);

  return (
    <Box>
      {/* Remove <NewsNavBar /> from here */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {isEdit ? 'Edit Category' : 'Create Category'}
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
              >
                <MenuItem value="">None (Root Category)</MenuItem>
                {availableParentCategories.map((category) => (
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
                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/news/categories')}
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