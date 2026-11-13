import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/routing/ProtectedRoute';

// 12 Application Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import ExploreMap from './pages/ExploreMap';
import Notifications from './pages/Notifications';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';
import AdminManageIssues from './pages/AdminManageIssues';
import AdminManageUsers from './pages/AdminManageUsers';
import StaffDashboard from './pages/StaffDashboard';

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                    {/* Public / Semi-public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/explore" element={<ExploreMap />} />
                    <Route path="/issues/:id" element={<IssueDetail />} />

                    {/* Citizen Routes */}
                    <Route
                      path="/citizen"
                      element={
                        <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                          <CitizenDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/report"
                      element={
                        <ProtectedRoute>
                          <ReportIssue />
                        </ProtectedRoute>
                      }
                    />

                    {/* Shared Authenticated Routes */}
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfileSettings />
                        </ProtectedRoute>
                      }
                    />

                    {/* Staff Routes */}
                    <Route
                      path="/staff"
                      element={
                        <ProtectedRoute allowedRoles={['staff', 'admin']}>
                          <StaffDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/issues"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminManageIssues />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminManageUsers />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <Footer />
                <ToastContainer />
              </div>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
