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
  Apps,
  ArrowBack,
  Edit,
  CalendarToday,
  Description,
  Note,
  Person
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';
import moment from 'moment';
// Fix the import path - change from services to api-services
import applicationService from '../api-services/applicationService';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getApplication(id);
      setApplication(response); // Changed from response.data to response
      setError('');
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError('Failed to load application details. Please try again.');
    } finally {
      setLoading(false);
    }
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
                Loading application details...
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
            <Typography variant="h6">Error Loading Application</Typography>
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
                onClick={() => navigate('/employee-management-system/applications')}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Back to Applications
              </Button>
              
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={() => navigate(`/employee-management-system/applications/edit/${application.id}`)}
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
                Edit Application
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
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                <Apps sx={{ fontSize: 60, color: 'white' }} />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {application?.applicationName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Created {moment(application?.createdDate).format('MMMM DD, YYYY')}
                  </Typography>
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

        {/* Application Information Section */}
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
                <Apps />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Application Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Application Name" 
                value={application?.applicationName || 'N/A'}
                icon={<Apps fontSize="small" />}
              />
              <FieldContainer 
                label="Description" 
                value={application?.description || 'No description available'}
                icon={<Description fontSize="small" />}
              />
              <FieldContainer 
                label="Remark" 
                value={application?.remark || 'No remarks available'}
                icon={<Note fontSize="small" />}
              />
              <FieldContainer 
                label="Created Date" 
                value={application?.createdDate ? moment(application.createdDate).format('MMMM DD, YYYY [at] h:mm A') : 'N/A'}
                icon={<CalendarToday fontSize="small" />}
              />
              <FieldContainer 
                label="Created By" 
                value={application?.createdByUserName || 'N/A'}
                icon={<Person fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ApplicationDetails;