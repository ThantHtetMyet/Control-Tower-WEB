import React, { useState } from "react";
import {
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
  Badge,
  Avatar,
  Grid,
  Container,
} from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import {
  Edit,
  Delete,
  Add,
  ExpandMore,
  ChevronRight,
  Category,
  Article,
  Folder,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { deleteCategory } from "../api-services/newsPortalService";
import { getRedButtonStyle, newsPortalTheme } from "./newsPortalTheme";
import { useCategories } from "../contexts/CategoryContext";

const NewsCategoryList = () => {
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    categoryId: null,
    categoryName: ''
  });
  const navigate = useNavigate();

  const { categories, loading, refreshCategories } = useCategories();

  const handleDeleteClick = (id, name) => {
    setDeleteModal({
      open: true,
      categoryId: id,
      categoryName: name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(deleteModal.categoryId);
      setDeleteModal({ open: false, categoryId: null, categoryName: '' });
      
      // Show success message
      setSuccessMessage(`Category "${deleteModal.categoryName}" has been successfully deleted.`);
      
      // Refresh the category list
      await refreshCategories();
      
      // Navigate to category list after a short delay
      setTimeout(() => {
        navigate('/news-portal-system/categories');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting category:', error);
      
      // Handle specific validation errors
      let errorMessage = 'Failed to delete category. Please try again.';
      
      if (error.response && error.response.status === 400) {
        const serverMessage = error.response.data;
        if (typeof serverMessage === 'string' && serverMessage.includes('contains news or subcategories')) {
          errorMessage = `Cannot delete category "${deleteModal.categoryName}" because it contains news articles or subcategories. Please move or delete the associated content first.`;
        } else {
          errorMessage = serverMessage || errorMessage;
        }
      }
      
      setError(errorMessage);
      setDeleteModal({ open: false, categoryId: null, categoryName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, categoryId: null, categoryName: '' });
  };

  // ✅ FIX: handle null / 0 / undefined parentCategoryID
  const buildCategoryTree = (items, parentId = null) => {
    return items
      .filter(
        (item) =>
          item.parentCategoryID === parentId ||
          (!item.parentCategoryID && parentId === null)
      )
      .map((item) => ({
        ...item,
        children: buildCategoryTree(items, item.id),
      }));
  };

  // Render tree item
  const renderTreeItem = (category) => {
    return (
      <TreeItem
        key={category.id}
        itemId={category.id}
        label={
          <Card
            sx={{
              mb: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: newsPortalTheme.redPrimary,
                boxShadow: `0 2px 8px ${newsPortalTheme.redPrimary}20`,
              },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                {/* Category Info */}
                <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: newsPortalTheme.redPrimary,
                      width: 32,
                      height: 32,
                      mr: 2,
                    }}
                  >
                    <Category fontSize="small" />
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: 0.5,
                      }}
                    >
                      {category.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        icon={<Article />}
                        label={`${category.newsCount} News`}
                        size="small"
                        sx={{
                          bgcolor: newsPortalTheme.redPrimary + "15",
                          color: newsPortalTheme.redPrimary,
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        icon={<Folder />}
                        label={`${category.subCategoriesCount} Sub`}
                        size="small"
                        sx={{
                          bgcolor: "primary.light",
                          color: "#ffffff",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
                  <Tooltip title="Edit Category" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/news-portal-system/categories/edit/${category.id}`
                        );
                      }}
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

                  <Tooltip title="Delete Category" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(category.id, category.name);
                      }}
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
              </Box>
            </CardContent>
          </Card>
        }
      >
        {category.children &&
          category.children.map((child) => renderTreeItem(child))}
      </TreeItem>
    );
  };

  const categoryTree = buildCategoryTree(categories);
  const totalCategories = categories.length;
  const rootCategories = categories.filter((c) => !c.parentCategoryID).length;
  const subCategories = totalCategories - rootCategories;

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
            Loading categories...
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
            Category Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/news-portal-system/categories/new')}
            sx={getRedButtonStyle('contained')}
          >
            Add Category
          </Button>
        </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: "center", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h4"
                sx={{ color: newsPortalTheme.redPrimary, fontWeight: 700 }}
              >
                {totalCategories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: "center", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h4"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                {rootCategories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Root Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: "center", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h4"
                sx={{ color: "secondary.main", fontWeight: 700 }}
              >
                {subCategories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sub Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tree */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>

        {categoryTree.length > 0 ? (
          <SimpleTreeView
            defaultCollapseIcon={
              <ExpandMore sx={{ color: newsPortalTheme.redPrimary }} />
            }
            defaultExpandIcon={
              <ChevronRight sx={{ color: newsPortalTheme.redPrimary }} />
            }
            sx={{ minHeight: 400 }}
          >
            {categoryTree.map((c) => renderTreeItem(c))}
          </SimpleTreeView>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography>No categories found</Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate("/news-portal-system/categories/new")}
              sx={{ mt: 2, ...getRedButtonStyle("outlined") }}
            >
              Create Category
            </Button>
          </Box>
        )}
      </Paper>

      {/* Snackbars */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300
        }}>
          <Paper sx={{ 
            p: 4, 
            maxWidth: 450, 
            mx: 2, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Delete sx={{ 
                color: newsPortalTheme.redPrimary, 
                fontSize: 28, 
                mr: 1 
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: newsPortalTheme.redPrimary, 
                  fontWeight: 'bold' 
                }}
              >
                Delete Category
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Are you sure you want to delete category <strong>"{deleteModal.categoryName}"</strong>? 
              This action will set the category as deleted and cannot be undone.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleDeleteCancel} 
                variant="outlined"
                sx={getRedButtonStyle('outlined')}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                variant="contained" 
                sx={getRedButtonStyle('contained')}
                startIcon={<Delete />}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default NewsCategoryList;
