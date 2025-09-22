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
  Container,
  Stack
} from '@mui/material';
import {
  Business,
  ArrowBack,
  Edit,
  CalendarToday,
  Description,
  Note,
  Star,
  Person,
  AccountTree
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';
import moment from 'moment';
import { fetchSubDepartmentById } from '../api-services/subDepartmentService';

const SubDepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subDepartment, setSubDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubDepartmentData();
  }, [id]);

  const fetchSubDepartmentData = async () => {
    try {
      setLoading(true);
      const data = await fetchSubDepartmentById(id);
      setSubDepartment(data);
    } catch (err) {
      setError('Error fetching sub-department details: ' + err.message);
    } finally {
      setLoading(false);
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

  // Consistent field container component like DepartmentDetails
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
                Loading sub-department details...
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
            <Typography variant="h6">Error Loading Sub-Department</Typography>
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
                onClick={() => navigate('/employee-management-system/sub-departments')}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Back to Sub-Departments
              </Button>
              
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={() => navigate(`/employee-management-system/sub-departments/${subDepartment.id}/edit`)}
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
                Edit Sub-Department
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
                <AccountTree sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.8)' }} />
              </Box>
              
              <Box>
                <Typography variant="h3" fontWeight="bold" mb={1}>
                  {subDepartment.name}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip 
                    label={subDepartment.departmentName || 'No Parent Department'}
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

        {/* Sub-Department Information Section */}
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
                <AccountTree />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Sub-Department Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Sub-Department Name" 
                value={subDepartment?.name || 'N/A'}
                icon={<AccountTree fontSize="small" />}
              />
              <FieldContainer 
                label="Parent Department" 
                value={subDepartment?.departmentName || 'No parent department'}
                icon={<Business fontSize="small" />}
              />
              <FieldContainer 
                label="Description" 
                value={subDepartment?.description || 'No description available'}
                icon={<Description fontSize="small" />}
              />
              <FieldContainer 
                label="Remark" 
                value={subDepartment?.remark || 'No remarks available'}
                icon={<Note fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>

        {/* Sub-Department Statistics Section */}
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
                Sub-Department Statistics
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              
              <FieldContainer 
                label="Created Date" 
                value={formatDate(subDepartment?.createdDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Last Updated" 
                value={formatDate(subDepartment?.updatedDate)}
                icon={<CalendarToday fontSize="small" />}
              />
              {subDepartment?.createdByName && (
                <FieldContainer 
                  label="Created By" 
                  value={subDepartment.createdByName}
                  icon={<Person fontSize="small" />}
                />
              )}
              {subDepartment?.updatedByName && (
                <FieldContainer 
                  label="Updated By" 
                  value={subDepartment.updatedByName}
                  icon={<Person fontSize="small" />}
                />
              )}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SubDepartmentDetails;