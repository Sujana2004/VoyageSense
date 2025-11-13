import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  UsersIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

// Dynamic chart components
const DynamicBarChart = ({ data, labels, color = 'bg-blue-500', height = 32 }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="flex items-end space-x-1" style={{ height: `${height}px` }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={`${color} rounded-t transition-all duration-500 hover:opacity-80 flex-1`}
          style={{ 
            height: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%'
          }}
          title={`${labels[index]}: ${value}`}
        />
      ))}
    </div>
  );
};

const ProgressBar = ({ value, max, color = 'bg-blue-500' }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className={`${color} h-2 rounded-full transition-all duration-500`}
      style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
    />
  </div>
);

const Analytics = () => {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    fetchAllData();
  }, []);

  const validateData = (data, type) => {
    if (!Array.isArray(data)) {
      console.warn(`Invalid ${type} data format:`, data);
      return [];
    }
    return data;
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, tripsRes, chatsRes] = await Promise.all([
        adminAPI.getAllUsers().catch(error => {
          console.error('Error fetching users:', error);
          toast.error('Failed to load users data');
          return { data: [] };
        }),
        adminAPI.getAllTrips().catch(error => {
          console.error('Error fetching trips:', error);
          toast.error('Failed to load trips data');
          return { data: [] };
        }),
        adminAPI.getAllChats().catch(error => {
          console.error('Error fetching chats:', error);
          toast.error('Failed to load chats data');
          return { data: [] };
        }),
      ]);
      setUsers(validateData(usersRes.data, 'users'));
      setTrips(validateData(tripsRes.data, 'trips'));
      setChats(validateData(chatsRes.data, 'chats'));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    };

    const startDate = timeRanges[timeRange];
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));

    // Filter data based on time range
    const recentUsers = users.filter(user => new Date(user.createdAt) >= startDate);
    const recentTrips = trips.filter(trip => new Date(trip.createdAt) >= startDate);
    const recentChats = chats.filter(chat => new Date(chat.timestamp) >= startDate);

    // Previous period for comparison
    const previousUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate >= previousPeriodStart && userDate < startDate;
    });
    const previousTrips = trips.filter(trip => {
      const tripDate = new Date(trip.createdAt);
      return tripDate >= previousPeriodStart && tripDate < startDate;
    });
    const previousChats = chats.filter(chat => {
      const chatDate = new Date(chat.timestamp);
      return chatDate >= previousPeriodStart && chatDate < startDate;
    });

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // User analytics
    const totalUsers = users.length;
    const newUsers = recentUsers.length;
    const previousNewUsers = previousUsers.length;
    const userGrowth = calculateGrowth(newUsers, previousNewUsers);

    const activeUsers = new Set(trips.map(trip => trip.username)).size;
    const activeUsersRecent = new Set(recentTrips.map(trip => trip.username)).size;

    // Trip analytics
    const totalTrips = trips.length;
    const newTrips = recentTrips.length;
    const previousNewTrips = previousTrips.length;
    const tripGrowth = calculateGrowth(newTrips, previousNewTrips);

    const avgBudget = trips.length > 0 ? trips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / trips.length : 0;
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    const recentTotalBudget = recentTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    
    // Popular destinations (dynamic)
    const destinationCounts = trips.reduce((acc, trip) => {
      const dest = trip.destinationCity;
      if (dest) {
        acc[dest] = (acc[dest] || 0) + 1;
      }
      return acc;
    }, {});
    const popularDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Comfort level distribution (dynamic)
    const comfortDistribution = trips.reduce((acc, trip) => {
      const level = trip.comfortLevel || 'UNKNOWN';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Transport mode distribution (dynamic)
    const transportDistribution = trips.reduce((acc, trip) => {
      const mode = trip.recommendedMode || 'UNKNOWN';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});

    // Chat analytics
    const totalChats = chats.length;
    const newChats = recentChats.length;
    const previousNewChats = previousChats.length;
    const chatGrowth = calculateGrowth(newChats, previousNewChats);

    const activeConversations = new Set(chats.map(chat => chat.conversationId)).size;
    const avgMessagesPerUser = activeUsers > 0 ? (totalChats / activeUsers) : 0;

    // User activity by time of day (dynamic)
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const hourChats = chats.filter(chat => {
        const chatHour = new Date(chat.timestamp).getHours();
        return chatHour === hour;
      }).length;
      return hourChats;
    });

    // Daily activity for chart (last 7 days)
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      const dayTrips = trips.filter(trip => new Date(trip.createdAt).toDateString() === dateStr).length;
      const dayChats = chats.filter(chat => new Date(chat.timestamp).toDateString() === dateStr).length;
      const dayUsers = users.filter(user => new Date(user.createdAt).toDateString() === dateStr).length;
      return { 
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        trips: dayTrips, 
        chats: dayChats,
        users: dayUsers 
      };
    });

    // Monthly growth data (dynamic)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
      const monthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear();
      }).length;
      const monthTrips = trips.filter(trip => {
        const tripDate = new Date(trip.createdAt);
        return tripDate.getMonth() === date.getMonth() && tripDate.getFullYear() === date.getFullYear();
      }).length;
      return { month: monthStr, users: monthUsers, trips: monthTrips };
    });

    // User engagement score (dynamic calculation)
    const userEngagement = users.map(user => {
      const userTrips = trips.filter(trip => trip.username === user.username).length;
      const userChats = chats.filter(chat => chat.username === user.username).length;
      return (userTrips * 2) + (userChats * 1); // Weight trips higher
    });
    const avgEngagement = userEngagement.length > 0 ? userEngagement.reduce((a, b) => a + b) / userEngagement.length : 0;

    return {
      // Core metrics
      totalUsers,
      newUsers,
      previousNewUsers,
      userGrowth,
      activeUsers,
      activeUsersRecent,
      
      totalTrips,
      newTrips,
      previousNewTrips,
      tripGrowth,
      avgBudget,
      totalBudget,
      recentTotalBudget,
      
      totalChats,
      newChats,
      previousNewChats,
      chatGrowth,
      activeConversations,
      avgMessagesPerUser,
      avgEngagement,
      
      // Distributions
      popularDestinations,
      comfortDistribution,
      transportDistribution,
      hourlyActivity,
      
      // Time series
      dailyActivity,
      monthlyData,
      
      // Recent activity
      recentUsers: recentUsers.slice(0, 5),
      recentTrips: recentTrips.slice(0, 5),
      recentChats: recentChats.slice(0, 5)
    };
  }, [users, trips, chats, timeRange]);

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '↗';
    if (growth < 0) return '↘';
    return '→';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
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
                <ChartBarIcon className="w-10 h-10 mr-3 text-indigo-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time insights and metrics from your platform data
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={fetchAllData}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        {analytics.popularDestinations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No destination data available
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Metric */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
          >
            <UsersIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold">{analytics.totalUsers}</p>
            <div className={`flex items-center space-x-1 mt-2 ${analytics.userGrowth >= 0 ? 'text-blue-100' : 'text-red-100'}`}>
              <span>{analytics.userGrowth >= 0 ? '↗' : '↘'}</span>
              <span className="text-sm">
                {analytics.newUsers} new ({analytics.userGrowth > 0 ? '+' : ''}{analytics.userGrowth.toFixed(1)}%)
              </span>
            </div>
          </motion.div>

          {/* Trips Metric */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white"
          >
            <MapPinIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Trips</h3>
            <p className="text-3xl font-bold">{analytics.totalTrips}</p>
            <div className={`flex items-center space-x-1 mt-2 ${analytics.tripGrowth >= 0 ? 'text-green-100' : 'text-red-100'}`}>
              <span>{analytics.tripGrowth >= 0 ? '↗' : '↘'}</span>
              <span className="text-sm">
                {analytics.newTrips} new ({analytics.tripGrowth > 0 ? '+' : ''}{analytics.tripGrowth.toFixed(1)}%)
              </span>
            </div>
          </motion.div>

          {/* Chats Metric */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          >
            <ChatBubbleLeftRightIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Chats</h3>
            <p className="text-3xl font-bold">{analytics.totalChats}</p>
            <div className={`flex items-center space-x-1 mt-2 ${analytics.chatGrowth >= 0 ? 'text-purple-100' : 'text-red-100'}`}>
              <span>{analytics.chatGrowth >= 0 ? '↗' : '↘'}</span>
              <span className="text-sm">
                {analytics.newChats} new ({analytics.chatGrowth > 0 ? '+' : ''}{analytics.chatGrowth.toFixed(1)}%)
              </span>
            </div>
          </motion.div>

          {/* Revenue Metric */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-orange-500 to-red-500 text-white"
          >
            <CurrencyDollarIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Budget</h3>
            <p className="text-3xl font-bold">₹{analytics.totalBudget.toLocaleString()}</p>
            <div className="text-orange-100 text-sm mt-2">
              Avg: ₹{Math.round(analytics.avgBudget)} | Recent: ₹{analytics.recentTotalBudget.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Charts and Detailed Analytics */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Activity Chart */}
          {analytics.popularDestinations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No destination data available
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Daily Activity (Last 7 Days)
            </h3>
            <div className="h-48 mb-4">
              <DynamicBarChart 
                data={analytics.dailyActivity.map(day => day.trips)} 
                labels={analytics.dailyActivity.map(day => day.date)}
                color="bg-gradient-to-t from-blue-500 to-cyan-500"
                height={48}
              />
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs text-gray-600">
              {analytics.dailyActivity.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="font-semibold">{day.date}</div>
                  <div className="text-blue-600">{day.trips} trips</div>
                  <div className="text-purple-600">{day.chats} chats</div>
                  <div className="text-green-600">{day.users} users</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Popular Destinations */}
          {analytics.popularDestinations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No destination data available
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-green-600" />
              Popular Destinations
            </h3>
            <div className="space-y-4">
              {analytics.popularDestinations.map(([destination, count], index) => (
                <div key={destination} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{destination}</span>
                  </div>
                  <div className="flex items-center space-x-3 w-32">
                    <span className="text-gray-600 text-sm">{count} trips</span>
                    <ProgressBar 
                      value={count} 
                      max={analytics.popularDestinations[0]?.[1] || 1} 
                      color="bg-green-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Distribution Charts */}
        {analytics.popularDestinations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No destination data available
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Comfort Level Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentChartBarIcon className="w-5 h-5 mr-2 text-orange-600" />
              Comfort Level Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.comfortDistribution).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{level.toLowerCase()}</span>
                  <div className="flex items-center space-x-3 w-48">
                    <span className="font-semibold text-gray-900 text-sm">{count}</span>
                    <ProgressBar 
                      value={count} 
                      max={analytics.totalTrips} 
                      color="bg-orange-500" 
                    />
                    <span className="text-gray-500 text-xs w-12 text-right">
                      {((count / analytics.totalTrips) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Transport Mode Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
              Transport Mode Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.transportDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([mode, count]) => (
                <div key={mode} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{mode.toLowerCase()}</span>
                  <div className="flex items-center space-x-3 w-48">
                    <span className="font-semibold text-gray-900 text-sm">{count}</span>
                    <ProgressBar 
                      value={count} 
                      max={Math.max(...Object.values(analytics.transportDistribution))} 
                      color="bg-blue-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* User Engagement & Platform Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-purple-600" />
              User Engagement
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold text-gray-900">{analytics.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recent Active Users</span>
                <span className="font-semibold text-gray-900">{analytics.activeUsersRecent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Messages/User</span>
                <span className="font-semibold text-gray-900">{analytics.avgMessagesPerUser.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Engagement Score</span>
                <span className="font-semibold text-gray-900">{analytics.avgEngagement.toFixed(1)}</span>
              </div>
            </div>
          </motion.div>

          {/* Chat Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-green-600" />
              Chat Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Conversations</span>
                <span className="font-semibold text-gray-900">{analytics.activeConversations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Conv. Length</span>
                <span className="font-semibold text-gray-900">
                  {analytics.activeConversations > 0 ? (analytics.totalChats / analytics.activeConversations).toFixed(1) : 0}
                </span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold text-green-600">
                    {analytics.totalChats > 0 ? ((analytics.totalChats / (analytics.totalChats + analytics.recentChats.length)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <ProgressBar value={analytics.totalChats} max={analytics.totalChats + analytics.recentChats.length} color="bg-green-500" />
              </div>
            </div>
          </motion.div>

          {/* Platform Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Platform Health
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Data Freshness</span>
                  <span className="font-semibold text-green-600">
                    {analytics.recentTrips.length > 0 ? 'Live' : 'Stale'}
                  </span>
                </div>
                <ProgressBar 
                  value={analytics.recentTrips.length} 
                  max={Math.max(analytics.recentTrips.length, 1)} 
                  color={analytics.recentTrips.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} 
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">User Activity</span>
                  <span className="font-semibold text-blue-600">
                    {((analytics.activeUsersRecent / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <ProgressBar 
                  value={analytics.activeUsersRecent} 
                  max={Math.max(analytics.totalUsers, 1)} 
                  color="bg-blue-500" 
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Trip Success Rate</span>
                  <span className="font-semibold text-purple-600">
                    {analytics.totalTrips > 0 ? ((analytics.totalTrips / (analytics.totalTrips + analytics.recentTrips.length)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <ProgressBar value={analytics.totalTrips} max={analytics.totalTrips + analytics.recentTrips.length} color="bg-purple-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
              Recent Users
            </h3>
            <div className="space-y-3">
              {analytics.recentUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.tripCount || 0} trips, {user.chatCount || 0} chats</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-green-600" />
              Recent Trips
            </h3>
            <div className="space-y-3">
              {analytics.recentTrips.map(trip => (
                <div key={trip.id} className="p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-gray-900">
                      {trip.sourceCity} → {trip.destinationCity}
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {trip.comfortLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>by {trip.username}</span>
                    <span>₹{trip.budget || 0}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {trip.recommendedMode && `Via ${trip.recommendedMode}`}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Chats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-purple-600" />
              Recent Chats
            </h3>
            <div className="space-y-3">
              {analytics.recentChats.map(chat => (
                <div key={chat.id} className="p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{chat.username}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {chat.userMessage}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    AI: {chat.aiResponse?.substring(0, 50)}...
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;