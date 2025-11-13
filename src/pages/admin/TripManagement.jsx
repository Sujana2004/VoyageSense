import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [comfortFilter, setComfortFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [tripsPerPage] = useState(10);
  const [userTripsView, setUserTripsView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchTerm, comfortFilter]);

  // Add data validation function
  const validateTripData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from server');
    }
    return data;
  };

  // Use it in fetchTrips
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTrips();
      const validatedData = validateTripData(response.data);
      setTrips(validatedData);
    } catch (error) {
      console.error('Error fetching trips:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('Trips endpoint not found');
      } else {
        toast.error('Failed to load trips');
      }
    } finally {
      setLoading(false);
    }
  };

  const viewUserTrips = async (username) => {
    try {
      // This would need a user ID, not username - you might need to adjust your API
      const response = await adminAPI.getUserTrips(username);
      setSelectedUser({ username, trips: response.data });
      setUserTripsView(true);
    } catch (error) {
      toast.error('Failed to load user trips');
    }
  };


  const filterTrips = () => {
    let filtered = trips;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip.sourceCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destinationCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.recommendedMode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Comfort level filter
    if (comfortFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.comfortLevel === comfortFilter);
    }

    setFilteredTrips(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  const handleDeleteTrip = (trip) => {
    setSelectedTrip(trip);
    setShowDeleteModal(true);
  };

  const confirmDeleteTrip = async () => {
    try {
      await adminAPI.deleteTrip(selectedTrip.id); // You'll need to add this to your API
      setTrips(trips.filter(trip => trip.id !== selectedTrip.id));
      toast.success(`Trip from ${selectedTrip.sourceCity} to ${selectedTrip.destinationCity} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedTrip(null);
    } catch (error) {
      toast.error('Failed to delete trip');
      setShowDeleteModal(false);
    }
  };

  const getComfortColor = (comfortLevel) => {
    switch (comfortLevel) {
      case 'LUXURY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMFORT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ECONOMY':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTransportColor = (mode) => {
    if (!mode) return 'bg-gray-100 text-gray-800';
    
    if (mode.toLowerCase().includes('flight') || mode.toLowerCase().includes('air')) {
      return 'bg-red-100 text-red-800';
    } else if (mode.toLowerCase().includes('train')) {
      return 'bg-blue-100 text-blue-800';
    } else if (mode.toLowerCase().includes('bus')) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center">
                <MapPinIcon className="w-10 h-10 mr-3 text-green-600" />
                Trip Management
              </h1>
              <p className="text-gray-600">
                Manage all user trips and travel plans
              </p>
            </div>
            <button
              onClick={fetchTrips}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <MapPinIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Trips</h3>
            <p className="text-3xl font-bold">{trips.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <UserIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Active Users</h3>
            <p className="text-3xl font-bold">
              {new Set(trips.map(trip => trip.username)).size}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CurrencyDollarIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Avg Budget</h3>
            <p className="text-3xl font-bold">
              ₹{trips.length > 0 ? Math.round(trips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / trips.length) : 0}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <ClockIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Today's Trips</h3>
            <p className="text-3xl font-bold">
              {trips.filter(trip => {
                const today = new Date();
                const tripDate = new Date(trip.createdAt);
                return tripDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:flex-none">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trips, cities, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-80"
                />
              </div>

              {/* Comfort Level Filter */}
              <div className="relative">
                <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={comfortFilter}
                  onChange={(e) => setComfortFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="ALL">All Comfort Levels</option>
                  <option value="ECONOMY">Economy</option>
                  <option value="COMFORT">Comfort</option>
                  <option value="LUXURY">Luxury</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {currentTrips.length} of {filteredTrips.length} trips
            </div>
          </div>
        </div>

        {/* Trips Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Trip Route</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Comfort</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Transport</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Created</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTrips.map((trip, index) => (
                  <motion.tr
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          <span className="text-blue-600">{trip.sourceCity}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-green-600">{trip.destinationCity}</span>
                        </div>
                        {trip.distanceEstimate && (
                          <div className="text-sm text-gray-600">
                            {trip.distanceEstimate} km
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{trip.username || 'Unknown'}</span>
                      </div>
                      {trip.passengers && (
                        <div className="text-sm text-gray-600">
                          {trip.passengers} passenger{trip.passengers > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getComfortColor(trip.comfortLevel)} border`}>
                        {trip.comfortLevel || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {trip.recommendedMode ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTransportColor(trip.recommendedMode)}`}>
                          {trip.recommendedMode}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-900">₹{trip.budget || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {trip.createdAt ? formatDate(trip.createdAt) : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTrip(trip)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Trip"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {currentTrips.length === 0 && (
              <div className="text-center py-12">
                <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">
                  {searchTerm || comfortFilter !== 'ALL' ? 'No matching trips found' : 'No trips found'}
                </h3>
                <p className="text-gray-400">
                  {searchTerm || comfortFilter !== 'ALL' 
                    ? 'Try adjusting your search or filters' 
                    : 'No trips have been created yet'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === page
                      ? 'bg-green-500 text-white border-green-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Trip Details Modal */}
        {showTripModal && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Trip Details</h3>
                  <button
                    onClick={() => setShowTripModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Route Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="text-sm text-gray-600 mb-1">From</div>
                        <div className="text-xl font-bold text-blue-600">{selectedTrip.sourceCity}</div>
                      </div>
                      <div className="mx-4">
                        <div className="w-12 h-12 bg-white rounded-full border-4 border-green-200 flex items-center justify-center">
                          <MapPinIcon className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-sm text-gray-600 mb-1">To</div>
                        <div className="text-xl font-bold text-green-600">{selectedTrip.destinationCity}</div>
                      </div>
                    </div>
                    {selectedTrip.distanceEstimate && (
                      <div className="text-center mt-3">
                        <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                          <span>Distance: {selectedTrip.distanceEstimate} km</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trip Information Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-700">User</span>
                      </div>
                      <div className="text-lg text-gray-900">{selectedTrip.username || 'Unknown'}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-700">Passengers</span>
                      </div>
                      <div className="text-lg text-gray-900">{selectedTrip.passengers || 1}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-gray-700">Budget</span>
                      </div>
                      <div className="text-lg text-gray-900">₹{selectedTrip.budget || 0}</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-5 h-5 rounded-full ${getComfortColor(selectedTrip.comfortLevel).split(' ')[0]}`} />
                        <span className="font-semibold text-gray-700">Comfort</span>
                      </div>
                      <div className="text-lg text-gray-900">{selectedTrip.comfortLevel || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTrip.recommendedMode && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="font-semibold text-gray-700 mb-2">Recommended Transport</div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getTransportColor(selectedTrip.recommendedMode)}`}>
                          {selectedTrip.recommendedMode}
                        </span>
                      </div>
                    )}

                    {selectedTrip.confidenceScore && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="font-semibold text-gray-700 mb-2">Confidence Score</div>
                        <div className="text-lg text-gray-900">
                          {(selectedTrip.confidenceScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weather Information */}
                  {(selectedTrip.sourceWeather || selectedTrip.destinationWeather) && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Weather Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTrip.sourceWeather && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="font-medium text-blue-800 mb-1">Source Weather</div>
                            <div className="text-sm text-blue-700">{selectedTrip.sourceWeather}</div>
                          </div>
                        )}
                        {selectedTrip.destinationWeather && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="font-medium text-green-800 mb-1">Destination Weather</div>
                            <div className="text-sm text-green-700">{selectedTrip.destinationWeather}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Created: {selectedTrip.createdAt ? formatDate(selectedTrip.createdAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowTripModal(false)}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full"
            >
              <div className="p-6">
                <div className="text-center">
                  <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trip</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete the trip from <strong>{selectedTrip.sourceCity}</strong> to <strong>{selectedTrip.destinationCity}</strong>? This action cannot be undone.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteTrip}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripManagement;