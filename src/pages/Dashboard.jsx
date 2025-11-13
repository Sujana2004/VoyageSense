import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';
import { motion } from 'framer-motion';
import { 
  PlusCircleIcon, 
  MapPinIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { getUser } from '../utils/auth';
import { tripAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admins to admin dashboard
    if (isAdmin()) {
      navigate('/admin/dashboard');
      return;
    }
    
    // User-specific dashboard logic
  }, [navigate]);

  const user = getUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAll();
      setTrips(response.data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create New Trip',
      description: 'Plan your next adventure',
      icon: PlusCircleIcon,
      link: '/create-trip',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Browse Places',
      description: 'Discover amazing destinations',
      icon: MapPinIcon,
      link: '/places',
      color: 'from-green-600 to-emerald-600',
    },
    {
      title: 'Chat with AI',
      description: 'Get travel recommendations',
      icon: ChatBubbleLeftRightIcon,
      link: '/chat',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold gradient-text mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to plan your next adventure?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Total Trips</h3>
            <p className="text-4xl font-bold">{trips.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Places Visited</h3>
            <p className="text-4xl font-bold">
              {trips.reduce((acc, trip) => acc + (trip.recommendedPlaces?.length || 0), 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Account Type</h3>
            <p className="text-2xl font-bold">{user?.role}</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
            <SparklesIcon className="w-8 h-8 mr-2 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="card cursor-pointer"
                  >
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600">{action.description}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Trips Preview */}
        {trips.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800">Recent Trips</h2>
              <Link to="/trips" className="text-blue-600 hover:text-blue-700 font-semibold">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="card"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {trip.sourceCity} → {trip.destinationCity}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                      {trip.comfortLevel}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>🚗 Mode: {trip.recommendedMode}</p>
                    <p>👥 Passengers: {trip.passengers}</p>
                    <p>💰 Budget: ₹{trip.budget.toLocaleString('en-IN')}</p>
                  </div>
                  <Link 
                    to={`/trips/${trip.id}`}
                    className="mt-4 block text-center btn-primary text-sm"
                  >
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-4">✈️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No trips yet!
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your first adventure today
            </p>
            <Link to="/create-trip" className="btn-primary inline-flex items-center">
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Create Your First Trip
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;