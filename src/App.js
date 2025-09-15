import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './components/contexts/AuthContext';
import HRProtectedRoute from './components/auth/HRProtectedRoute';
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
import OccupationDetails from './components/ems/OccupationDetails';
// Add OccupationLevel imports
import OccupationLevelList from './components/ems/OccupationLevelList';
import OccupationLevelForm from './components/ems/OccupationLevelForm';
import OccupationLevelEdit from './components/ems/OccupationLevelEdit';
import OccupationLevelDetails from './components/ems/OccupationLevelDetails';
import ApplicationForm from './components/ems/ApplicationForm';
import ApplicationEdit from './components/ems/ApplicationEdit';
import ApplicationDetails from './components/ems/ApplicationDetails';
import CompanyList from './components/ems/CompanyList';
import CompanyForm from './components/ems/CompanyForm';
import CompanyEdit from './components/ems/CompanyEdit';
import CompanyDetails from './components/ems/CompanyDetails';

// Add SubDepartment imports
import SubDepartmentList from './components/ems/SubDepartmentList';
import SubDepartmentForm from './components/ems/SubDepartmentForm';
import SubDepartmentEdit from './components/ems/SubDepartmentEdit';
import SubDepartmentDetails from './components/ems/SubDepartmentDetails';
// Add NewsPortalSystem imports
import NewsList from './components/news-portal-system/NewsList';
import NewsForm from './components/news-portal-system/NewsForm';
import NewsCategoryList from './components/news-portal-system/NewsCategoryList';
import NewsCategoryForm from './components/news-portal-system/NewsCategoryForm';
// Add import
import NewsPortalLayout from './components/news-portal-system/NewsPortalLayout';
// Add this import
import NewsDisplay from './components/news-portal-system/NewsDisplay';
// Add NewsDetail import
import NewsDetail from './components/news-portal-system/NewsDetail';
// Add import
import NewsCategoryEdit from './components/news-portal-system/NewsCategoryEdit';
import NewsEdit from './components/news-portal-system/NewsEdit';
// Add this import at the top with other EMS imports
import DepartmentDetails from './components/ems/DepartmentDetails';
// Room Booking System imports
import BuildingList from './components/room-booking-system/BuildingList';
import BuildingForm from './components/room-booking-system/BuildingForm';
import RoomBookingNavBar from './components/room-booking-system/RoomBookingNavBar';
// Add these imports
import BuildingDetails from './components/room-booking-system/BuildingDetails';
import BuildingEdit from './components/room-booking-system/BuildingEdit';

import RoomList from './components/room-booking-system/RoomList';
import RoomDetails from './components/room-booking-system/RoomDetails';
import RoomForm from './components/room-booking-system/RoomForm';
import RoomEdit from './components/room-booking-system/RoomEdit';
import RoomBookingList from './components/room-booking-system/RoomBookingList';
import RoomBookingForm from './components/room-booking-system/RoomBookingForm';
import RoomBookingDetailsRouter from './components/room-booking-system/RoomBookingDetailsRouter';
import RoomBookingEdit from './components/room-booking-system/RoomBookingEdit';
import RoomBookingCalendar from './components/room-booking-system/RoomBookingCalendar';

