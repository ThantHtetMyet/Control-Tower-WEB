import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getEmployees } from '../api-services/employeeService';
import EmployeeNavBar from './EmployeeNavBar';
import EmployeeHierarchyModal from './EmployeeHierarchyModal';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalOccupations: 0,
    activeEmployees: 0,
    recentEmployees: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, allEmployees] = await Promise.all([
        getDashboardStats(),
        getEmployees()
      ]);
      
      setStats(dashboardStats);
      setEmployees(allEmployees.slice(0, 10)); // Show first 10 employees
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWorkPassStatus = (employee) => {
    if (!employee.workPassCardExpiredDate) return 'N/A';
    
    const expiryDate = new Date(employee.workPassCardExpiredDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Chip label="Expired" color="error" size="small" icon={<WarningIcon />} />;
    } else if (daysUntilExpiry <= 30) {
      return <Chip label={`${daysUntilExpiry} days`} color="warning" size="small" icon={<ScheduleIcon />} />;
    } else {
      return <Chip label="Valid" color="success" size="small" icon={<CheckCircleIcon />} />;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredEmployees = employees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.staffCardID?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExpiringEmployeesCount = () => {
    return employees.filter(emp => {
      if (!emp.workPassCardExpiredDate) return false;
      const expiryDate = new Date(emp.workPassCardExpiredDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length;
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: '#34C759', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Dashboard...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box p={3}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <EmployeeNavBar />
      <Box p={3}>
        {/* Enhanced Header Section */}
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
              
              <Stack spacing={1}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Employee Management Dashboard
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Welcome back! Here's your employee overview
                </Typography>
              </Stack>
                
                <Button
                  variant="contained"
                  startIcon={<AccountTreeIcon />}
                  onClick={() => setShowHierarchy(true)}
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                    color: 'white',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(52, 199, 89, 0.3)'
                    },
                    px: 3
                  }}
                >
                  View Employee Hierarchy
                </Button>
            </Stack>
            
            
          </Box>
          {/* Background decoration */}
          <Box 
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }} 
          />
        </Paper>
        
        {/* Enhanced Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              border: '1px solid #2196F3',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                      Total Employees
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                      {stats.totalEmployees}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#4CAF50', mr: 0.5 }} />
                      <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 'medium' }}>
                        +12% from last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: '#2196F3', width: 60, height: 60 }}>
                    <PeopleIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
              border: '1px solid #9C27B0',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                      Departments
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
                      {stats.totalDepartments}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'medium' }}>
                      Across organization
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#9C27B0', width: 60, height: 60 }}>
                    <BusinessIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
              border: '1px solid #4CAF50',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                      Occupations
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#388E3C' }}>
                      {stats.totalOccupations}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'medium' }}>
                      Job positions
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 60, height: 60 }}>
                    <WorkIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
              border: '1px solid #FF9800',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                      Work Pass Alerts
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#F57C00' }}>
                      <Badge badgeContent={getExpiringEmployeesCount()} color="error">
                        {getExpiringEmployeesCount()}
                      </Badge>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 'medium' }}>
                      Expiring in 30 days
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FF9800', width: 60, height: 60 }}>
                    <WarningIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Enhanced Recent Employees Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#34C759' }}>
                Recent Employees
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#34C759' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#34C759',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                  }}
                />
                <Button
                  variant="text"
                  onClick={() => navigate('/employee-management-system/employees')}
                  sx={{ color: '#34C759', fontWeight: 'medium' }}
                >
                  View All
                </Button>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid #e0e0e0'
            }}>
              <Table>
                <TableHead sx={{
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%)'
                }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Staff ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Occupation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Work Pass Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow 
                      key={employee.id}
                      sx={{
                        '&:hover': {
                          bgcolor: '#F8FDF8',
                          cursor: 'pointer'
                        }
                      }}
                      onDoubleClick={() => navigate(`/employee-management-system/employees/details/${employee.id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#34C759', width: 40, height: 40 }}>
                            {getInitials(employee.firstName, employee.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {employee.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.staffCardID}</TableCell>
                      <TableCell>{employee.departmentName || 'N/A'}</TableCell>
                      <TableCell>{employee.occupationName || 'N/A'}</TableCell>
                      <TableCell>{getWorkPassStatus(employee)}</TableCell>
                      <TableCell>{formatDate(employee.startWorkingDate)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/employee-management-system/employees/details/${employee.id}`)}
                              sx={{ color: '#34C759' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Employee">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/employee-management-system/employees/edit/${employee.id}`)}
                              sx={{ color: '#FF9800' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredEmployees.length === 0 && (
              <Box textAlign="center" py={4}>
                <PeopleIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography color="textSecondary" variant="h6">
                  {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                </Typography>
                <Typography color="textSecondary" variant="body2" sx={{ mb: 2 }}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first employee to get started'}
                </Typography>
                {!searchTerm && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/employee-management-system/employees/new')}
                    sx={{
                      background: 'linear-gradient(45deg, #34C759 30%, #28A745 90%)',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      textTransform: 'none',
                      boxShadow: '0 3px 5px 2px rgba(52, 199, 89, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #28A745 30%, #20A040 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 10px 4px rgba(52, 199, 89, .3)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Add First Employee
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Employee Hierarchy Modal */}
      <EmployeeHierarchyModal 
        open={showHierarchy} 
        onClose={() => setShowHierarchy(false)} 
      />

      {/* Add CSS for rotation animation */}
      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
}

export default EmployeeDashboard;
