import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    CircularProgress,
    Alert,
    Chip,
    useTheme,
    useMediaQuery,
    Button
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Assessment, TrendingUp, Assignment, Schedule, Refresh } from '@mui/icons-material';
import api from '../api-services/api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
);

const ServiceReportDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [chartType, setChartType] = useState('pie');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const chartTypes = [
        { value: 'pie', label: 'Pie Chart', icon: '🥧' },
        { value: 'doughnut', label: 'Doughnut Chart', icon: '🍩' },
        { value: 'bar', label: 'Bar Chart', icon: '📊' },
        { value: 'line', label: 'Line Chart', icon: '📈' }
    ];

    const fetchDashboardData = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            
            const response = await api.get('/ServiceReport/dashboard-stats');
            setDashboardData(response.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        
        // Auto-refresh every 5 minutes
        const interval = setInterval(() => fetchDashboardData(true), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getChartData = () => {
        // Fix: Use lowercase 'formStatusDistribution' to match API response
        if (!dashboardData?.formStatusDistribution) return null;

        const labels = dashboardData.formStatusDistribution.map(item => item.statusName || item.StatusName);
        const data = dashboardData.formStatusDistribution.map(item => item.count || item.Count);
        
        const colors = [
            '#8e24aa', // Purple (primary)
            '#1976d2', // Blue
            '#388e3c', // Green
            '#f57c00', // Orange
            '#d32f2f', // Red
            '#7b1fa2', // Deep Purple
            '#303f9f', // Indigo
            '#00796b'  // Teal
        ];

        return {
            labels,
            datasets: [{
                label: 'Service Reports by Form Status',
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length).map(color => color + '80'),
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: isMobile ? 'bottom' : 'right',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Service Report Form Status Distribution',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: 20
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed * 100) / total).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            }
        },
        scales: chartType === 'bar' || chartType === 'line' ? {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        } : {}
    };

    const renderChart = () => {
        const chartData = getChartData();
        if (!chartData) return null;

        const chartProps = {
            data: chartData,
            options: chartOptions
        };

        switch (chartType) {
            case 'pie':
                return <Pie {...chartProps} />;
            case 'doughnut':
                return <Doughnut {...chartProps} />;
            case 'bar':
                return <Bar {...chartProps} />;
            case 'line':
                return <Line {...chartProps} />;
            default:
                return <Pie {...chartProps} />;
        }
    };

    const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
        <Card 
            elevation={3}
            sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}08)`,
                border: `1px solid ${theme.palette[color].light}30`
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" color={color}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box color={theme.palette[color].main}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} sx={{ color: '#8e24aa' }} />
                <Typography variant="h6" sx={{ ml: 2, color: '#8e24aa' }}>
                    Loading Dashboard...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={() => fetchDashboardData()}
                        >
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#8e24aa', fontWeight: 'bold' }}>
                        📊 Service Report Dashboard
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={() => fetchDashboardData(true)}
                    disabled={refreshing}
                    sx={{
                        borderColor: '#8e24aa',
                        color: '#8e24aa',
                        '&:hover': {
                            borderColor: '#8e24aa',
                            backgroundColor: '#8e24aa15'
                        }
                    }}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </Box>
            

            {/* Chart Section */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        {/* Chart Type Selector */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                            <Typography variant="h6" sx={{ color: '#8e24aa', fontWeight: 'bold' }}>
                                Form Status Distribution
                            </Typography>
                            
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Chart Type</InputLabel>
                                <Select
                                    value={chartType}
                                    label="Chart Type"
                                    onChange={(e) => setChartType(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#8e24aa',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#8e24aa',
                                            },
                                        },
                                    }}
                                >
                                    {chartTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <span>{type.icon}</span>
                                                {type.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Status Chips */}
                        {dashboardData?.formStatusDistribution && (
                        <Box mb={3} display="flex" flexWrap="wrap" gap={1}>
                            {dashboardData.formStatusDistribution.map((status, index) => (
                                <Chip
                                    key={status.statusName || status.StatusName}
                                    label={`${status.statusName || status.StatusName}: ${status.count || status.Count}`}
                                        variant="outlined"
                                        sx={{
                                            borderColor: '#8e24aa',
                                            color: '#8e24aa',
                                            '&:hover': {
                                                backgroundColor: '#8e24aa15'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        {/* Chart Container */}
                        <Box height={isMobile ? 300 : 400} position="relative">
                            {dashboardData?.formStatusDistribution?.length > 0 ? (
                                renderChart()
                            ) : (
                                <Box 
                                    display="flex" 
                                    justifyContent="center" 
                                    alignItems="center" 
                                    height="100%"
                                    flexDirection="column"
                                    gap={2}
                                >
                                    <Assessment sx={{ fontSize: 60, color: '#8e24aa50' }} />
                                    <Typography variant="h6" color="textSecondary">
                                        No form status data available for chart visualization
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

        </Box>
    );
};

export default ServiceReportDashboard;