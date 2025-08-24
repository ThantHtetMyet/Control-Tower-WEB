import React, { useState, useEffect } from 'react';
import {
  Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar
} from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Edit, Delete, Add, ExpandMore, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../api-services/newsPortalService';
import { getRedButtonStyle } from './newsPortalTheme';

const NewsCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories(1, 100);
      setCategories(response.items || []);
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(id);
        setSuccessMessage('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        setError('Error deleting category: ' + err.message);
      }
    }
  };

  const buildCategoryTree = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parentCategoryID === parentId)
      .map(category => ({
        ...category,
        children: buildCategoryTree(categories, category.id)
      }));
  };

  // Replace TreeView with SimpleTreeView in the component
  const renderCategoryTree = (categories) => {
    return (
      <SimpleTreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      >
        {categories.map((category) => renderTreeItem(category))}
      </SimpleTreeView>
    );
  };
  
  const renderTreeItem = (category) => (
    <TreeItem
      key={category.id}
      itemId={category.id.toString()}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {category.name}
          </Typography>
          <Chip
            label={category.slug}
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/news-portal-system/categories/edit/${category.id}`);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(category.id, category.name);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      {category.children && category.children.length > 0 &&
        category.children.map((child) => renderTreeItem(child))
      }
    </TreeItem>
  );

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
          Loading categories...
        </Typography>
      </Box>
    );
  }

  const categoryTree = buildCategoryTree(categories);

  return (
    <Box>
      {/* Remove <NewsNavBar /> from here */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Category Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/news/categories/create')}
            sx={getRedButtonStyle('contained')}
          >
            Add Category
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          <SimpleTreeView
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            sx={{ height: 400, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
          >
            {renderCategoryTree(categoryTree)}
          </SimpleTreeView>
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

export default NewsCategoryList;