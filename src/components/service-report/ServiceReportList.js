import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, Slide, Fade, TextField, MenuItem, Grid, Card, CardContent,
  InputAdornment, Collapse, Divider
} from '@mui/material';
import {
  Edit, Delete, Add, Search, Clear, FilterList, ExpandMore, ExpandLess,
  CalendarToday, Person, Business, Assignment, LocationOn, Category
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import api from '../api-services/api';
import ConfirmationModal from '../common/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

function ServiceReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, reportId: null, jobNumber: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Search state
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchField, setSearchField] = useState('jobNumber');
  const [searchValue, setSearchValue] = useState('');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  // Search field options
  const searchFields = [
    { value: 'jobNumber', label: 'Job Number', icon: <Assignment /> },
    { value: 'customer', label: 'Customer', icon: <Business /> },
    { value: 'projectNumber', label: 'Project Number', icon: <Category /> },
    { value: 'systemName', label: 'System Name', icon: <Category /> },
    { value: 'locationName', label: 'Location', icon: <LocationOn /> },
    { value: 'createdBy', label: 'Created By', icon: <Person /> }
  ];

  const VISIBLE_COUNT = 5;
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const [pagerStart, setPagerStart] = useState(1);
  const [groupIn, setGroupIn] = useState(true);
  const [animDir, setAnimDir] = useState('left');

  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage]);

  // Check if search is active
  useEffect(() => {
    const isActive = searchField && searchValue || dateFrom || dateTo;
    setHasActiveSearch(isActive);
  }, [searchField, searchValue, dateFrom, dateTo]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Determine which endpoint to use based on search criteria
      const hasSearch = (searchField && searchValue) || dateFrom || dateTo;
      
      let response;
      if (hasSearch) {
        // Use search endpoint
        const searchParams = {
          page: page + 1,
          pageSize: rowsPerPage
        };
        
        if (searchField && searchValue) {
          searchParams.searchField = searchField;
          searchParams.searchValue = searchValue;
        }
        
        if (dateFrom) {
          searchParams.startDate = format(dateFrom, 'yyyy-MM-dd');
        }
        
        if (dateTo) {
          searchParams.endDate = format(dateTo, 'yyyy-MM-dd');
        }
        
        response = await api.get('/ServiceReport/search', {
          params: searchParams
        });
      } else {
        // Use regular endpoint
        response = await api.get('/ServiceReport', {
          params: { page: page + 1, pageSize: rowsPerPage }
        });
      }
      
      setReports(response.data.items || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showNotification('Error fetching reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchReports();
  };

  const handleClearSearch = () => {
      setSearchField('jobNumber'); 
      setSearchValue('');
      setDateFrom(null);
      setDateTo(null);
      setPage(0);
      // Manually trigger search after clearing
      setTimeout(() => {
        fetchReports();
      }, 0);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  useEffect(() => {
    const current = page + 1;
    const maxStart = Math.max(1, totalPages - VISIBLE_COUNT + 1);
    const centeredStart = clamp(current - Math.floor(VISIBLE_COUNT / 2), 1, maxStart);
    setPagerStart(centeredStart);
  }, [page, totalPages]);

  const visiblePages = useMemo(() => {
    const maxStart = Math.max(1, totalPages - VISIBLE_COUNT + 1);
    const start = clamp(pagerStart, 1, maxStart);
    const end = Math.min(totalPages, start + VISIBLE_COUNT - 1);
    const arr = [];
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [pagerStart, totalPages]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (report) => {
    setDeleteModal({ open: true, reportId: report.id, jobNumber: report.jobNumber });
  };

  const handleDeleteConfirm = async () => {
    try {
      const currentUserId = user?.id || '00000000-0000-0000-0000-000000000000';
      await api.delete(`/ServiceReport/${deleteModal.reportId}?updatedBy=${currentUserId}`);
      setDeleteModal({ open: false, reportId: null, jobNumber: '' });
      showNotification(`Service Report ${deleteModal.jobNumber} has been deleted successfully`, 'success');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      showNotification('Error deleting report. Please try again.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, reportId: null, jobNumber: '' });
  };

  // macOS-style paginator visibility
  const [showPaginator, setShowPaginator] = useState(true);
  const scrollTimeout = useRef(null);
  useEffect(() => {
    let lastY = window.scrollY;
  
    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
  
      const atBottom = (maxScroll - y) <= 24;
      const atTop = y <= 8;
  
      if (atBottom || atTop) {
        setShowPaginator(true);
      } else if (y > lastY + 10) {
        setShowPaginator(false);
      } else if (y < lastY - 10) {
        setShowPaginator(true);
      }
  
      lastY = y;
    };
  
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3, 
          borderBottom: '2px solid #800080', 
          pb: 2 
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#800080' }}>
            Issue Tracker List
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant={searchExpanded ? "contained" : "outlined"}
              startIcon={<FilterList />}
              endIcon={searchExpanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setSearchExpanded(!searchExpanded)}
              sx={{ 
                color: searchExpanded ? '#fff' : '#800080',
                bgcolor: searchExpanded ? '#800080' : 'transparent',
                borderColor: '#800080',
                fontWeight: searchExpanded ? 'bold' : 'normal',
                '&:hover': { 
                  bgcolor: searchExpanded ? '#4B0082' : 'rgba(128, 0, 128, 0.04)' 
                }
              }}
            >
              {searchExpanded ? 'Hide Search' : (hasActiveSearch ? 'Search Active' : 'Search & Filter')}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => navigate('/service-report/new')} 
              sx={{ 
                bgcolor: '#800080', 
                '&:hover': { bgcolor: '#4B0082' }, 
                px: 3 
              }}
            >
              New Report
            </Button>
          </Box>
        </Box>

        {/* Search Panel */}
        <Collapse in={searchExpanded}>
          <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(128, 0, 128, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#800080', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search /> Search & Filter Options
              </Typography>
              
              <Grid container spacing={3}>
                {/* Field Search */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Search by Field
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        select
                        fullWidth
                        label="Search Field"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="">
                          <em>Select field...</em>
                        </MenuItem>
                        {searchFields.map((field) => (
                          <MenuItem key={field.value} value={field.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {field.icon}
                              {field.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <TextField
                        fullWidth
                        label="Search Value"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        disabled={!searchField}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: searchField ? '#800080' : 'disabled' }} />
                            </InputAdornment>
                          ),
                        }}
                        placeholder={searchField ? `Enter ${searchFields.find(f => f.value === searchField)?.label.toLowerCase()}...` : 'Select a field first'}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Date Range */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Date Range Filter
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="From Date"
                        value={dateFrom}
                        onChange={setDateFrom}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarToday sx={{ color: '#800080' }} />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="To Date"
                        value={dateTo}
                        onChange={setDateTo}
                        minDate={dateFrom}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarToday sx={{ color: '#800080' }} />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Search Actions */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleClearSearch}
                  disabled={!hasActiveSearch}
                  sx={{ color: '#666', borderColor: '#666' }}
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  sx={{ bgcolor: '#800080', '&:hover': { bgcolor: '#4B0082' } }}
                >
                  Search
                </Button>
              </Box>

              {/* Active Search Indicator */}
              {hasActiveSearch && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ color: '#800080', fontWeight: 600 }}>
                    Active Filters:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {searchField && searchValue && (
                      <Chip
                        label={`${searchFields.find(f => f.value === searchField)?.label}: ${searchValue}`}
                        size="small"
                        onDelete={() => { setSearchField(''); setSearchValue(''); }}
                        sx={{ bgcolor: '#E6E6FA', color: '#4B0082' }}
                      />
                    )}
                    {dateFrom && (
                      <Chip
                        label={`From: ${format(dateFrom, 'dd/MM/yyyy')}`}
                        size="small"
                        onDelete={() => setDateFrom(null)}
                        sx={{ bgcolor: '#E6E6FA', color: '#4B0082' }}
                      />
                    )}
                    {dateTo && (
                      <Chip
                        label={`To: ${format(dateTo, 'dd/MM/yyyy')}`}
                        size="small"
                        onDelete={() => setDateTo(null)}
                        sx={{ bgcolor: '#E6E6FA', color: '#4B0082' }}
                      />
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Collapse>

        {/* Results Summary */}
        {hasActiveSearch && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {loading ? 'Searching...' : `Found ${totalCount} result${totalCount !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
        )}

        {/* Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            boxShadow: 'none', 
            borderRadius: 2, 
            overflow: 'hidden', 
            '&:hover': { boxShadow: '0 8px 24px rgba(128, 0, 128, 0.2)' }, 
            transition: 'box-shadow 0.3s ease-in-out' 
          }}
        >
          {loading && <LinearProgress sx={{ bgcolor: '#E6E6FA' }} />}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Job No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Project No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>System</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      {hasActiveSearch ? 'No reports found matching your search criteria.' : 'No service reports found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    onDoubleClick={() => navigate(`/service-report/details/${report.id}`)}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: '#FCF6FF', 
                        transform: 'scale(1.002)', 
                        transition: 'transform 0.2s ease-in-out', 
                        cursor: 'pointer' 
                      } 
                    }}
                  >
                    <TableCell>{report.jobNumber}</TableCell>
                    <TableCell>{report.customer}</TableCell>
                    <TableCell>{report.projectNumberName}</TableCell>
                    <TableCell>{report.systemName}</TableCell>
                    <TableCell>{report.locationName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={report.formStatus?.[0]?.name || 'N/A'} 
                        size="small" 
                        sx={{ bgcolor: '#E6E6FA', color: '#4B0082' }} 
                      />
                    </TableCell>
                    <TableCell>
                      {report.createdDate 
                        ? format(new Date(report.createdDate), 'dd/MM/yyyy HH:mm')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Report">
                        <IconButton 
                          onClick={() => navigate(`/service-report/edit/${report.id}`)} 
                          sx={{ color: '#800080' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Report">
                        <IconButton 
                          onClick={() => handleDeleteClick(report)} 
                          sx={{ 
                            color: '#d32f2f', 
                            '&:hover': { 
                              color: '#b71c1c', 
                              backgroundColor: 'rgba(211, 47, 47, 0.04)' 
                            } 
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Spacer for fixed pagination */}
        {totalCount > 10 && <Box sx={{ height: 72 }} />}

        {/* Pagination - only show when there are more than 10 items */}
        {totalCount > 10 && (
          <Slide direction="up" in={true}>
            <Box
              sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                bgcolor: 'transparent',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                Page {page + 1} of {totalPages} • {totalCount || 0} items
                {hasActiveSearch && ' (filtered)'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setPage(Math.max(0, page - 1))} 
                  disabled={page === 0}
                >
                  Previous
                </Button>

                <Box
                  onWheel={(e) => {
                    if (!e.currentTarget.matches(':hover') || totalPages <= VISIBLE_COUNT) return;
                    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
                    if (!delta) return;
                    if (e.cancelable) e.preventDefault();
                    const step = delta > 0 ? 1 : -1;
                    const maxStart = Math.max(1, totalPages - VISIBLE_COUNT + 1);
                    const newStart = clamp(pagerStart + step, 1, maxStart);
                    if (newStart === pagerStart) return;
                    setAnimDir(step > 0 ? 'left' : 'right');
                    setGroupIn(false);
                    setTimeout(() => { setPagerStart(newStart); setGroupIn(true); }, 0);
                  }}
                  sx={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 200, px: 1, py: 0.5, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    transition: 'all 0.25s ease-in-out', userSelect: 'none', overscrollBehavior: 'contain',
                    '&:hover': { boxShadow: '0 6px 28px rgba(0,0,0,0.25)', bgcolor: 'rgba(255,255,255,0.75)' }
                  }}
                >
                  <Slide in={groupIn} direction={animDir}>
                    <Fade in={groupIn} timeout={400}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {visiblePages.map((p) => {
                          const isActive = page + 1 === p;
                          return (
                            <Button 
                              key={p} 
                              onClick={() => setPage(p - 1)}
                              sx={{
                                width: 40, height: 40, minWidth: 40, p: 0, borderRadius: '50%', fontWeight: 600,
                                fontSize: '0.9rem', transition: 'all 0.25s cubic-bezier(0.25,1,0.5,1)',
                                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.25),0 0 8px rgba(128,0,255,0.5)' : '0 2px 6px rgba(0,0,0,0.1)',
                                bgcolor: isActive ? '#8000FF' : 'transparent', color: isActive ? '#fff' : '#8000FF',
                                animation: isActive ? 'pulseRing 1.5s infinite' : 'none',
                                '&:hover': { transform: 'scale(1.15)', bgcolor: isActive ? '#6A00CC' : 'rgba(128,0,255,0.08)' },
                                '&:active': { transform: 'scale(1.05)' }
                              }}
                            >
                              {p}
                            </Button>
                          );
                        })}
                      </Box>
                    </Fade>
                  </Slide>
                </Box>

                <Button 
                  variant="contained" 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
                  disabled={page + 1 >= totalPages}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Slide>
        )}

        <style>{`
          @keyframes pulseRing {
            0% { box-shadow: 0 0 0 0 rgba(128,0,255,0.5); }
            70% { box-shadow: 0 0 0 8px rgba(128,0,255,0); }
            100% { box-shadow: 0 0 0 0 rgba(128,0,255,0); }
          }
        `}</style>

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={deleteModal.open}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Service Report"
          message={`Are you sure you want to delete Service Report "${deleteModal.jobNumber}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          severity="error"
        />

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default ServiceReportList;