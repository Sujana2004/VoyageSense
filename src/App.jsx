import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated } from './utils/auth';
import ThemeWrapper from './components/ThemeWrapper';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import Chat from './pages/Chat';
import Places from './pages/Places';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TripManagement from './pages/admin/TripManagement';
import ChatManagement from './pages/admin/ChatManagement';
import Analytics from './pages/admin/Analytics';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <ThemeWrapper>
        {isAuthenticated() && <Navbar />}
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Register />} 
          />
          
          {/* User-Only Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-trip"
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/places"
            element={
              <ProtectedRoute>
                <Places />
              </ProtectedRoute>
            }
          />
          
          {/* Admin-Only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <TripManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chats"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <ChatManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect old /admin route to new admin dashboard
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /> */}
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeWrapper>
    </BrowserRouter>
  );
}

export default App;