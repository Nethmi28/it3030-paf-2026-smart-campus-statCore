import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import Unauthorized from './pages/auth/Unauthorized';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import Resources from './pages/dashboard/Resources';
import ResourceDetails from './pages/dashboard/ResourceDetails';
import Bookings from './pages/dashboard/Bookings';
import TicketUserView from './pages/dashboard/TicketUserView';
import Notifications from './pages/dashboard/Notifications';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AdminRegistrationRequests from './pages/dashboard/admin/AdminRegistrationRequests';
import ManageResources from './pages/dashboard/manager/ManageResources';
import ManagerDashboard from './pages/dashboard/manager/ManagerDashboard';
import TechnicianDashboard from './pages/dashboard/technician/TechnicianDashboard';
import StudentDashboard from './pages/dashboard/student/StudentDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

import PublicLayout from './layouts/PublicLayout';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Public Resource Catalog - Accessible to everyone */}
              <Route element={<PublicLayout />}>
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
              </Route>

              {/* Dashboard Routes nested and protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardOverview />} />
                {/* Dashboard still has resources, but we can either keep them or redirect */}
                <Route path="resources" element={<Resources />} />
                <Route path="resources/:id" element={<ResourceDetails />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="tickets" element={<TicketUserView />} />
                <Route path="notifications" element={<Notifications />} />

                {/* New Role-Based placeholders mapped correctly */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/registration-requests"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminRegistrationRequests />
                  </ProtectedRoute>
                }
              />
                <Route
                  path="manager/manage-resources"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_MANAGER']}>
                      <ManageResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="manager"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_MANAGER']}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tech"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_TECHNICIAN']}>
                      <TechnicianDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
