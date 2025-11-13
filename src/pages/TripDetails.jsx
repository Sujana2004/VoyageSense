import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  CurrencyRupeeIcon,
  UsersIcon,
  CloudIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { tripAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TripChat from '../components/TripChat';
import toast from 'react-hot-toast';

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const response = await tripAPI.getById(id);
      setTrip(response.data);
    } catch (error) {
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip not found</h2>
          <Link to="/trips" className="btn-primary">
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to="/trips">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Trips
          </motion.button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                {trip.sourceCity} → {trip.destinationCity}
              </h1>
              <p className="text-gray-600">
                Created on {new Date(trip.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              trip.comfortLevel === 'LUXURY' 
                ? 'bg-purple-100 text-purple-600'
                : trip.comfortLevel === 'COMFORT'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            }`}>
              {trip.comfortLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Passengers</p>
                <p className="font-semibold">{trip.passengers}</p>
              </div>
            </div>

            <div className="flex items-center">
              <CurrencyRupeeIcon className="w-5 h-5 mr-2 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="font-semibold">₹{trip.budget.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-semibold">{trip.distanceEstimate?.toFixed(0)} km</p>
              </div>
            </div>

            <div className="flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Mode</p>
                <p className="font-semibold capitalize">{trip.recommendedMode}</p>
              </div>
            </div>
          </div>
          
          {/* Chat Button in View Trip Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <motion.button
              onClick={() => setIsChatOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <span className="text-lg">Chat with AI Trip Assistant</span>
            </motion.button>
            <p className="text-center text-sm text-gray-600 mt-2">
              Get personalized itinerary, budget tips, and travel recommendations
            </p>
          </div>

        </motion.div>



        {/* Weather Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
          >
            <div className="flex items-center mb-3">
              <CloudIcon className="w-6 h-6 mr-2" />
              <h3 className="text-xl font-bold">Source Weather</h3>
            </div>
            <p className="text-lg">{trip.sourceWeather}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          >
            <div className="flex items-center mb-3">
              <CloudIcon className="w-6 h-6 mr-2" />
              <h3 className="text-xl font-bold">Destination Weather</h3>
            </div>
            <p className="text-lg">{trip.destinationWeather}</p>
          </motion.div>
        </div>

        {/* Recommended Places */}
        {trip.recommendedPlaces && trip.recommendedPlaces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPinIcon className="w-8 h-8 mr-2 text-blue-600" />
              Recommended Places
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trip.recommendedPlaces.map((place) => (
                <div key={place.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {place.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {place.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {place.category}
                    </span>
                    <span className="font-semibold text-gray-700">
                      ⭐ {place.rating}/5
                    </span>
                  </div>
                  {place.entryFee > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Entry: ₹{place.entryFee.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat History Link */}
        {trip.hasChatHistory && trip.conversationId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    AI Conversation Available
                  </h3>
                  <p className="text-gray-600">
                    View the AI planning conversation for this trip
                  </p>
                </div>
              </div>
              <Link to={`/chat?conversationId=${trip.conversationId}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  View Chat
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
      {/* TRIP CHAT MODAL */}
      {trip && (
        <TripChat
          trip={trip}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default TripDetails;