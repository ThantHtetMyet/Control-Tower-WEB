import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './components/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import ServiceReportList from './components/service-report/ServiceReportList';
import ServiceReportForm from './components/service-report/ServiceReportForm';
import ServiceReportEdit from './components/service-report/ServiceReportEdit';
import ServiceReportImport from './components/service-report/ServiceReportImport';
import NavBar from './components/service-report/ServiceReportNavBar';
import { Box } from '@mui/material';
import Dashboard from './components/service-report/ServiceReportDashboard';
import ServiceReportDetails from './components/service-report/ServiceReportDetails';
import ModuleSelection from './components/ModuleSelection';
// Remove this line:
// import ApplicationDashboard from './employeemanagementsystem/ApplicationDashboard';

import theme from './theme';
import ApplicationList from './components/ems/ApplicationList';
import EmployeeDashboard from './components/ems/EmployeeDashboard';

// Add these imports
import DepartmentList from './components/ems/DepartmentList';
import DepartmentForm from './components/ems/DepartmentForm';
import DepartmentEdit from './components/ems/DepartmentEdit';
import EmployeeList from './components/ems/EmployeeList';
import EmployeeForm from './components/ems/EmployeeForm';
import EmployeeEdit from './components/ems/EmployeeEdit';
import EmployeeDetails from './components/ems/EmployeeDetails';
import OccupationList from './components/ems/OccupationList';
import OccupationForm from './components/ems/OccupationForm';
import OccupationEdit from './components/ems/OccupationEdit';
import ApplicationForm from './components/ems/ApplicationForm';

// Add NewsPortalSystem imports
import NewsList from './components/news-portal-system/NewsList';
import NewsForm from './components/news-portal-system/NewsForm';
import NewsCategoryList from './components/news-portal-system/NewsCategoryList';
import NewsCategoryForm from './components/news-portal-system/NewsCategoryForm';
import NewsNavBar from './components/news-portal-system/NewsNavBar';
// Add import
import NewsPortalLayout from './components/news-portal-system/NewsPortalLayout';
// Add this import
import NewsDisplay from './components/news-portal-system/NewsDisplay';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/modules" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/modules"
                  element={
                    <ProtectedRoute>
                      <ModuleSelection />
                    </ProtectedRoute>
                  }
                />
                
                {/* Employee Management System Routes */}
                <Route
                  path="/employee-management"
                  element={
                    <ProtectedRoute>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/departments"
                  element={
                    <ProtectedRoute>
                      <DepartmentList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/departments/new"
                  element={
                    <ProtectedRoute>
                      <DepartmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/departments/edit/:id"
                  element={
                    <ProtectedRoute>
                      <DepartmentEdit />
                    </ProtectedRoute>
                  }
                />
                {/* Employee Routes */}
                <Route
                  path="/employee-management/employees"
                  element={
                    <ProtectedRoute>
                      <EmployeeList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/employees/new"
                  element={
                    <ProtectedRoute>
                      <EmployeeForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/employees/details/:id"
                  element={
                    <ProtectedRoute>
                      <EmployeeDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/employees/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EmployeeEdit />
                    </ProtectedRoute>
                  }
                />

                {/* Occupation Routes */}
                <Route 
                  path="/employee-management/occupations" 
                  element={
                    <ProtectedRoute>
                      <OccupationList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee-management/occupations/new" 
                  element={
                    <ProtectedRoute>
                      <OccupationForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee-management/occupations/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <OccupationEdit />
                    </ProtectedRoute>
                  } 
                />

                {/* Application Routes */}
                <Route
                  path="/employee-management/applications"
                  element={
                    <ProtectedRoute>
                      <ApplicationList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/applications/new"
                  element={
                    <ProtectedRoute>
                      <ApplicationForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/applications/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ApplicationForm />
                    </ProtectedRoute>
                  }
                />

                {/* Service Report System Routes */}
                <Route
                  path="/service-report-system/dashboard"
                  element={
                    <ProtectedRoute>
                      <NavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <Dashboard />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-report-system"
                  element={
                    <ProtectedRoute>
                      <NavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ServiceReportList />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-report/new"
                  element={
                    <ProtectedRoute>
                      <NavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ServiceReportForm />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-report/edit/:id"
                  element={
                    <ProtectedRoute>
                      <NavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ServiceReportEdit />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-report/details/:id"
                  element={
                    <ProtectedRoute>
                      <NavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ServiceReportDetails />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-report-system/import"
                  element={
                    <ProtectedRoute>
                      <NavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ServiceReportImport />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                
                {/* News Portal System Routes - Updated Structure */}
                <Route
                  path="/news-portal-system"
                  element={
                    <ProtectedRoute>
                      <NewsPortalLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<NewsDisplay />} />
                  <Route path="news" element={<NewsList />} />
                  <Route path="news/new" element={<NewsForm />} />
                  <Route path="news/edit/:id" element={<NewsForm />} />
                  <Route path="categories" element={<NewsCategoryList />} />
                  <Route path="categories/new" element={<NewsCategoryForm />} />
                  <Route path="categories/edit/:id" element={<NewsCategoryForm />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </LocalizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

