import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Container,
  Stack,
  Rating
} from '@mui/material';
import {
  Work,
  ArrowBack,
  Edit,
  CalendarToday,
  Description,
  Note,
  People,
  Star,
  Person
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';
import moment from 'moment';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [occupation, setOccupation] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOccupationDetails();
    fetchOccupationEmployees();
  }, [id]);

  const fetchOccupationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Occupation/${id}`);
      if (!response.ok) {
        throw new Error('Occupation not found');
      }
      const data = await response.json();
      setOccupation(data);
    } catch (err) {
      setError('Error fetching occupation details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupationEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Employee`);
      if (response.ok) {
        const allEmployees = await response.json();
        // Filter employees by occupation ID
        const occupationEmployees = allEmployees.filter(emp => emp.occupationID === id);
        setEmployees(occupationEmployees);
      }
    } catch (err) {
      console.error('Error fetching occupation employees:', err);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FF9800';
    return '#F44336';
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'N/A';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Consistent field container component like EmployeeDetails
  const FieldContainer = ({ label, value, icon }) => (
    <Grid item xs={12}>
      <Box sx={{ 
        p: 3, 
        bgcolor: '#f8fafc', 
        borderRadius: 2, 
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        minHeight: '80px',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: '#f1f5f9',
          borderColor: '#cbd5e1'
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '200px', 
          minWidth: '200px',
          mr: 3
        }}>
          {icon && (
            <Box sx={{ 
              p: 1, 
              borderRadius: 1, 
              bgcolor: '#34C759', 
              color: 'white',
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
          )}
          <Typography variant="subtitle1" color="#64748b" fontWeight="600">
            {label}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="#1e293b" fontWeight="500">
            {value}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={60} sx={{ color: '#34C759' }} />
              <Typography variant="h6" color="textSecondary">
                Loading occupation details...
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <EmployeeNavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
            }}
          >
            <Typography variant="h6">Error Loading Occupation</Typography>
            <Typography>{error}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <EmployeeNavBar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section - Same style as DepartmentDetails */}
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
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/employee-management/occupations')}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Back to Occupations
              </Button>
              
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={() => navigate(`/employee-management/occupations/edit/${occupation.id}`)}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { 
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255,255,255, 0.2)'
                  },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Edit Occupation
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <Work sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.8)' }} />
              </Box>
              
              <Box>
                <Typography variant="h3" fontWeight="bold" mb={1}>
                  {occupation.occupationName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  
                  <Chip 
                    label={`${employees.length} Employees`}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </Stack>
              </Box>
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

        {/* Occupation Information Section */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: '#34C759', 
                color: 'white' 
              }}>
                <Work />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Occupation Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Description" 
                value={occupation.description || 'No description available'}
                icon={<Description fontSize="small" />}
              />
              <FieldContainer 
                label="Remark" 
                value={occupation.remark || 'No remarks available'}
                icon={<Note fontSize="small" />}
              />
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 3, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2, 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '80px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    borderColor: '#cbd5e1'
                  }
                }}>
                  
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Occupation Statistics Section */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: '#3b82f6', 
                color: 'white' 
              }}>
                <Star />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Occupation Statistics
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Total Employees" 
                value={employees.length}
                icon={<People fontSize="small" />}
              />
              <FieldContainer 
                label="Created Date" 
                value={formatDate(occupation.createdDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Last Updated" 
                value={formatDate(occupation.updatedDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              {occupation.createdByUserName && (
                <FieldContainer 
                  label="Created By" 
                  value={occupation.createdByUserName}
                  icon={<Person fontSize="small" />}
                />
              )}
              {occupation.updatedByUserName && (
                <FieldContainer 
                  label="Updated By" 
                  value={occupation.updatedByUserName}
                  icon={<Person fontSize="small" />}
                />
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Occupation Employees Section */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: '#34C759', 
                color: 'white' 
              }}>
                <People />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Employees with this Occupation ({employees.length})
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            {employees.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#34C759' }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#34C759' }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#34C759' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#34C759' }}>Mobile</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#34C759' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow 
                        key={employee.id} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(52, 199, 89, 0.05)' 
                          } 
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: '#34C759' }}>
                              {getInitials(employee.firstName, employee.lastName)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {employee.firstName} {employee.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {employee.staffCardID || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{employee.departmentName || 'N/A'}</TableCell>
                        <TableCell>{employee.email || 'N/A'}</TableCell>
                        <TableCell>{employee.mobileNo || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<Person />}
                            onClick={() => navigate(`/employee-management/employees/details/${employee.id}`)}
                            sx={{ 
                              color: '#34C759',
                              '&:hover': {
                                backgroundColor: 'rgba(52, 199, 89, 0.1)'
                              }
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <People sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No employees found with this occupation
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default OccupationDetails;