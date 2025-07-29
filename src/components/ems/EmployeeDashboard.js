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
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getEmployees } from '../api-services/employeeService';
import EmployeeNavBar from './EmployeeNavBar';

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
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getWorkPassStatus = (employee) => {
    if (!employee.workPassCardExpiredDate) return 'N/A';
    
    const expiryDate = new Date(employee.workPassCardExpiredDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Chip label="Expired" color="error" size="small" />;
    } else if (daysUntilExpiry <= 30) {
      return <Chip label="Expiring Soon" color="warning" size="small" />;
    } else {
      return <Chip label="Valid" color="success" size="small" />;
    }
  };

  if (loading) {
    return (
      <>
        <EmployeeNavBar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <EmployeeNavBar />
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Employee Management Dashboard
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Employees
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalEmployees}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <BusinessIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Departments
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalDepartments}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <WorkIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Occupations
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalOccupations}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Employees
                    </Typography>
                    <Typography variant="h4">
                      {stats.activeEmployees}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        
        {/* Recent Employees Table */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Recent Employees
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate('/employee-management/employees')}
                  >
                    View All
                  </Button>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Staff ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Occupation</TableCell>
                        <TableCell>Work Pass Status</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.staffCardID}</TableCell>
                          <TableCell>
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.departmentName || 'N/A'}</TableCell>
                          <TableCell>{employee.occupationName || 'N/A'}</TableCell>
                          <TableCell>{getWorkPassStatus(employee)}</TableCell>
                          <TableCell>{formatDate(employee.startWorkingDate)}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => navigate(`/employee-management/employees/${employee.id}`)}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/employee-management/employees/${employee.id}/edit`)}
                              >
                                Edit
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {employees.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">
                      No employees found. Add your first employee to get started.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default EmployeeDashboard;