import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  CheckCircle,
  Schedule,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import { getDashboardStatistics, getReportFormTypes } from '../api-services/reportFormService';
import RMSTheme from '../theme-resource/RMSTheme';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSpecificType, setSelectedSpecificType] = useState('');
  
  // Status options
  const statusOptions = ['Pending', 'In Progress', 'Under Review', 'Close', 'Cancelled'];
  
  // Specific report type options (showing the actual form types)
  const specificTypeOptions = [
    { value: 'Corrective Maintenance', label: 'Corrective Maintenance' },
    { value: 'Server', label: 'Preventative Maintenance (Server)' },
    { value: 'RTU', label: 'Preventative Maintenance (RTU)' }
  ];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  const statusColors = {
    'pending': '#ffb300',
    'in progress': RMSTheme.status.info,
    'under review': '#8e24aa',
    'close': '#2e7d32',
    'cancelled': RMSTheme.status.error,
    'unknown': '#757575'
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const formattedStartDate = startDate ? moment(startDate).format('YYYY-MM-DD') : null;
      const formattedEndDate = endDate ? moment(endDate).format('YYYY-MM-DD') : null;
      
      const data = await getDashboardStatistics(
        formattedStartDate,
        formattedEndDate,
        selectedReportType || null,
        selectedStatus || null,
        selectedSpecificType || null
      );
      
      setDashboardData(data);
    } catch (err) {
      setError('Error fetching dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedReportType, selectedStatus, selectedSpecificType]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedReportType('');
    setSelectedStatus('');
    setSelectedSpecificType('');
    // Fetch data without filters
    setTimeout(() => {
      fetchDashboardData();
    }, 100);
  };

  const getStatusChip = (status) => {
    const normalizedStatus = (status || '').trim().toLowerCase();
    const color = statusColors[normalizedStatus] || statusColors['unknown'];
    
    return (
      <Chip
        label={status || 'N/A'}
        sx={{
          fontWeight: 600,
          textTransform: 'capitalize',
          backgroundColor: color,
          color: '#fff'
        }}
        size="small"
      />
    );
  };

  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: RMSTheme.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: RMSTheme.text.primary, fontWeight: 'bold', mb: 1 }}
        >
          Report Management Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: RMSTheme.text.secondary }}>
          Overview of all report forms and statistics
        </Typography>
      </Box>

      {/* Filters Section */}
      <Card sx={{ 
        mb: 3, 
        backgroundColor: RMSTheme.background.paper,
        boxShadow: RMSTheme.shadows.medium,
        borderRadius: RMSTheme.borderRadius.medium
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: RMSTheme.text.primary, mb: 3, fontWeight: 'bold' }}>
            Filters
          </Typography>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} sm={6} lg={2.5}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'Select start date',
                    size: 'medium',
                    sx: {
                      minWidth: '200px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: RMSTheme.background.paper,
                        '&:hover fieldset': {
                          borderColor: RMSTheme.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: RMSTheme.primary.main
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: RMSTheme.text.secondary
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.5}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'Select end date',
                    size: 'medium',
                    sx: {
                      minWidth: '200px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: RMSTheme.background.paper,
                        '&:hover fieldset': {
                          borderColor: RMSTheme.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: RMSTheme.primary.main
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: RMSTheme.text.secondary
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <FormControl 
                fullWidth 
                size="medium"
                sx={{
                  minWidth: '280px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: RMSTheme.background.paper,
                    '&:hover fieldset': {
                      borderColor: RMSTheme.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: RMSTheme.primary.main
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: RMSTheme.text.secondary,
                    backgroundColor: RMSTheme.background.paper,
                    paddingX: 0.5
                  },
                  '& .MuiSelect-select': {
                    minHeight: '1.5em',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <InputLabel id="specific-type-label" shrink>Specific Report Type</InputLabel>
                <Select
                  labelId="specific-type-label"
                  id="specific-type-select"
                  value={selectedSpecificType}
                  label="Specific Report Type"
                  onChange={(e) => setSelectedSpecificType(e.target.value)}
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <span style={{ color: '#999' }}>All Specific Types</span>;
                    }
                    const option = specificTypeOptions.find(opt => opt.value === selected);
                    return option ? option.label : selected;
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        '& .MuiMenuItem-root': {
                          fontSize: '0.95rem'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: '#999' }}>All Specific Types</em>
                  </MenuItem>
                  {specificTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <FormControl 
                fullWidth 
                size="medium"
                sx={{
                  minWidth: '180px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: RMSTheme.background.paper,
                    '&:hover fieldset': {
                      borderColor: RMSTheme.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: RMSTheme.primary.main
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: RMSTheme.text.secondary,
                    backgroundColor: RMSTheme.background.paper,
                    paddingX: 0.5
                  },
                  '& .MuiSelect-select': {
                    minHeight: '1.5em',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <InputLabel id="status-label" shrink>Report Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status-select"
                  value={selectedStatus}
                  label="Report Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <span style={{ color: '#999' }}>All Statuses</span>;
                    }
                    return selected;
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        '& .MuiMenuItem-root': {
                          fontSize: '0.95rem'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: '#999' }}>All Statuses</em>
                  </MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} lg={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyFilters}
                size="large"
                sx={{
                  background: RMSTheme.gradients.primary,
                  color: '#FFFFFF',
                  height: '56px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    background: RMSTheme.gradients.accent,
                    transform: 'translateY(-2px)',
                    boxShadow: RMSTheme.shadows.large
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Apply
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResetFilters}
                startIcon={<Refresh />}
                size="large"
                sx={{
                  borderColor: RMSTheme.primary.main,
                  color: RMSTheme.primary.main,
                  height: '56px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: RMSTheme.primary.dark,
                    backgroundColor: RMSTheme.background.hover,
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: RMSTheme.shadows.medium
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {dashboardData && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: RMSTheme.gradients.primary,
                color: '#fff',
                boxShadow: RMSTheme.shadows.medium
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {dashboardData.totalReports}
                      </Typography>
                      <Typography variant="body2">
                        Total Reports
                      </Typography>
                    </Box>
                    <Assessment sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {dashboardData.statusBreakdown.map((statusData, index) => {
              const normalizedStatus = (statusData.status || '').trim().toLowerCase();
              let icon = <Schedule sx={{ fontSize: 48, opacity: 0.8 }} />;
              
              if (normalizedStatus === 'close') {
                icon = <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />;
              } else if (normalizedStatus === 'cancelled') {
                icon = <Cancel sx={{ fontSize: 48, opacity: 0.8 }} />;
              } else if (normalizedStatus === 'in progress') {
                icon = <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />;
              }
              
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{
                    background: `linear-gradient(135deg, ${statusColors[normalizedStatus]} 0%, ${statusColors[normalizedStatus]}cc 100%)`,
                    color: '#fff',
                    boxShadow: RMSTheme.shadows.medium
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {statusData.count}
                          </Typography>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {statusData.status}
                          </Typography>
                        </Box>
                        {icon}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Report Type Distribution */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                backgroundColor: RMSTheme.background.paper,
                boxShadow: RMSTheme.shadows.medium,
                borderRadius: RMSTheme.borderRadius.medium
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: RMSTheme.text.primary, mb: 2, fontWeight: 'bold' }}>
                    Report Type Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pie
                      data={{
                        labels: dashboardData.typeBreakdown.map(item => item.reportTypeName),
                        datasets: [{
                          data: dashboardData.typeBreakdown.map(item => item.count),
                          backgroundColor: COLORS,
                          borderColor: COLORS.map(color => color),
                          borderWidth: 1,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: RMSTheme.text.primary
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.parsed}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Distribution */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                backgroundColor: RMSTheme.background.paper,
                boxShadow: RMSTheme.shadows.medium,
                borderRadius: RMSTheme.borderRadius.medium
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: RMSTheme.text.primary, mb: 2, fontWeight: 'bold' }}>
                    Status Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={{
                        labels: dashboardData.statusBreakdown.map(item => item.status),
                        datasets: [{
                          label: 'Count',
                          data: dashboardData.statusBreakdown.map(item => item.count),
                          backgroundColor: RMSTheme.primary.main,
                          borderColor: RMSTheme.primary.dark,
                          borderWidth: 1,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            labels: {
                              color: RMSTheme.text.primary
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: RMSTheme.text.secondary
                            },
                            grid: {
                              color: RMSTheme.background.hover
                            }
                          },
                          x: {
                            ticks: {
                              color: RMSTheme.text.secondary
                            },
                            grid: {
                              color: RMSTheme.background.hover
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Trend */}
            <Grid item xs={12}>
              <Card sx={{
                backgroundColor: RMSTheme.background.paper,
                boxShadow: RMSTheme.shadows.medium,
                borderRadius: RMSTheme.borderRadius.medium
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: RMSTheme.text.primary, mb: 2, fontWeight: 'bold' }}>
                    Monthly Trend (Last 12 Months)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={{
                        labels: dashboardData.monthlyTrend.map(item => 
                          `${item.year}-${String(item.month).padStart(2, '0')}`
                        ),
                        datasets: [{
                          label: 'Reports',
                          data: dashboardData.monthlyTrend.map(item => item.count),
                          borderColor: RMSTheme.primary.main,
                          backgroundColor: RMSTheme.primary.light,
                          tension: 0.4,
                          fill: true,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            labels: {
                              color: RMSTheme.text.primary
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: RMSTheme.text.secondary
                            },
                            grid: {
                              color: RMSTheme.background.hover
                            }
                          },
                          x: {
                            ticks: {
                              color: RMSTheme.text.secondary
                            },
                            grid: {
                              color: RMSTheme.background.hover
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Reports Table */}
          <Card sx={{
            backgroundColor: RMSTheme.background.paper,
            boxShadow: RMSTheme.shadows.medium,
            borderRadius: RMSTheme.borderRadius.medium
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: RMSTheme.text.primary, mb: 2, fontWeight: 'bold' }}>
                Recent Reports
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: RMSTheme.background.hover }}>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Job No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Report Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Specific Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>System Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Station Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Created Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary }}>Created By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" sx={{ color: RMSTheme.text.secondary }}>
                            No recent reports found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      dashboardData.recentReports.map((report) => (
                        <TableRow
                          key={report.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: RMSTheme.background.hover,
                              cursor: 'pointer'
                            }
                          }}
                        >
                          <TableCell sx={{ color: RMSTheme.text.primary }}>{report.jobNo}</TableCell>
                          <TableCell sx={{ color: RMSTheme.text.primary }}>{report.reportType}</TableCell>
                          <TableCell sx={{ color: RMSTheme.text.primary }}>{report.specificType || 'N/A'}</TableCell>
                          <TableCell sx={{ color: RMSTheme.text.primary }}>{report.systemName}</TableCell>
                          <TableCell sx={{ color: RMSTheme.text.primary }}>{report.stationName}</TableCell>
                          <TableCell>{getStatusChip(report.status)}</TableCell>
                          <TableCell sx={{ color: RMSTheme.text.secondary }}>
                            {moment(report.createdDate).format('YYYY-MM-DD HH:mm')}
                          </TableCell>
                          <TableCell sx={{ color: RMSTheme.text.secondary }}>{report.createdBy}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ReportDashboard;

