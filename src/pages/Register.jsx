import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  KeyIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    adminSecretCode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiCall = isAdminRegister 
        ? authAPI.registerAdmin(formData)
        : authAPI.register(formData);

      const response = await apiCall;
      const { token, user } = response.data;
      
      setAuth(token, user);
      toast.success(`Welcome, ${user.username}! Account created successfully.`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Creating your account..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🌍
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Join Us!</h1>
          <p className="text-gray-600">Create an account to start planning</p>
        </div>

        {/* Admin Toggle */}
        <div className="flex justify-center mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdminRegister(!isAdminRegister)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isAdminRegister
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isAdminRegister ? '👑 Admin Registration' : '👤 User Registration'}
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="Choose a username"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field pl-10"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field pl-10"
                placeholder="Min. 6 characters"
              />
            </div>
          </div>

          {/* Admin Secret Code */}
          {isAdminRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Secret Code
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="adminSecretCode"
                  value={formData.adminSecretCode}
                  onChange={handleChange}
                  required={isAdminRegister}
                  className="input-field pl-10"
                  placeholder="Enter admin secret code"
                />
              </div>
              <p className="text-xs text-purple-600 mt-1">
                 Code: TRAVEL2024ADMIN
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <span>Create Account</span>
            <ArrowRightIcon className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;