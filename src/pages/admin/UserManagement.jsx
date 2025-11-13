import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const validateUserData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from server');
    }
    return data;
  };

  // Use it in fetchUsers
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const validatedData = validateUserData(response.data);
      setUsers(validatedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('Users endpoint not found');
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success(`User ${selectedUser.username} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to delete user');
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (role) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
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
                <UsersIcon className="w-10 h-10 mr-3 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600">
                Manage all users and their activities
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <UsersIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <ShieldCheckIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Admins</h3>
            <p className="text-3xl font-bold">
              {users.filter(user => user.role === 'ADMIN').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <UserPlusIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Active Today</h3>
            <p className="text-3xl font-bold">
              {users.filter(user => {
                const today = new Date();
                const userDate = new Date(user.createdAt);
                return userDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <EyeIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Trips Created</h3>
            <p className="text-3xl font-bold">
              {users.reduce((total, user) => total + (user.tripCount || 0), 0)}
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {currentUsers.length} of {filteredUsers.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Trips</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Chats</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.role)} border`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-blue-600">{user.tripCount || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-600">{user.chatCount || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
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
            {currentUsers.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">
                  {searchTerm || roleFilter !== 'ALL' ? 'No matching users found' : 'No users found'}
                </h3>
                <p className="text-gray-400">
                  {searchTerm || roleFilter !== 'ALL' 
                    ? 'Try adjusting your search or filters' 
                    : 'No users have registered yet'
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
                      ? 'bg-blue-500 text-white border-blue-500'
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

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 ${
                      selectedUser.role === 'ADMIN' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-lg font-semibold">{selectedUser.username}</h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.tripCount || 0}</div>
                      <div className="text-sm text-gray-600">Trips</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedUser.chatCount || 0}</div>
                      <div className="text-sm text-gray-600">Chats</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Joined:</span>
                        <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Last Active:</span>
                        <span>{new Date(selectedUser.updatedAt || selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full"
            >
              <div className="p-6">
                <div className="text-center">
                  <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete <strong>{selectedUser.username}</strong>? This action cannot be undone.
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
                    onClick={confirmDeleteUser}
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

export default UserManagement;