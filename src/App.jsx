import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Accessibility, MessageSquareWarning, Activity, FileText, BarChart3, ShieldCheck } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AdminLayout from './components/AdminLayout';

// Pages
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import Dashboard from './pages/Dashboard';
import LocationManagement from './pages/LocationManagement';
import AccessibilityModeration from './pages/AccessibilityModeration';
import ReviewModeration from './pages/ReviewModeration';
import Contributions from './pages/Contributions';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import AuditedPlaces from './pages/AuditedPlaces';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import AdminRoles from './pages/AdminRoles';
import Gamification from './pages/Gamification';
import DataExport from './pages/DataExport';
import SupportTickets from './pages/SupportTickets';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/locations" element={<LocationManagement />} />
                <Route path="/accessibility" element={<AccessibilityModeration />} />
                <Route path="/reviews" element={<ReviewModeration />} />
                <Route path="/contributions" element={<Contributions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/audit" element={<AuditLogs />} />
                <Route path="/audited-places" element={<AuditedPlaces />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/admin-roles" element={<AdminRoles />} />
                <Route path="/gamification" element={<Gamification />} />
                <Route path="/export" element={<DataExport />} />
                <Route path="/support" element={<SupportTickets />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
