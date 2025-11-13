import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ChatManagement = () => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [chatsPerPage] = useState(10);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'conversations'

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    filterChats();
  }, [chats, searchTerm, userFilter]);

  // Add data validation
  const validateChatData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from server');
    }
    return data;
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllChats();
      const validatedData = validateChatData(response.data);
      setChats(validatedData);

      const users = [...new Set(validatedData.map(chat => chat.username).filter(Boolean))];
      setUniqueUsers(users);
    } catch (error) {
      console.error('Error fetching chats:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to load chat history');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = chats;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.userMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.aiResponse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.conversationId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // User filter
    if (userFilter !== 'ALL') {
      filtered = filtered.filter(chat => chat.username === userFilter);
    }

    setFilteredChats(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastChat = currentPage * chatsPerPage;
  const indexOfFirstChat = indexOfLastChat - chatsPerPage;
  const currentChats = filteredChats.slice(indexOfFirstChat, indexOfLastChat);
  const totalPages = Math.ceil(filteredChats.length / chatsPerPage);

  const handleViewChat = (chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
  };

  const handleDeleteChat = (chat) => {
    setSelectedChat(chat);
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    try {
      await adminAPI.deleteChat(selectedChat.id);
      setChats(chats.filter(chat => chat.id !== selectedChat.id));
      toast.success('Chat message deleted successfully');
      setShowDeleteModal(false);
      setSelectedChat(null);
    } catch (error) {
      toast.error('Failed to delete chat message');
      setShowDeleteModal(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this entire conversation? This will remove all messages in this conversation.')) {
      try {
        await adminAPI.deleteConversation(conversationId);
        setChats(chats.filter(chat => chat.conversationId !== conversationId));
        toast.success('Conversation deleted successfully');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const viewConversationDetails = async (conversationId) => {
    try {
      const response = await adminAPI.getConversationDetails(conversationId);
      setSelectedConversation(response.data);
      setShowConversationModal(true);
    } catch (error) {
      toast.error('Failed to load conversation details');
    }
  };

  const getConversationMessages = (conversationId) => {
    return chats.filter(chat => chat.conversationId === conversationId);
  };

  const getUniqueConversations = () => {
    const conversationMap = new Map();
    chats.forEach(chat => {
      if (chat.conversationId && !conversationMap.has(chat.conversationId)) {
        conversationMap.set(chat.conversationId, {
          id: chat.conversationId,
          username: chat.username,
          messageCount: getConversationMessages(chat.conversationId).length,
          lastMessage: chat.timestamp,
          firstMessage: getConversationMessages(chat.conversationId)[0]?.userMessage
        });
      }
    });
    return Array.from(conversationMap.values());
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

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'No message';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
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
                <ChatBubbleLeftRightIcon className="w-10 h-10 mr-3 text-purple-600" />
                Chat Management
              </h1>
              <p className="text-gray-600">
                Monitor and manage AI chat conversations
              </p>
            </div>
            <button
              onClick={fetchChats}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <ChatBubbleLeftRightIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Total Messages</h3>
            <p className="text-3xl font-bold">{chats.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <UserIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Active Users</h3>
            <p className="text-3xl font-bold">
              {new Set(chats.map(chat => chat.username).filter(Boolean)).size}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <ClipboardDocumentListIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Conversations</h3>
            <p className="text-3xl font-bold">
              {getUniqueConversations().length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CalendarIcon className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Today's Chats</h3>
            <p className="text-3xl font-bold">
              {chats.filter(chat => {
                const today = new Date();
                const chatDate = new Date(chat.timestamp);
                return chatDate.toDateString() === today.toDateString();
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
                  placeholder="Search messages, users, or conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
                />
              </div>

              {/* User Filter */}
              <div className="relative">
                <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="ALL">All Users</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {currentChats.length} of {filteredChats.length} messages
            </div>
          </div>
        </div>

        {/* Tabs for Messages vs Conversations */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm border">
          <button 
            className={`flex-1 py-2 px-4 rounded-md font-semibold ${
              activeTab === 'messages' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            Individual Messages
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded-md font-semibold ${
              activeTab === 'conversations' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => setActiveTab('conversations')}
          >
            Conversation View
          </button>
        </div>

        {/* Chats Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">User Message</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">AI Response</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Conversation</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentChats.map((chat, index) => (
                  <motion.tr
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 text-sm">
                          {truncateText(chat.userMessage, 80)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <div className="text-gray-700 text-sm">
                          {truncateText(chat.aiResponse, 80)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{chat.username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                          {chat.conversationId ? truncateText(chat.conversationId, 20) : 'No ID'}
                        </code>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {chat.timestamp ? formatDate(chat.timestamp) : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewChat(chat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChat(chat)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Message"
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
            {currentChats.length === 0 && (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">No chat messages found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
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
                      ? 'bg-purple-500 text-white border-purple-500'
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

        {/* Conversation Summary Section */}
        {getUniqueConversations().length > 0 && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-purple-600" />
              Conversation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUniqueConversations().slice(0, 6).map(conversation => (
                <div key={conversation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">{conversation.username}</div>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {conversation.messageCount} messages
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {truncateText(conversation.firstMessage, 60)}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatDate(conversation.lastMessage)}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => viewConversationDetails(conversation.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteConversation(conversation.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Conversation"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>               
              ))}
            </div>
          </div>
        )}

        {/* Chat Details Modal */}
        {showChatModal && selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Chat Details</h3>
                  <button
                    onClick={() => setShowChatModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedChat.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedChat.username || 'Unknown User'}</div>
                        <div className="text-sm text-gray-600">
                          Conversation: <code className="bg-gray-200 px-1 rounded">{selectedChat.conversationId || 'No ID'}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Message */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-700">User Message</span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selectedChat.userMessage || 'No message content'}
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-700">AI Response</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selectedChat.aiResponse || 'No response content'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Timestamp:</span>
                        <div className="text-gray-600 mt-1">
                          {selectedChat.timestamp ? formatDate(selectedChat.timestamp) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Conversation ID:</span>
                        <div className="text-gray-600 mt-1 font-mono text-xs break-all">
                          {selectedChat.conversationId || 'Not available'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowChatModal(false)}
                    className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full"
            >
              <div className="p-6">
                <div className="text-center">
                  <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Chat Message</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this chat message? This action cannot be undone.
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
                    onClick={confirmDeleteChat}
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

export default ChatManagement;