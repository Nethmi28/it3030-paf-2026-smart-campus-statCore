import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import Resources from './pages/dashboard/Resources';
import Bookings from './pages/dashboard/Bookings';
import Tickets from './pages/dashboard/Tickets';
import Notifications from './pages/dashboard/Notifications';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Dashboard Routes nested within DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="resources" element={<Resources />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
