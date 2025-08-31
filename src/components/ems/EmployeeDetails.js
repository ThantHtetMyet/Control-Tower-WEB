import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Container,
  Avatar,
  Stack
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  Work,
  CalendarToday,
  Badge,
  CreditCard,
  Apps,
  ArrowBack,
  Edit,
  AccountCircle,
  ContactPhone
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';
import EmployeeCard3D from './EmployeeCard3D';
import moment from 'moment';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStaffCard, setShowStaffCard] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/Employee/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employee details');
      }

      const data = await response.json();
      setEmployee(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YYYY') : 'N/A';
  };

  const getGenderChipColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return '#009fe3'; // EMS green
      case 'female': return '#e5007e'; // Complementary red
      case 'other': return '#4ECDC4'; // Complementary teal
      default: return '#34C759'; // Neutral gray
    }
  };

  const getAccessStatusChip = (isRevoked) => {
    return (
      <Chip
        label={isRevoked ? 'Revoked' : 'Active'}
        color={isRevoked ? 'error' : 'success'}
        size="small"
      />
    );
  };

  const getStatusChipColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Consistent field container component
  const FieldContainer = ({ label, value, icon, isChip = false, chipColor = 'default' }) => (
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
          {isChip ? (
            <Chip 
              label={value} 
              color={chipColor}
              sx={{ fontWeight: 'bold' }}
            />
          ) : (
            <Typography variant="h6" color="#1e293b" fontWeight="500">
              {value}
            </Typography>
          )}
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
                Loading employee details...
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
            <Typography variant="h6">Error Loading Employee</Typography>
            <Typography>{error}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box>
        <EmployeeNavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="warning"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
            }}
          >
            <Typography variant="h6">Employee Not Found</Typography>
            <Typography>The requested employee could not be found.</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <EmployeeNavBar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/employee-management/employees')}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Back to Employees
              </Button>
              
              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={<Badge />}
                  variant="contained"
                  onClick={() => setShowStaffCard(true)}
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
                  View Staff Card
                </Button>
                
                <Button
                  startIcon={<Edit />}
                  variant="contained"
                  onClick={() => navigate(`/employee-management/employees/edit/${employee.id}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                    color: 'white',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(52, 199, 89, 0.3)'
                    },
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Edit Employee
                </Button>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem'
                }}
              >
                <AccountCircle sx={{ fontSize: '3rem' }} />
              </Avatar>
              
              <Box>
                <Typography variant="h3" fontWeight="bold" mb={1}>
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  
                  <Chip 
                    label={employee.occupationName} 
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

        {/* Personal Information Section */}
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
                <Person />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Personal Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Staff Card ID" 
                value={employee.staffCardID}
                icon={<Badge fontSize="small" />}
              />
              <FieldContainer 
                label="Staff RFID Card ID" 
                value={employee.staffIDCardID}
                icon={<CreditCard fontSize="small" />}
              />
              <FieldContainer 
                label="Date of Birth" 
                value={formatDate(employee.dateOfBirth)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Nationality" 
                value={employee.nationality || 'N/A'}
                icon={<Person fontSize="small" />}
              />
              <FieldContainer 
                label="Religion" 
                value={employee.religion || 'N/A'}
                icon={<Person fontSize="small" />}
              />
              <FieldContainer 
                  label="Gender" 
                  value={
                    <Chip 
                      label={employee.gender}
                      sx={{
                        bgcolor: getGenderChipColor(employee.gender),
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    />
                  }
                  icon={<Person fontSize="small" />}
                />

            </Grid>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
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
                <Phone />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Contact Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Email Address" 
                value={employee.email}
                icon={<Email fontSize="small" />}
              />
              <FieldContainer 
                label="Mobile Number" 
                value={employee.mobileNo}
                icon={<Phone fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>

        {/* Work Information Section */}
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
                bgcolor: '#8b5cf6', 
                color: 'white' 
              }}>
                <Work />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Work Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Department" 
                value={employee.departmentName}
                icon={<Business fontSize="small" />}
              />
              <FieldContainer 
                label="Occupation" 
                value={employee.occupationName}
                icon={<Work fontSize="small" />}
              />
              <FieldContainer 
                label="Start Working Date" 
                value={formatDate(employee.startWorkingDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Work Permit" 
                value={employee.workPermit || 'N/A'}
                icon={<Badge fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>

        {/* Work Pass Card Information Section */}
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
                bgcolor: '#f59e0b', 
                color: 'white' 
              }}>
                <CreditCard />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Work Pass Card Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Card Number" 
                value={employee.workPassCardNumber || 'N/A'}
                icon={<CreditCard fontSize="small" />}
              />
              <FieldContainer 
                label="Issued Date" 
                value={formatDate(employee.workPassCardIssuedDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Expired Date" 
                value={formatDate(employee.workPassCardExpiredDate)}
                icon={<CalendarToday fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>

        {/* Application Access Section */}
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
                bgcolor: '#06b6d4',
                color: 'white' 
              }}>
                <Apps />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Application Access
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 3, bgcolor: '#e2e8f0' }} />
            
            {employee.applicationAccesses && employee.applicationAccesses.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Application</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Access Level</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employee.applicationAccesses.map((access, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {access.applicationName}
                          </Typography>
                          <Typography variant="caption" color="#64748b">
                            {access.applicationDescription}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={access.accessLevelName} 
                            size="small"
                            sx={{ 
                              bgcolor: '#e0f2fe', 
                              color: '#0277bd',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {getAccessStatusChip(access.isRevoked)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="#64748b" textAlign="center" py={4}>
                No application access records found
              </Typography>
            )}
          </CardContent>
        </Card>
        
        {/* Emergency Contact Information Section */}
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
                <ContactPhone />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Emergency Contact Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Emergency Contact Name" 
                value={employee.emergencyContactName || 'N/A'}
                icon={<Person fontSize="small" />}
              />
              <FieldContainer 
                label="Emergency Contact Number" 
                value={employee.emergencyContactNumber || 'N/A'}
                icon={<Phone fontSize="small" />}
              />
              <FieldContainer 
                label="Relationship" 
                value={employee.emergencyRelationship || 'N/A'}
                icon={<ContactPhone fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: '#64748b', 
                color: 'white' 
              }}>
                <Badge />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Additional Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              
              <FieldContainer 
                label="Created Date" 
                value={formatDate(employee.createdDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Last Updated" 
                value={formatDate(employee.updatedDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Last Login" 
                value={formatDate(employee.lastLoginDate) || 'Never'}
                icon={<CalendarToday fontSize="small" />}
              />
              {employee.remark && (
                <FieldContainer 
                  label="Remarks" 
                  value={employee.remark}
                  icon={<Badge fontSize="small" />}
                />
              )}
            </Grid>
          </CardContent>
        </Card>
      </Container>
      {/* Add EmployeeCard3D Modal */}
      <EmployeeCard3D
        open={showStaffCard}
        onClose={() => setShowStaffCard(false)}
        employee={employee}
      />
      </Box>
);
};


export default EmployeeDetails;
