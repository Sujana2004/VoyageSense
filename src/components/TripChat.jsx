import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  LightBulbIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  CloudIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import { TripChatService } from '../services/TripChatService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const TripChat = ({ trip, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: LightBulbIcon, label: 'Full Itinerary', topic: 'itinerary' },
    { icon: CurrencyRupeeIcon, label: 'Budget Tips', topic: 'budget' },
    { icon: MapPinIcon, label: 'Best Places', topic: 'places' },
    { icon: CloudIcon, label: 'Weather Info', topic: 'weather' },
    { icon: TruckIcon, label: 'Transport Options', topic: 'transport' },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start with a welcome message about the trip
      startTripChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startTripChat = async () => {
    setIsLoading(true);
    try {
      const response = await TripChatService.chatAboutTrip(trip);
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: response.aiResponse || 'Hello! I\'m your travel assistant. I can help you with itinerary planning, budget optimization, local recommendations, and more about your trip. What would you like to know?',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      toast.error('Failed to start trip chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (topic) => {
    const prompts = TripChatService.getTopicPrompts(trip);
    setInputMessage(prompts[topic]);
    await handleSendMessage(prompts[topic]);
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await TripChatService.chatAboutTrip(trip, messageToSend);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      // Remove loading state but keep user message
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trip Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trip.sourceCity} → {trip.destinationCity}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick Help:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.topic}
                  onClick={() => handleQuickAction(action.topic)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  {message.type === 'user' ? (
                    // User message - plain text
                    <>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-2 text-blue-200">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </>
                  ) : (
                    // AI message - with markdown rendering (NO BULLET POINTS)
                    <>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Style headings
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-800 mb-2 mt-3" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-gray-800 mb-2 mt-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-bold text-gray-700 mb-1 mt-1" {...props} />,
                            
                            // Style paragraphs
                            p: ({node, ...props}) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                            
                            // ✅ FIX: Remove bullet points from lists
                            ul: ({node, ...props}) => <ul className="list-none mb-2 space-y-1 ml-0" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-none mb-2 space-y-1 ml-0" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                            
                            // Style strong/bold
                            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                            
                            // Style links
                            a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
                            
                            // Style code
                            code: ({node, inline, ...props}) => 
                              inline 
                                ? <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
                                : <code className="block bg-gray-200 p-2 rounded text-sm font-mono overflow-x-auto mb-2" {...props} />,
                            
                            // Style blockquotes
                            blockquote: ({node, ...props}) => 
                              <blockquote className="border-l-4 border-blue-500 pl-3 italic text-gray-600 my-2" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                <LoadingSpinner size="small" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your trip itinerary, budget, places to visit..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TripChat;