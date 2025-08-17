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
  Divider
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
  Edit
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';
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
    return gender?.toLowerCase() === 'male' ? 'primary' : 'secondary';
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

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">Employee not found</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/employee-management/employees')}
              variant="outlined"
            >
              Back to Employees
            </Button>
            <Typography variant="h4" component="h1">
              Employee Details
            </Typography>
          </Box>
          <Button
            startIcon={<Edit />}
            variant="contained"
            onClick={() => navigate(`/employee-management/employees/edit/${employee.id}`)}
          >
            Edit Employee
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="primary">
                      {employee.firstName} {employee.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Staff Card ID</Typography>
                    <Typography variant="body1">{employee.staffCardID}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Staff ID Card ID</Typography>
                    <Typography variant="body1">{employee.staffIDCardID}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Gender</Typography>
                    <Chip 
                      label={employee.gender} 
                      color={getGenderChipColor(employee.gender)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                    <Typography variant="body1">{formatDate(employee.dateOfBirth)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Nationality</Typography>
                    <Typography variant="body1">{employee.nationality || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Religion</Typography>
                    <Typography variant="body1">{employee.religion || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone /> Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" /> {employee.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Mobile Number</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" /> {employee.mobileNo}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Work Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work /> Work Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Department</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" /> {employee.departmentName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Occupation</Typography>
                    <Typography variant="body1">{employee.occupationName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Start Working Date</Typography>
                    <Typography variant="body1">{formatDate(employee.startWorkingDate)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Last Working Date</Typography>
                    <Typography variant="body1">{formatDate(employee.lastWorkingDate)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Work Permit</Typography>
                    <Typography variant="body1">{employee.workPermit || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Work Pass Card Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCard /> Work Pass Card
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Card Number</Typography>
                    <Typography variant="body1">{employee.workPassCardNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Issued Date</Typography>
                    <Typography variant="body1">{formatDate(employee.workPassCardIssuedDate)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Expired Date</Typography>
                    <Typography variant="body1">{formatDate(employee.workPassCardExpiredDate)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Application Access */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Apps /> Application Access
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {employee.applicationAccesses && employee.applicationAccesses.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Application</TableCell>
                          <TableCell>Access Level</TableCell>
                          <TableCell>Granted Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Granted By</TableCell>
                          <TableCell>Remark</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {employee.applicationAccesses.map((access) => (
                          <TableRow key={access.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {access.applicationName}
                                </Typography>
                                {access.applicationDescription && (
                                  <Typography variant="caption" color="textSecondary">
                                    {access.applicationDescription}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>{access.accessLevelName}</TableCell>
                            <TableCell>{formatDate(access.grantedDate)}</TableCell>
                            <TableCell>{getAccessStatusChip(access.isRevoked)}</TableCell>
                            <TableCell>{access.grantedByUserName || 'N/A'}</TableCell>
                            <TableCell>{access.remark || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No application access assigned
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Remark</Typography>
                    <Typography variant="body1">{employee.remark || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Rating</Typography>
                    <Typography variant="body1">{employee.rating}/5</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Created Date</Typography>
                    <Typography variant="body1">{formatDate(employee.createdDate)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Last Updated</Typography>
                    <Typography variant="body1">{formatDate(employee.updatedDate)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Created By</Typography>
                    <Typography variant="body1">{employee.createdByUserName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Updated By</Typography>
                    <Typography variant="body1">{employee.updatedByUserName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Last Login</Typography>
                    <Typography variant="body1">{formatDate(employee.lastLogin)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EmployeeDetails;