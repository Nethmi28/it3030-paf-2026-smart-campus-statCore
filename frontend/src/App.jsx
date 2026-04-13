import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import Unauthorized from './pages/auth/Unauthorized';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import Resources from './pages/dashboard/Resources';
import Bookings from './pages/dashboard/Bookings';
import Tickets from './pages/dashboard/Tickets';
import Notifications from './pages/dashboard/Notifications';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import ManagerDashboard from './pages/dashboard/manager/ManagerDashboard';
import TechnicianDashboard from './pages/dashboard/technician/TechnicianDashboard';
import StudentDashboard from './pages/dashboard/student/StudentDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Dashboard Routes nested and protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="resources" element={<Resources />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="tickets" element={<Tickets />} />
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
  );
}

export default App;
