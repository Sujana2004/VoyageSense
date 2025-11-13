import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  // Simple check - you might want to add proper loading state
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute;