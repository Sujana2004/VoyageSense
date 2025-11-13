import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyRupeeIcon,
  UsersIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { tripAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Trips = () => {
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-2">My Trips</h1>
            <p className="text-gray-600 text-lg">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
            </p>
          </div>
          <Link to="/create-trip">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              + New Trip
            </motion.button>
          </Link>
        </motion.div>

        {/* Trips Grid */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {trip.destinationCity}
                    </h3>
                    <p className="text-sm text-gray-500">from {trip.sourceCity}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trip.comfortLevel === 'LUXURY' 
                      ? 'bg-purple-100 text-purple-600'
                      : trip.comfortLevel === 'COMFORT'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {trip.comfortLevel}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {new Date(trip.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <UsersIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">{trip.passengers} passengers</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">₹{trip.budget.toLocaleString('en-IN')} budget</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {trip.recommendedPlaces?.length || 0} places recommended
                    </span>
                  </div>
                </div>

                {/* Weather Info */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Weather Info:</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {trip.destinationWeather?.split(',')[0] || 'Loading...'}
                  </p>
                </div>

                {/* Chat History Badge */}
                {trip.hasChatHistory && (
                  <div className="flex items-center text-green-600 text-sm mb-4">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                    <span>AI conversation available</span>
                  </div>
                )}

                {/* View Button */}
                <Link to={`/trips/${trip.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <span>View Details</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-9xl mb-6">🗺️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              No trips yet!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Start your journey by creating your first trip
            </p>
            <Link to="/create-trip">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4"
              >
                Create Your First Trip
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Trips;