import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Pagination, Stack, TextField, InputAdornment
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Description, Search, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getReportForms, getReportFormTypes, deleteReportForm, getRTUPMReportForm } from '../api-services/reportFormService';
import moment from 'moment';
import RMSTheme from '../theme-resource/RMSTheme';

const ReportFormList = () => {
  const [reportForms, setReportForms] = useState([]);
  const [reportFormTypes, setReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const navigate = useNavigate();

  useEffect(() => {
    fetchReportForms();
    fetchReportFormTypes();
  }, [selectedTypeId, currentPage, pageSize, searchTerm, sortField, sortDirection]);

  const fetchReportForms = async () => {
    try {
      setLoading(true);
      const response = await getReportForms(currentPage, pageSize, searchTerm, selectedTypeId || null, sortField, sortDirection);

      setReportForms(response.data || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      setError('Error fetching report forms: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToDetails = (form) => {
    const specificType = (form.specificReportTypeName || '').toLowerCase();
    const reportType = (form.reportFormTypeName || '').toLowerCase();

    if (specificType === 'server') {
      navigate(`/report-management-system/report-forms/server-pm-details/${form.id}`);
    } else if (specificType === 'rtu') {
      navigate(`/report-management-system/report-forms/rtu-pm-details/${form.id}`);
    } else if (reportType === 'corrective maintenance') {
      navigate(`/report-management-system/report-forms/cm-details/${form.id}`);
    } else {
      navigate(`/report-management-system/report-forms/details/${form.id}`);
    }
  };
  const fetchReportFormTypes = async () => {
    try {
      const data = await getReportFormTypes();
      setReportFormTypes(data);
    } catch (err) {
      console.error('Error fetching report form types:', err);
    }
  };

  const handleDelete = (id) => {
    setSelectedDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDeleteId) {
      try {
        await deleteReportForm(selectedDeleteId);
        setSuccessMessage('Report form deleted successfully');
        // Reset to first page if current page becomes empty
        if (reportForms.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchReportForms();
        }
      } catch (err) {
        setError('Error deleting report form: ' + err.message);
      }
    }
    setDeleteConfirmOpen(false);
    setSelectedDeleteId(null);
  };

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Search handlers
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Sorting handlers
  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as sort field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
  };

  // Remove client-side sorting since we're now handling it on the backend
  // The sortedReportForms will just be the reportForms as received from API
  const sortedReportForms = reportForms;

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedDeleteId(null);
  };

  const getStatusChip = (status) => {
    const normalizedStatus = (status || '').trim().toLowerCase();
    const statusColors = {
      'pending': { backgroundColor: '#ffb300', color: '#fff' }, // amber
      'in progress': { backgroundColor: RMSTheme.status.info, color: RMSTheme.text.onPrimary },
      'under review': { backgroundColor: '#8e24aa', color: '#fff' },
      'close': { backgroundColor: '#2e7d32', color: '#fff' },
      'cancelled': { backgroundColor: RMSTheme.status.error, color: RMSTheme.text.onPrimary }
    };
    const style = statusColors[normalizedStatus] || { backgroundColor: RMSTheme.background.default, color: RMSTheme.text.primary };
    return (
      <Chip
        label={status || 'N/A'}
        sx={{
          fontWeight: 600,
          textTransform: 'capitalize',
          ...style
        }}
        size="small"
      />
    );
  };

  const getUploadStatusChip = (status) => {
    const statusColors = {
      'Pending': { backgroundColor: RMSTheme.background.default, color: RMSTheme.text.secondary },
      'Uploading': { backgroundColor: RMSTheme.status.info, color: RMSTheme.text.onPrimary },
      'Completed': { backgroundColor: RMSTheme.status.success, color: RMSTheme.text.onPrimary },
      'Failed': { backgroundColor: RMSTheme.status.error, color: RMSTheme.text.onPrimary }
    };
    return (
      <Chip
        label={status}
        sx={statusColors[status] || { backgroundColor: RMSTheme.background.default }}
        size="small"
      />
    );
  };

  if (loading) return <LinearProgress sx={{ color: RMSTheme.primary.main }} />;

  return (
    <Box sx={{ p: 3, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: RMSTheme.text.primary, fontWeight: 'bold' }}
        >
          Report Forms
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/report-management-system/report-forms/new')}
          sx={{
            background: RMSTheme.gradients.primary,
            color: '#FFFFFF',
            boxShadow: RMSTheme.shadows.medium,
            '&:hover': {
              background: RMSTheme.gradients.accent,
              boxShadow: RMSTheme.shadows.large
            }
          }}
        >
          Add Report Form
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            backgroundColor: RMSTheme.background.paper,
            '&:hover fieldset': {
              borderColor: RMSTheme.primary.main
            },
            '&.Mui-focused fieldset': {
              borderColor: RMSTheme.primary.main
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: RMSTheme.primary.main
          }
        }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={selectedTypeId}
            label="Filter by Type"
            onChange={(e) => {
              setSelectedTypeId(e.target.value);
              setCurrentPage(1); // Reset to first page when filtering
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            {reportFormTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Search report forms..."
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              backgroundColor: RMSTheme.background.paper,
              '&:hover fieldset': {
                borderColor: RMSTheme.primary.main
              },
              '&.Mui-focused fieldset': {
                borderColor: RMSTheme.primary.main
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: RMSTheme.text.secondary }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          onClick={handleSearchSubmit}
          sx={{
            background: RMSTheme.gradients.primary,
            color: '#FFFFFF',
            '&:hover': {
              background: RMSTheme.gradients.accent,
            }
          }}
        >
          Search
        </Button>

        {searchTerm && (
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            sx={{
              borderColor: RMSTheme.primary.main,
              color: RMSTheme.primary.main,
              '&:hover': {
                borderColor: RMSTheme.primary.dark,
                backgroundColor: RMSTheme.background.hover
              }
            }}
          >
            Clear Search
          </Button>
        )}

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Page Size</InputLabel>
          <Select
            value={pageSize}
            label="Page Size"
            onChange={handlePageSizeChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: RMSTheme.background.paper,
                '&:hover fieldset': {
                  borderColor: RMSTheme.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: RMSTheme.primary.main
                }
              }
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: RMSTheme.background.paper,
          boxShadow: RMSTheme.shadows.medium,
          borderRadius: RMSTheme.borderRadius.medium,
          overflowX: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: RMSTheme.background.hover }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 150,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('reportFormTypeName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Report Type
                  {getSortIcon('reportFormTypeName')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 150,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('specificReportTypeName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Specific Report Type
                  {getSortIcon('specificReportTypeName')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 120,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('jobNo')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Job No
                  {getSortIcon('jobNo')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 200,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('systemName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  System Name
                  {getSortIcon('systemName')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 200,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('stationName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Station Name
                  {getSortIcon('stationName')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 120,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('formStatus')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Form Status
                  {getSortIcon('formStatus')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 150,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('createdDate')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Created Date
                  {getSortIcon('createdDate')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 150,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('createdBy')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Created By
                  {getSortIcon('createdBy')}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: RMSTheme.text.primary,
                  minWidth: 150,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: RMSTheme.background.default }
                }}
                onClick={() => handleSort('updatedBy')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Updated By
                  {getSortIcon('updatedBy')}
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" sx={{ color: RMSTheme.text.secondary }}>
                    {searchTerm ? `No report forms found matching "${searchTerm}"` : 'No report forms available'}
                  </Typography>
                  {searchTerm && (
                    <Button
                      variant="text"
                      onClick={handleClearSearch}
                      sx={{ mt: 1, color: RMSTheme.primary.main }}
                    >
                      Clear search to see all forms
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedReportForms.map((form) => (
                <TableRow
                  key={form.id}
                  onDoubleClick={() => handleNavigateToDetails(form)}
                  sx={{
                    '&:hover': {
                      backgroundColor: RMSTheme.background.hover,
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell sx={{ color: RMSTheme.text.primary }}>
                    {form.reportFormTypeName || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: RMSTheme.text.primary }}>
                    {form.specificReportTypeName || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: RMSTheme.text.primary }}>
                    {form.jobNo || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: RMSTheme.text.primary }}>
                    <Tooltip title={form.systemNameWarehouseName || 'N/A'}>
                      <span>
                        {form.systemNameWarehouseName ?
                          (form.systemNameWarehouseName.length > 30 ?
                            form.systemNameWarehouseName.substring(0, 30) + '...' :
                            form.systemNameWarehouseName
                          ) : 'N/A'
                        }
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: RMSTheme.text.primary }}>
                    <Tooltip title={form.stationNameWarehouseName || 'N/A'}>
                      <span>
                        {form.stationNameWarehouseName ?
                          (form.stationNameWarehouseName.length > 30 ?
                            form.stationNameWarehouseName.substring(0, 30) + '...' :
                            form.stationNameWarehouseName
                          ) : 'N/A'
                        }
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{getStatusChip(form.formStatus || 'N/A')}</TableCell>
                  <TableCell sx={{ color: RMSTheme.text.secondary }}>
                    {form.createdDate ? moment(form.createdDate).format('YYYY-MM-DD HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: RMSTheme.text.secondary }}>
                    {form.createdByUserName || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: RMSTheme.text.secondary }}>
                    {form.updatedByUserName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleNavigateToDetails(form)}
                          sx={{
                            color: RMSTheme.status.info,
                            '&:hover': {
                              backgroundColor: RMSTheme.background.hover,
                              color: RMSTheme.primary.main
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {(form.formStatus || '').trim().toLowerCase() !== 'close' && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              // Navigate to appropriate edit page based on report type
                              const specificType = (form.specificReportTypeName || '').toLowerCase();
                              const reportType = (form.reportFormTypeName || '').toLowerCase();
                              if (specificType === 'rtu') {
                                navigate(`/report-management-system/rtu-pm-edit/${form.id}`);
                              } else if (specificType === 'server') {
                                navigate(`/report-management-system/server-pm-edit/${form.id}`);
                              } else if (reportType === 'corrective maintenance') {
                                navigate(`/report-management-system/cm-edit/${form.id}`);
                              } else {
                                navigate(`/report-management-system/report-forms/details/${form.id}`);
                              }
                            }}
                            sx={{
                              color: RMSTheme.status.warning,
                              '&:hover': {
                                backgroundColor: RMSTheme.background.hover,
                                color: RMSTheme.primary.main
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(form.id)}
                          sx={{
                            color: RMSTheme.status.error,
                            '&:hover': {
                              backgroundColor: RMSTheme.background.hover,
                              color: RMSTheme.status.error
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="body2" sx={{ color: RMSTheme.text.secondary }}>
          Showing {reportForms.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
          {searchTerm && ` (filtered from total entries)`}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: RMSTheme.text.primary,
                '&:hover': {
                  backgroundColor: RMSTheme.background.hover,
                },
                '&.Mui-selected': {
                  backgroundColor: RMSTheme.primary.main,
                  color: RMSTheme.text.onPrimary,
                  '&:hover': {
                    backgroundColor: RMSTheme.primary.dark,
                  }
                }
              }
            }}
          />
        </Stack>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            background: RMSTheme.components.card.background,
            backdropFilter: RMSTheme.components.card.backdrop,
            border: `1px solid ${RMSTheme.components.card.border}`,
            borderRadius: RMSTheme.borderRadius.medium,
            boxShadow: RMSTheme.shadows.heavy,
            minWidth: '400px'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: RMSTheme.background.overlay,
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: RMSTheme.gradients.navbar,
            color: RMSTheme.text.onPrimary,
            fontWeight: 'bold',
            borderBottom: `1px solid ${RMSTheme.components.card.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Delete sx={{ color: RMSTheme.status.error }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText
            sx={{
              color: '#ffffff',
              fontSize: '16px',
              lineHeight: 1.6,
              fontWeight: 'bold',
            }}
          >
            Are you sure you want to delete this report form? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: RMSTheme.components.button.outlined.border,
              '&:hover': {
                backgroundColor: RMSTheme.components.button.outlined.hover,
                borderColor: RMSTheme.primary.light
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              background: RMSTheme.components.button.danger.background,
              color: RMSTheme.components.button.danger.text,
              boxShadow: RMSTheme.components.button.danger.shadow,
              '&:hover': {
                background: RMSTheme.components.button.danger.hover,
                boxShadow: RMSTheme.shadows.heavy
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportFormList;