// ... existing code ...
import ReportFormNavBar from './components/report-management-system/ReportFormNavBar';
import ReportFormList from './components/report-management-system/ReportFormList';
import ReportFormDetails from './components/report-management-system/ReportFormDetails';
import ReportFormForm from './components/report-management-system/ReportFormForm/ReportFormForm';
import ReportFormEdit from './components/report-management-system/ReportFormEdit';

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
                {/* SubDepartment Routes */}
                <Route path="/employee-management/sub-departments" element={
                  <HRProtectedRoute>
                    <SubDepartmentList />
                  </HRProtectedRoute>
                } />
                <Route path="/employee-management/sub-departments/new" element={
                  <HRProtectedRoute>
                    <SubDepartmentForm />
                  </HRProtectedRoute>
                } />
                <Route path="/employee-management/sub-departments/:id" element={
                  <HRProtectedRoute>
                    <SubDepartmentDetails />
                  </HRProtectedRoute>
                } />
                <Route path="/employee-management/sub-departments/:id/edit" element={
                  <HRProtectedRoute>
                    <SubDepartmentEdit />
                  </HRProtectedRoute>
                } />
                
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
                  path="/employee-management/occupations/details/:id" 
                  element={
                    <ProtectedRoute>
                      <OccupationDetails />
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

                {/* OccupationLevel Routes */}
                <Route 
                  path="/employee-management/occupation-levels" 
                  element={
                    <ProtectedRoute>
                      <OccupationLevelList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee-management/occupation-levels/new" 
                  element={
                    <ProtectedRoute>
                      <OccupationLevelForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee-management/occupation-levels/details/:id" 
                  element={
                    <ProtectedRoute>
                      <OccupationLevelDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee-management/occupation-levels/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <OccupationLevelEdit />
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
                      <ApplicationEdit />
                    </ProtectedRoute>
                  }
                />
                {/* Add the missing ApplicationDetails route */}
                <Route
                  path="/employee-management/applications/details/:id"
                  element={
                    <ProtectedRoute>
                      <ApplicationDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Company Routes */}
                <Route
                  path="/employee-management/companies"
                  element={
                    <ProtectedRoute>
                      <CompanyList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/companies/new"
                  element={
                    <ProtectedRoute>
                      <CompanyForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/companies/details/:id"
                  element={
                    <ProtectedRoute>
                      <CompanyDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee-management/companies/edit/:id"
                  element={
                    <ProtectedRoute>
                      <CompanyEdit />
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
                  {/* Add this route for individual news details */}
                  <Route path="news/:id" element={<NewsDetail />} />
                  {/* Admin-only routes */}
                  <Route 
                    path="news" 
                    element={
                      <ProtectedRoute requireNewsPortalAdmin={true}>
                        <NewsList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="news/new" 
                    element={
                      <ProtectedRoute requireNewsPortalAdmin={true}>
                        <NewsForm />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="news/edit/:id" element={<NewsEdit />} />
                  <Route 
                    path="categories" 
                    element={
                      <ProtectedRoute requireNewsPortalAdmin={true}>
                        <NewsCategoryList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="categories/new" 
                    element={
                      <ProtectedRoute requireNewsPortalAdmin={true}>
                        <NewsCategoryForm />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="categories/edit/:id" 
                    element={
                      <ProtectedRoute requireNewsPortalAdmin={true}>
                        <NewsCategoryEdit />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Add other admin-only routes for comments and images */}
                </Route>
                {/* Add this route after the existing department routes */}
                <Route
                  path="/employee-management/departments/details/:id"
                  element={
                    <ProtectedRoute>
                      <DepartmentDetails />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              {/* Room Booking System Routes */}
              <Routes>
                {/* Add this route */}
                <Route
                  path="/room-booking-system/calendar"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1 }}>
                        <RoomBookingCalendar />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                // For the buildings route
                <Route
                  path="/room-booking-system/buildings"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <HRProtectedRoute>
                          <BuildingList />
                        </HRProtectedRoute>
                      </Box>
                    </ProtectedRoute>
                  }
                />
                
                // Similar changes for other building-related routes and room routes
                <Route
                  path="/room-booking-system/buildings/new"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <BuildingForm />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                {/* Add these new routes */}
                <Route
                  path="/room-booking-system/buildings/details/:id"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <BuildingDetails />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/buildings/edit/:id"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <BuildingEdit />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                {/* Room Routes */}
                <Route
                  path="/room-booking-system/rooms"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomList />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/rooms/new"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomForm />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/rooms/details/:id"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomDetails />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/rooms/edit/:id"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomEdit />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                
                {/* Room Booking Routes */}
                <Route
                  path="/room-booking-system/bookings"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomBookingList />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/bookings/new"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomBookingForm />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/bookings/details/:id"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomBookingDetailsRouter />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room-booking-system/bookings/edit/:id"
                  element={
                    <ProtectedRoute>
                      <RoomBookingNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <RoomBookingEdit />
                      </Box>
                    </ProtectedRoute>
                  }
                />

                
                {/* Report Management System Routes */}
                <Route
                  path="/report-management-system"
                  element={
                    <ProtectedRoute>
                      <ReportFormNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ReportFormList />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-management-system/report-forms"
                  element={
                    <ProtectedRoute>
                      <ReportFormNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ReportFormList />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-management-system/report-forms/new"
                  element={
                    <ProtectedRoute>
                      <ReportFormNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ReportFormForm />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-management-system/report-forms/details/:id"
                  element={
                    <ProtectedRoute>
                      <ReportFormNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ReportFormDetails />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-management-system/report-forms/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ReportFormNavBar />
                      <Box sx={{ flexGrow: 1, p: 3 }}>
                        <ReportFormEdit />
                      </Box>
                    </ProtectedRoute>
                  }
                />
                
              </Routes>
            </Box>
          </Router>
        </LocalizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

