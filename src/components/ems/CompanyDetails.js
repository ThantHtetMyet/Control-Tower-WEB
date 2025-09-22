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
  Container,
  Stack
} from '@mui/material';
import {
  Business,
  ArrowBack,
  Edit,
  CalendarToday,
  Description,
  Note
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';
import moment from 'moment';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Company/${id}`);
      if (!response.ok) {
        throw new Error('Company not found');
      }
      const data = await response.json();
      setCompany(data);
    } catch (err) {
      setError('Error fetching company details: ' + err.message);
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
          <Typography variant="subtitle1" fontWeight="600" color="#475569">
            {label}
          </Typography>
        </Box>
        <Typography variant="body1" color="#1e293b" sx={{ flex: 1 }}>
          {value}
        </Typography>
      </Box>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} sx={{ color: '#34C759' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
            }}
          >
            <Typography variant="h6">Error Loading Company</Typography>
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
                onClick={() => navigate('/employee-management-system/companies')}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Back to Companies
              </Button>
              
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={() => navigate(`/employee-management-system/companies/edit/${company.id}`)}
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
                Edit Company
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
                <Business sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.8)' }} />
              </Box>
              
              <Box>
                <Typography variant="h3" fontWeight="bold" mb={1}>
                  {company.name}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Company Details
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

        {/* Company Information Section */}
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
                <Business />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Company Information
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Description" 
                value={company.description || 'No description available'}
                icon={<Description fontSize="small" />}
              />
              <FieldContainer 
                label="Remark" 
                value={company.remark || 'No remarks available'}
                icon={<Note fontSize="small" />}
              />
            </Grid>
          </CardContent>
        </Card>

        {/* Company Metadata Section */}
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
                bgcolor: '#3b82f6', 
                color: 'white' 
              }}>
                <CalendarToday />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                Metadata
              </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, bgcolor: '#e2e8f0' }} />
            
            <Grid container spacing={3}>
              <FieldContainer 
                label="Created Date" 
                value={moment(company.createdDate).format('MMMM DD, YYYY HH:mm')}
                icon={<CalendarToday fontSize="small" />}
              />
              {company.updatedDate && (
                <FieldContainer 
                  label="Last Updated" 
                  value={moment(company.updatedDate).format('MMMM DD, YYYY HH:mm')}
                  icon={<CalendarToday fontSize="small" />}
                />
              )}
              {company.createdByUserName && (
                <FieldContainer 
                  label="Created By" 
                  value={company.createdByUserName}
                  icon={<Note fontSize="small" />}
                />
              )}
              {company.updatedByUserName && (
                <FieldContainer 
                  label="Updated By" 
                  value={company.updatedByUserName}
                  icon={<Note fontSize="small" />}
                />
              )}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CompanyDetails;