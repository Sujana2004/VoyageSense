import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  MapPinIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { getUser, clearAuth, isAdmin } from '../utils/auth';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Theme Toggle Component
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    setIsDark(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const userIsAdmin = isAdmin();

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully!');
    navigate('/login');
    // Force a hard navigation to login page
    // window.location.href = '/login';
    //use React Router instead:
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 100);
  };

  // Separate navigation for admin vs user
  const getNavItems = () => {
    if (userIsAdmin) {
      // Admin-only navigation
      return [
        { path: '/admin/dashboard', icon: HomeIcon, label: 'Dashboard' },
        { path: '/admin/users', icon: UsersIcon, label: 'Users' },
        { path: '/admin/trips', icon: ClipboardDocumentListIcon, label: 'Trips' },
        { path: '/admin/chats', icon: ChatBubbleLeftRightIcon, label: 'Chats' },
        { path: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
      ];
    } else {
      // User-only navigation  
      return [
        { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
        { path: '/trips', icon: MapPinIcon, label: 'My Trips' },
        { path: '/create-trip', icon: PlusCircleIcon, label: 'Create Trip' },
        { path: '/places', icon: MapPinIcon, label: 'Places' },
        { path: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Chat' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-blue-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={userIsAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-3xl"
            >
              ✈️
            </motion.div>
            <span className="text-2xl font-bold gradient-text">
              TravelPlanner
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Menu & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {/* <ThemeToggle /> */}
            
            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
              <p className={`text-xs ${
                userIsAdmin ? 'text-purple-600 font-bold' : 'text-gray-500'
              }`}>
                {userIsAdmin ? '👑 ADMIN' : user?.role}
              </p>
            </div>
            
            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;