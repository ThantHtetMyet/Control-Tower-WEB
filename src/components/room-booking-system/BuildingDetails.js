import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Container,
  Stack
} from '@mui/material';
import {
  Business,
  Code,
  LocationOn,
  CalendarToday,
  Update,
  Person,
  ArrowBack,
  Edit
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBuildingById } from '../api-services/buildingService';
import moment from 'moment';

const BuildingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuildingDetails();
  }, [id]);

  const fetchBuildingDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchBuildingById(id);
      setBuilding(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YYYY') : 'N/A';
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ p: 3 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading building details...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with back and edit buttons */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '2px solid #3f51b5',
          pb: 2
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/room-booking-system/buildings')}
              sx={{ color: '#3f51b5' }}
            >
              Back to Buildings
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Building Details
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/room-booking-system/buildings/edit/${building.id}`)}
            sx={{
              background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
              }
            }}
          >
            Edit Building
          </Button>
        </Box>

        {/* Building Information Card */}
        <Card sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              p: 3,
              background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                {building.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Building Code: {building.code || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <LocationOn sx={{ mr: 2, color: '#3f51b5' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {building.address || 'No address provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Code sx={{ mr: 2, color: '#3f51b5' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Building Code
                      </Typography>
                      <Typography variant="body1">
                        {building.code || 'No code assigned'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <CalendarToday sx={{ mr: 2, color: '#3f51b5' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(building.createdDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Update sx={{ mr: 2, color: '#3f51b5' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(building.updatedDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Person sx={{ mr: 2, color: '#3f51b5' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created By
                      </Typography>
                      <Typography variant="body1">
                        {building.createdByUserName || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Person sx={{ mr: 2, color: '#3f51b5' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Updated By
                      </Typography>
                      <Typography variant="body1">
                        {building.updatedByUserName || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Future section for rooms in this building */}
        <Card sx={{
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 2 }}>
              Rooms in this Building
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Room management functionality will be implemented in future updates.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BuildingDetails;