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
import { Box } from '@mui/material';
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

import ReportFormNavBar from './components/report-management-system/ReportFormNavBar';
import ReportFormList from './components/report-management-system/ReportFormList';
import ReportFormForm from './components/report-management-system/ReportFormForm/ReportFormForm';
import RTUPMReportFormDetails from './components/report-management-system/ReportFormDetails/RTUPMReportFormDetails';
import CMReportFormDetails from './components/report-management-system/ReportFormDetails/CMReportFormDetails';
import ServerPMReportFormDetails from './components/report-management-system/ReportFormDetails/ServerPMReportFormDetails/ServerPMReportFormDetails';
// Add RTU PM Edit imports
import RTUPMReportFormEdit from './components/report-management-system/ReportFormEdit/RTUPMReportFormEdit';
import RTUPMReviewReportFormEdit from './components/report-management-system/ReportFormEdit/RTUPMReviewReportFormEdit';
// Add CM Edit imports
import CMReportFormEdit from './components/report-management-system/ReportFormEdit/CMReportFormEdit';
import CMReviewReportFormEdit from './components/report-management-system/ReportFormEdit/CMReviewReportFormEdit';
// Add Server PM Edit imports
import ServerPMReportForm_Edit from './components/report-management-system/ReportFormEdit/Server_PMReportForm_Edit/ServerPMReportForm_Edit';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/signin" replace />} />

              {/* Protected Routes */}
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
                path="/employee-management-system"
                element={
                  <ProtectedRoute>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Department Routes */}
              <Route
                path="/employee-management-system/departments"
                element={
                  <HRProtectedRoute>
                    <DepartmentList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/departments/new"
                element={
                  <HRProtectedRoute>
                    <DepartmentForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/departments/edit/:id"
                element={
                  <HRProtectedRoute>
                    <DepartmentEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/departments/details/:id"
                element={
                  <HRProtectedRoute>
                    <DepartmentDetails />
                  </HRProtectedRoute>
                }
              />

              {/* SubDepartment Routes */}
              <Route
                path="/employee-management-system/subdepartments"
                element={
                  <HRProtectedRoute>
                    <SubDepartmentList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/subdepartments/new"
                element={
                  <HRProtectedRoute>
                    <SubDepartmentForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/subdepartments/edit/:id"
                element={
                  <HRProtectedRoute>
                    <SubDepartmentEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/subdepartments/details/:id"
                element={
                  <HRProtectedRoute>
                    <SubDepartmentDetails />
                  </HRProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee-management-system/employees"
                element={
                  <HRProtectedRoute>
                    <EmployeeList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/employees/new"
                element={
                  <HRProtectedRoute>
                    <EmployeeForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/employees/edit/:id"
                element={
                  <HRProtectedRoute>
                    <EmployeeEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/employees/details/:id"
                element={
                  <HRProtectedRoute>
                    <EmployeeDetails />
                  </HRProtectedRoute>
                }
              />

              {/* Occupation Routes */}
              <Route
                path="/employee-management-system/occupations"
                element={
                  <HRProtectedRoute>
                    <OccupationList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/occupations/new"
                element={
                  <HRProtectedRoute>
                    <OccupationForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/occupations/edit/:id"
                element={
                  <HRProtectedRoute>
                    <OccupationEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/occupations/details/:id"
                element={
                  <HRProtectedRoute>
                    <OccupationDetails />
                  </HRProtectedRoute>
                }
              />

              {/* OccupationLevel Routes */}
              <Route
                path="/employee-management-system/occupation-levels"
                element={
                  <HRProtectedRoute>
                    <OccupationLevelList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/occupation-levels/new"
                element={
                  <HRProtectedRoute>
                    <OccupationLevelForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/occupation-levels/edit/:id"
                element={
                  <HRProtectedRoute>
                    <OccupationLevelEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/occupation-levels/details/:id"
                element={
                  <HRProtectedRoute>
                    <OccupationLevelDetails />
                  </HRProtectedRoute>
                }
              />

              {/* Application Routes */}
              <Route
                path="/employee-management-system/applications"
                element={
                  <HRProtectedRoute>
                    <ApplicationList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/applications/new"
                element={
                  <HRProtectedRoute>
                    <ApplicationForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/applications/edit/:id"
                element={
                  <HRProtectedRoute>
                    <ApplicationEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/applications/details/:id"
                element={
                  <HRProtectedRoute>
                    <ApplicationDetails />
                  </HRProtectedRoute>
                }
              />

              {/* Company Routes */}
              <Route
                path="/employee-management-system/companies"
                element={
                  <HRProtectedRoute>
                    <CompanyList />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/companies/new"
                element={
                  <HRProtectedRoute>
                    <CompanyForm />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/companies/edit/:id"
                element={
                  <HRProtectedRoute>
                    <CompanyEdit />
                  </HRProtectedRoute>
                }
              />
              <Route
                path="/employee-management-system/companies/details/:id"
                element={
                  <HRProtectedRoute>
                    <CompanyDetails />
                  </HRProtectedRoute>
                }
              />

              {/* News Portal System Routes */}
              <Route
                path="/news-portal-system"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/news"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsList />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/news/new"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsForm />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/news/edit/:id"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsEdit />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/news/details/:id"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsDetail />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/categories"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsCategoryList />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/categories/new"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsCategoryForm />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/categories/edit/:id"
                element={
                  <ProtectedRoute>
                    <NewsPortalLayout>
                      <NewsCategoryEdit />
                    </NewsPortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/news-portal-system/display"
                element={
                  <ProtectedRoute>
                    <NewsDisplay />
                  </ProtectedRoute>
                }
              />

              {/* Room Booking System Routes */}
              <Route
                path="/room-booking-system"
                element={
                  <ProtectedRoute>
                    <RoomBookingNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <BuildingList />
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/room-booking-system/buildings"
                element={
                  <ProtectedRoute>
                    <RoomBookingNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <BuildingList />
                    </Box>
                  </ProtectedRoute>
                }
              />
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
                path="/room-booking-system/new"
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
                path="/room-booking-system/calendar"
                element={
                  <ProtectedRoute>
                    <RoomBookingNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <RoomBookingCalendar />
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/room-booking-system/details/:id"
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
                path="/room-booking-system/edit/:id"
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
                path="/report-management-system/report-forms/rtu-pm-details/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <RTUPMReportFormDetails />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/report-management-system/report-forms/cm-details/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <CMReportFormDetails />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/report-management-system/report-forms/server-pm-details/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <ServerPMReportFormDetails />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              {/* RTU PM Edit Route */}
              <Route
                path="/report-management-system/rtu-pm-edit/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <RTUPMReportFormEdit />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              {/* RTU PM Review Edit Route */}
              <Route
                path="/report-management-system/rtu-pm-report-review-edit/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <RTUPMReviewReportFormEdit />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              {/* CM Edit Route */}
              <Route
                path="/report-management-system/cm-edit/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <CMReportFormEdit />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              {/* CM Review Edit Route */}
              <Route
                path="/report-management-system/cm-report-review-edit/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <CMReviewReportFormEdit />
                    </Box>
                  </ProtectedRoute>
                }
              />
              
              {/* Server PM Edit Route */}
              <Route
                path="/report-management-system/server-pm-edit/:id"
                element={
                  <ProtectedRoute>
                    <ReportFormNavBar />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                      <ServerPMReportForm_Edit />
                    </Box>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

