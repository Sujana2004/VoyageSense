import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { tripAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceCity: '',
    destinationCity: '',
    passengers: 1,
    budget: 25000,
    comfortLevel: 'COMFORT',
    interests: [],
    tripDuration: 3,
  });

  const comfortLevels = ['ECONOMY', 'COMFORT', 'LUXURY'];
  const interestOptions = [
    'beaches', 'historical', 'nightlife', 'culture', 
    'nature', 'adventure', 'food', 'shopping', 'relaxation'
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const toggleInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter((i) => i !== interest)
        : [...formData.interests, interest],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sourceCity || !formData.destinationCity) {
      toast.error('Please enter both source and destination cities');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creating your trip... This may take 30-60 seconds ⏳');

    try {
      const response = await tripAPI.create(formData);
      toast.dismiss(loadingToast);
      toast.success('Trip created successfully! 🎉');
      navigate(`/trips/${response.data.id}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        message="Creating your amazing trip... This may take up to 60 seconds ⏳" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold gradient-text mb-2 flex items-center">
            <SparklesIcon className="w-12 h-12 mr-3 text-yellow-500" />
            Create New Trip
          </h1>
          <p className="text-gray-600 text-lg">
            Let AI help you plan the perfect journey
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          {/* Cities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPinIcon className="inline w-5 h-5 mr-1" />
                From (Source City)
              </label>
              <input
                type="text"
                name="sourceCity"
                value={formData.sourceCity}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Mumbai"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPinIcon className="inline w-5 h-5 mr-1" />
                To (Destination City)
              </label>
              <input
                type="text"
                name="destinationCity"
                value={formData.destinationCity}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Goa"
              />
            </div>
          </div>

          {/* Passengers and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <UsersIcon className="inline w-5 h-5 mr-1" />
                Number of Passengers
              </label>
              <input
                type="number"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                min="1"
                max="20"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ClockIcon className="inline w-5 h-5 mr-1" />
                Trip Duration (days)
              </label>
              <input
                type="number"
                name="tripDuration"
                value={formData.tripDuration}
                onChange={handleChange}
                min="1"
                max="30"
                required
                className="input-field"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <CurrencyDollarIcon className="inline w-5 h-5 mr-1" />
              Budget (INR): ₹{formData.budget}
            </label>
            <input
              type="range"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="5000"   
              max="250000"    
              step="1000" 
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹5,000</span>     
              <span>₹125,000</span>    
              <span>₹250,000</span>
            </div>
          </div>

          {/* Comfort Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Comfort Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {comfortLevels.map((level) => (
                <motion.button
                  key={level}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, comfortLevel: level })}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    formData.comfortLevel === level
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Interests (Select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <motion.button
                  key={interest}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary w-full py-4 text-lg"
          >
            ✨ Create Trip with AI
          </motion.button>

          {/* Info Box */}
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-gray-700">
              ⏳ <strong>Please note:</strong> Trip creation may take 30-60 seconds as AI analyzes weather, 
              generates recommendations, and creates your personalized itinerary.
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateTrip;