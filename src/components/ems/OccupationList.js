import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box,  Tooltip, LinearProgress,
  Alert, Snackbar, Avatar
} from '@mui/material';
import { Edit, Delete, Add,  Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationList = () => {
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOccupations();
  }, []);

  const fetchOccupations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Occupation`);
      if (!response.ok) {
        throw new Error('Failed to fetch occupations');
      }
      const data = await response.json();
      setOccupations(data);
    } catch (err) {
      setError('Error fetching occupations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, occupationName) => {
    if (window.confirm(`Are you sure you want to delete "${occupationName}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/Occupation/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to delete occupation');
        }
        
        setSuccessMessage('Occupation deleted successfully!');
        fetchOccupations();
      } catch (err) {
        setError('Error deleting occupation: ' + err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };


  const getInitials = (occupationName) => {
    return occupationName.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading occupations...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#34C759' }}>
            Occupation Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/occupations/new')}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
              }
            }}
          >
            Add Occupation
          </Button>
        </Box>

        {occupations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Work sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No occupations found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by adding your first occupation
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employee-management/occupations/new')}
              sx={{
                background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
                }
              }}
            >
              Add First Occupation
            </Button>
          </Box>
        ) : (
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupations.map((occupation) => (
                    <TableRow key={occupation.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#34C759', width: 40, height: 40 }}>
                            {getInitials(occupation.occupationName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {occupation.occupationName}
                            </Typography>
                            {occupation.remark && (
                              <Typography variant="body2" color="text.secondary">
                                {occupation.remark}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {occupation.description || 'No description'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(occupation.createdDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/employee-management/occupations/edit/${occupation.id}`)}
                              sx={{ color: '#34C759' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(occupation.id, occupation.occupationName)}
                              sx={{ color: '#f44336' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default OccupationList;