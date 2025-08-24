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
  Divider
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

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
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

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employee-management/companies')}
            sx={{ mr: 2 }}
          >
            Back to Companies
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#34C759', flexGrow: 1 }}>
            Company Details
          </Typography>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/employee-management/companies/edit/${company.id}`)}
            sx={{
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)'
              }
            }}
          >
            Edit Company
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Business sx={{ fontSize: 40, color: '#34C759', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {company.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Company ID: {company.id}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Description sx={{ color: '#666', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Description
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, pl: 4 }}>
                    {company.description || 'No description provided'}
                  </Typography>
                </Grid>

                {company.remark && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Note sx={{ color: '#666', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Remark
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, pl: 4 }}>
                      {company.remark}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#34C759' }}>
                  Company Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Created Date
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                    {moment(company.createdDate).format('MMMM DD, YYYY')}
                  </Typography>
                </Box>

                {company.updatedDate && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Last Updated
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                      {moment(company.updatedDate).format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CompanyDetails;