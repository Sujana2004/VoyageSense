import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { placesAPI } from '../services/api';
import { travelAPIs } from '../services/freeApis';
import LoadingSpinner from '../components/LoadingSpinner';
import InteractiveMap from '../components/InteractiveMap';
import toast from 'react-hot-toast';

// This combination of Local Storage and Cookies helps persist trip data with expiry
const TRIP_STORAGE = {
  save: (data) => {
    const item = {
      data,
      created: new Date().getTime(),
      expiry: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };
    localStorage.setItem('userTrip', JSON.stringify(item));
  },
  
  load: () => {
    try {
      const stored = localStorage.getItem('userTrip');
      if (!stored) return null;
      
      const item = JSON.parse(stored);
      const now = new Date().getTime();
      
      // Check if data has expired
      if (now - item.created > item.expiry) {
        localStorage.removeItem('userTrip'); // Auto-cleanup
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Error loading trip data:', error);
      return null;
    }
  },
  
  clear: () => {
    localStorage.removeItem('userTrip');
  },
  
  // Optional: Get time remaining
  getTimeRemaining: () => {
    try {
      const stored = localStorage.getItem('userTrip');
      if (!stored) return 0;
      
      const item = JSON.parse(stored);
      const now = new Date().getTime();
      const remaining = item.expiry - (now - item.created);
      
      return Math.max(0, remaining); // Return 0 if expired
    } catch {
      return 0;
    }
  }
};

const clearTrip = () => {
  if (window.confirm('Clear your entire trip? This cannot be undone.')) {
    TRIP_STORAGE.clear();
    setSavedTrips([]);
    toast.success('Trip cleared!');
  }
};

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState(null); //Recently added
  const [showModal, setShowModal] = useState(false); //Recently added
  const [savedTrips, setSavedTrips] = useState([]); //This is for Add to trip storage using local Storage
  const [showTripModal, setShowTripModal] = useState(false); //This is to view trip Storage from local Storage

  const categories = ['All', 'Beach', 'Historical', 'Religious', 'Nature', 'Shopping', 'Nightlife', 'Adventure'];

  useEffect(() => {
    fetchAllPlaces();
    loadSavedTrips();
  }, []);

  const loadSavedTrips = () => {
    const saved = TRIP_STORAGE.load() || [];
    setSavedTrips(saved);
    console.log('Loaded saved trips:', saved.length);
  };

  useEffect(() => {
    filterPlaces();
  }, [searchCity, selectedCategory, places]);

  const fetchAllPlaces = async () => {
    try {
      setLoading(true);
      
      // First, try to get places from your database
      const response = await placesAPI.getAll();
      const dbPlaces = response.data;
      
      console.log('Database places loaded:', dbPlaces.length);
      setPlaces(dbPlaces);
      setFilteredPlaces(dbPlaces);
      
    } catch (error) {
      console.error('Database failed, trying free APIs:', error);
      toast.error('Failed to load places from database');
      
      // Only use APIs if database fails
      try {
        console.log('Trying free APIs as fallback...');
        
        const popularCities = ['Delhi', 'Mumbai', 'Goa', 'Jaipur', 'Kerala', 'Agra'];
        const apiPromises = popularCities.map(city => 
          travelAPIs.searchPlaces(`${city} tourist places`)
        );
        
        const results = await Promise.all(apiPromises);
        
        const apiPlaces = results.flat().map((place, index) => ({
          id: place.place_id || index + 1,
          name: place.display_name?.split(',')[0] || `Place ${index + 1}`,
          city: place.address?.city || place.address?.state || 'Unknown City',
          country: place.address?.country || 'India',
          category: getCategoryFromPlace(place),
          description: place.type ? `A beautiful ${place.type} destination` : 'Amazing travel destination',
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          entryFee: Math.random() > 0.3 ? Math.floor(Math.random() * 2000) : 0,
          recommendedDuration: Math.floor(Math.random() * 7) + 1,
          lat: place.lat, //These are for Interactive Map
          lon: place.lon,
        }));
        
        console.log('API fallback places loaded:', apiPlaces.length);
        setPlaces(apiPlaces);
        setFilteredPlaces(apiPlaces);
        
      } catch (apiError) {
        console.error('All data sources failed:', apiError);
        toast.error('Failed to load places');
        setPlaces([]);
        setFilteredPlaces([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this new function for searching external places
  const searchExternalPlaces = async (searchQuery) => {
    if (!searchQuery.trim()) return [];
    
    try {
      console.log('Searching all external APIs for:', searchQuery);
      
      // Try all three APIs in parallel
      const [openTripResults, openStreetResults, wikipediaInfo] = await Promise.all([
        travelAPIs.searchOpenTripMap(searchQuery),
        travelAPIs.searchOpenStreetMap(searchQuery),
        travelAPIs.getWikipediaInfo(searchQuery)
      ]);
      
      console.log('API Results:', {
        openTripMap: openTripResults.length,
        openStreetMap: openStreetResults.length,
        wikipedia: !!wikipediaInfo
      });
      
      // Combine and transform results from all APIs
      const allPlaces = [];
      
      // 1. Process OpenTripMap results (highest quality)
      const openTripPlaces = await Promise.all(
        openTripResults.slice(0, 5).map(async (feature) => {
          const details = await travelAPIs.getOpenTripMapDetails(feature.properties.xid);
          return {
            id: `opentrip-${feature.properties.xid}`,
            name: feature.properties.name || 'Unknown Place',
            city: getCityFromOpenTripMap(feature),
            country: feature.properties.country || 'Unknown',
            category: getCategoryFromKinds(feature.properties.kinds),
            description: details?.wikipedia_extracts?.text || 
                      feature.properties.kinds?.split(',').slice(0, 3).join(', ') || 
                      'Popular tourist destination',
            rating: calculateRating(feature.properties.rate),
            entryFee: 0,
            recommendedDuration: 2,
            lat: feature.geometry?.coordinates[1] || feature.properties.point?.lat,
            lon: feature.geometry?.coordinates[0] || feature.properties.point?.lon,
            isExternal: true,
            source: 'OpenTripMap'
          };
        })
      );
      allPlaces.push(...openTripPlaces);
      
      // 2. Process OpenStreetMap results (fallback)
      const openStreetPlaces = openStreetResults.slice(0, 5).map((place, index) => ({
        id: `openstreet-${place.place_id || index}`,
        name: place.display_name?.split(',')[0] || `Place ${index + 1}`,
        city: place.address?.city || place.address?.state || 'Unknown City',
        country: place.address?.country || 'Unknown',
        category: getCategoryFromOSM(place),
        description: place.type ? `A ${place.type} located in ${place.display_name?.split(',').slice(1, 3).join(', ')}` : 'Interesting location',
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        entryFee: 0,
        recommendedDuration: 2,
        lat: parseFloat(place.lat), 
        lon: parseFloat(place.lon),
        isExternal: true,
        source: 'OpenStreetMap'
      }));
      allPlaces.push(...openStreetPlaces);
      
      // 3. Add Wikipedia description if available (enhance existing places)
      if (wikipediaInfo && wikipediaInfo.extract) {
        // Try to find a matching place to enhance with Wikipedia description
        const matchingPlace = allPlaces.find(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery.toLowerCase().includes(p.name.toLowerCase())
        );
        
        if (matchingPlace) {
          matchingPlace.description = wikipediaInfo.extract;
          matchingPlace.wikipedia = true;
        } else {
          // Or create a new place from Wikipedia data
          allPlaces.push({
            id: `wikipedia-${Date.now()}`,
            name: wikipediaInfo.title || searchQuery,
            city: 'Various',
            country: 'Unknown',
            category: 'Historical',
            description: wikipediaInfo.extract,
            rating: 4.0,
            entryFee: 0,
            recommendedDuration: 2,
            isExternal: true,
            source: 'Wikipedia'
          });
        }
      }
      
      // Remove duplicates and filter out unknown places
      const uniquePlaces = allPlaces
        .filter(place => place.name !== 'Unknown Place' && place.name !== 'Place')
        .filter((place, index, self) => 
          index === self.findIndex(p => p.name === place.name)
        );
      
      console.log('Final external places:', uniquePlaces.length);
      return uniquePlaces;
      
    } catch (error) {
      console.error('All external APIs failed:', error);
      return [];
    }
  };

  const filterPlaces = async () => {
    let filtered = [...places]; // Start with database places
    
    // Apply category filter first (only on database places)
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((place) => place.category === selectedCategory);
    }
    
    // If user is searching for something specific
    if (searchCity.trim()) {
      const searchTerm = searchCity.toLowerCase();
      
      // First, filter database places that match the search
      const dbMatches = filtered.filter((place) =>
        place.city.toLowerCase().includes(searchTerm) ||
        place.name.toLowerCase().includes(searchTerm)
      );
      
      // If we have matches in database, use them
      if (dbMatches.length > 0) {
        console.log('Found in database:', dbMatches.length);
        setFilteredPlaces(dbMatches);
      } else {
        // If no database matches, search external APIs
        console.log('No database matches, searching externally...');
        const externalPlaces = await searchExternalPlaces(searchCity);
        
        if (externalPlaces.length > 0) {
          // Show external results
          setFilteredPlaces(externalPlaces);
          toast.success(`Found ${externalPlaces.length} external places for "${searchCity}"`);
        } else {
          // No results anywhere
          setFilteredPlaces([]);
        }
      }
    } else {
      // No search term, just show filtered database places
      setFilteredPlaces(filtered);
    }
  };

  // Helper for OpenTripMap city extraction
  const getCityFromOpenTripMap = (feature) => {
    return feature.properties.city || 
          feature.properties.district || 
          feature.properties.state || 
          'Unknown City';
  };

  // Helper for OpenStreetMap categorization
  const getCategoryFromOSM = (place) => {
    const type = place.type || '';
    const name = place.display_name || '';
    
    if (type.includes('beach') || name.toLowerCase().includes('beach')) return 'Beach';
    if (type.includes('temple') || name.toLowerCase().includes('temple')) return 'Religious';
    if (type.includes('fort') || type.includes('palace') || type.includes('monument')) return 'Historical';
    if (type.includes('park') || type.includes('garden') || type.includes('nature')) return 'Nature';
    if (type.includes('mall') || type.includes('market') || type.includes('shop')) return 'Shopping';
    
    return 'Historical';
  };

  // Update your existing helper
  const getCategoryFromKinds = (kinds) => {
    if (!kinds) return 'Historical';
    
    const kindList = kinds.split(',');
    
    if (kindList.some(k => k.includes('beach') || k.includes('sea'))) return 'Beach';
    if (kindList.some(k => k.includes('temple') || k.includes('religion'))) return 'Religious';
    if (kindList.some(k => k.includes('museum') || k.includes('palace') || k.includes('fort'))) return 'Historical';
    if (kindList.some(k => k.includes('park') || k.includes('garden') || k.includes('nature'))) return 'Nature';
    if (kindList.some(k => k.includes('mall') || k.includes('market') || k.includes('shop'))) return 'Shopping';
    if (kindList.some(k => k.includes('bar') || k.includes('club') || k.includes('nightclub'))) return 'Nightlife';
    
    return 'Historical';
  };

  // Add this helper function (you're using it in fetchAllPlaces)
  const getCategoryFromPlace = (place) => {
    const type = place.type || '';
    const name = place.display_name || '';
    
    if (type.includes('beach') || name.toLowerCase().includes('beach')) return 'Beach';
    if (type.includes('temple') || type.includes('religious') || name.toLowerCase().includes('temple')) return 'Religious';
    if (type.includes('fort') || type.includes('palace') || type.includes('monument')) return 'Historical';
    if (type.includes('park') || type.includes('garden') || type.includes('nature')) return 'Nature';
    if (type.includes('mall') || type.includes('market') || type.includes('shopping')) return 'Shopping';
    
    const categories = ['Beach', 'Historical', 'Religious', 'Nature', 'Shopping', 'Adventure'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  // Also add this missing function
  const calculateRating = (rate) => {
    if (!rate) return parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
    
    // Convert OpenTripMap rate (1-3, h) to 1-5 scale
    const rateMap = { '1': 3.0, '2': 4.0, '3': 4.5, '1h': 4.2, '2h': 4.7, '3h': 5.0 };
    return rateMap[rate] || parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
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
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold gradient-text mb-2 flex items-center">
                <MapPinIcon className="w-12 h-12 mr-3 text-blue-600" />
                Explore Places
              </h1>
              <p className="text-gray-600 text-lg">
                Discover {places.length} amazing destinations
              </p>
            </div>

            {/* View Trip Button */}
            {savedTrips.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTripModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  savedTrips.length > 0 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-not-allowed'
                }`}
                title={savedTrips.length > 0 ? "View your trip" : "No places in trip yet"}
                disabled={savedTrips.length === 0}
              >
                <span>📋</span>
                <span>Trip ({savedTrips.length})</span>
              </motion.button>
            )}
            
            {/* ADD REFRESH BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAllPlaces}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Refresh places data"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Refresh Data</span>
            </motion.button>

          </div>
        </motion.div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MagnifyingGlassIcon className="inline w-5 h-5 mr-1" />
                Search by City or Name
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g., Goa, Mumbai, Baga Beach..."
                className="input-field"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FunnelIcon className="inline w-5 h-5 mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Showing {filteredPlaces.length} of {places.length} places
          </p>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card group cursor-pointer transform hover:scale-105 transition-transform duration-200" // 👈 Added hover effect
                onClick={() => { // 👈 ADD THIS CLICK HANDLER
                  setSelectedPlace(place);
                  setShowModal(true);
                }}
              >
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">📍</span>
                </div>

                {/* Content */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {place.city}, {place.country}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                      {place.category}
                    </span>
                    {place.isExternal && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                        🌐 {place.source}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {place?.description ?? 'No description available'}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="font-bold text-yellow-600">
                      🌟 {(place?.rating ?? 0)}/5

                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Entry Fee</p>
                    <p className="font-bold text-green-600">
                      {(() => {
                        const entryFee = place?.entryFee;
                        if (entryFee === null || entryFee === undefined || entryFee === 0) {
                          return 'Free';
                        }
                        return `₹${entryFee.toLocaleString('en-IN')}`;
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-bold text-purple-600">
                      {(place?.recommendedDuration ?? 0)}h
                    </p>
                  </div>
                </div> 



              </motion.div>
            ))}
          </div>

        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-9xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              No places found
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Try adjusting your search or filters
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchCity('');
                setSelectedCategory('All');
              }}
              className="btn-primary"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>
      
      {/* THIS IS MODAL COMPONENT for expanding tab in Places url */}
      {showModal && selectedPlace && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              {/* Placeholder Image */}
              <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-t-2xl flex items-center justify-center">
                <span className="text-9xl">📍</span>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <span className="text-2xl">×</span>
              </button>
              
              {/* Place Badges */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                  {selectedPlace.category}
                </span>
                {selectedPlace.isExternal && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                    🌐 {selectedPlace.source || 'External'}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Title Section */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedPlace.name}
                </h2>
                <p className="text-lg text-gray-600 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  {selectedPlace.city}, {selectedPlace.country}
                </p>
              </div>

              {/* Description Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedPlace.description || 'No detailed description available.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    🌟 {selectedPlace.rating}/5
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Entry Fee</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedPlace.entryFee === 0 ? 'Free' : `₹${selectedPlace.entryFee?.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedPlace.recommendedDuration}h
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Best Time</p>
                  <p className="text-lg font-bold text-orange-600">
                    {selectedPlace.bestTime || 'All Year'}
                  </p>
                </div>
              </div>

              {/* Map Section */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Location
                </h3>
                <InteractiveMap place={selectedPlace} height="300px" />
                {selectedPlace.lat && selectedPlace.lon && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Click and drag to explore the area around {selectedPlace.name}
                  </p>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Travel Tips</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Plan to spend {selectedPlace.recommendedDuration} hours here</li>
                  <li>• {selectedPlace.entryFee === 0 ? 'Free entry' : `Entry fee: ₹${selectedPlace.entryFee}`}</li>
                  <li>• Rated {selectedPlace.rating} stars by visitors</li>
                  {selectedPlace.isExternal && (
                    <li>• Information sourced from {selectedPlace.source}</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-between items-center">
              {/* Saved trips count */}
              <div className="text-sm text-gray-600">
                {savedTrips.length > 0 ? (
                  <span>📋 {savedTrips.length} places in your trip</span>
                ) : (
                  <span>✨ Start building your trip</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Add to trip with expiry
                    const currentTrip = TRIP_STORAGE.load() || [];
                    
                    // Check if place already exists
                    const alreadyExists = currentTrip.some(tripPlace => 
                      tripPlace.id === selectedPlace.id
                    );
                    
                    if (alreadyExists) {
                      toast.success(`✅ ${selectedPlace.name} is already in your trip!`);
                    } else {
                      currentTrip.push({
                        ...selectedPlace,
                        addedAt: new Date().toISOString()
                      });
                      TRIP_STORAGE.save(currentTrip);
                      setSavedTrips(currentTrip);
                      toast.success(`✅ Added ${selectedPlace.name} to your trip! (Saved for 7 days)`);
                    }
                    
                    setShowModal(false);
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <span>✈️</span>
                  <span>Add to Trip</span>
                </button>
                <button
                  onClick={clearTrip}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  disabled={savedTrips.length === 0}
                >
                  Clear Trip
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Trip Viewer Modal */}
      {showTripModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTripModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="text-4xl mr-3">✈️</span>
                    My Travel Plan
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {savedTrips.length} {savedTrips.length === 1 ? 'place' : 'places'} in your trip
                    <span className="text-sm text-blue-600 ml-2">
                      (Auto-saves for 7 days)
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowTripModal(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{savedTrips.length}</p>
                  <p className="text-sm text-gray-600">Places</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {savedTrips.reduce((total, place) => total + (place.entryFee || 0), 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600">Total Cost (₹)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {savedTrips.reduce((total, place) => total + (place.recommendedDuration || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {[...new Set(savedTrips.map(place => place.city))].length}
                  </p>
                  <p className="text-sm text-gray-600">Cities</p>
                </div>
              </div>
            </div>

            {/* trip viewer modal for Interactive map */}
            {savedTrips.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🗺️</span>
                  Trip Map Overview
                </h3>
                <InteractiveMap 
                  place={{
                    name: "Your Trip",
                    city: "Multiple Locations", 
                    country: "India",
                    lat: savedTrips[0]?.lat || 28.6139,
                    lon: savedTrips[0]?.lon || 77.2090
                  }} 
                  height="250px" 
                />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Showing first location in your trip
                </p>
              </div>
            )}

            {/* Trip Places List */}
            <div className="p-6">
              {savedTrips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛫</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Your trip is empty</h3>
                  <p className="text-gray-600 mb-6">Start adding places to build your travel plan!</p>
                  <button
                    onClick={() => setShowTripModal(false)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Explore Places
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedTrips.map((place, index) => (
                    <motion.div
                      key={`${place.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
                    >
                      {/* Place Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      {/* Place Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📍</span>
                      </div>

                      {/* Place Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {place.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {place.city}, {place.country}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                            {place.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-yellow-600">🌟 {place.rating}/5</span>
                          <span className="text-green-600">
                            {place.entryFee === 0 ? 'Free' : `₹${place.entryFee?.toLocaleString('en-IN')}`}
                          </span>
                          <span className="text-purple-600">{place.recommendedDuration}h</span>
                          <span className="text-gray-500 text-xs">
                            Added {new Date(place.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPlace(place);
                            setShowTripModal(false);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => {
                            const updatedTrips = savedTrips.filter((_, i) => i !== index);
                            TRIP_STORAGE.save(updatedTrips);
                            setSavedTrips(updatedTrips);
                            toast.success(`Removed ${place.name} from trip`);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from trip"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {savedTrips.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (window.confirm('Clear your entire trip? This cannot be undone.')) {
                        TRIP_STORAGE.clear();
                        setSavedTrips([]);
                        toast.success('Trip cleared!');
                        setShowTripModal(false);
                      }
                    }}
                    className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowTripModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Export trip functionality
                        const tripSummary = savedTrips.map((place, index) => 
                          `${index + 1}. ${place.name} (${place.city}) - ${place.entryFee === 0 ? 'Free' : `₹${place.entryFee}`} - ${place.recommendedDuration}h`
                        ).join('\n');
                        
                        navigator.clipboard.writeText(tripSummary);
                        toast.success('Trip details copied to clipboard!');
                      }}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📋 Copy Trip Plan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}


    </div>

    

  );
};

export default Places;