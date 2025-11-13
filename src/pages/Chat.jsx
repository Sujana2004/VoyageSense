import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatAPI } from '../services/api';
import { getUser } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversationId');
  
  const user = getUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(conversationIdFromUrl || null);

  useEffect(() => {
    if (conversationId) {
      fetchChatHistory();
    }
  }, [conversationId]);

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory(conversationId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    const tempMessage = {
      id: Date.now(),
      userMessage,
      aiResponse: null,
      timestamp: new Date().toISOString(),
      username: user.username,
    };
    setMessages([...messages, tempMessage]);
    
    setLoading(true);
    toast.loading('AI is thinking...', { id: 'ai-thinking' });

    try {
      const response = await chatAPI.sendMessage(userMessage, conversationId);
      
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempMessage.id),
        response.data,
      ]);
      
      if (!conversationId && response.data.conversationId) {
        setConversationId(response.data.conversationId);
      }
      
      toast.success('Response received!', { id: 'ai-thinking' });
    } catch (error) {
      toast.error('Failed to send message', { id: 'ai-thinking' });
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-5xl font-bold gradient-text mb-2 flex items-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mr-3 text-blue-600" />
            AI Travel Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Ask me anything about travel planning!
          </p>
          {conversationId && (
            <p className="text-sm text-gray-500 mt-2">
              Conversation ID: {conversationId.substring(0, 20)}...
            </p>
          )}
        </motion.div>

        {/* Chat Container */}
        <div className="card h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-gray-600">
                    Ask me about destinations, travel tips, or planning advice!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id || index}>
                  {/* User Message */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-end mb-4"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl rounded-tr-none px-6 py-3 max-w-[80%] shadow-lg">
                      <p className="text-sm font-semibold mb-1">You</p>
                      <p>{message.userMessage}</p>
                    </div>
                  </motion.div>

                  {/* AI Response with Markdown */}
                  {message.aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-none px-6 py-4 max-w-[85%] shadow-lg">
                        <p className="text-sm font-semibold mb-2 text-purple-600 flex items-center">
                          🤖 AI Assistant
                        </p>
                        {/* ✅ Markdown Rendered Content */}
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Style headings
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-800 mb-3 mt-4" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-800 mb-2 mt-3" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-700 mb-2 mt-2" {...props} />,
                              
                              // Style paragraphs
                              p: ({node, ...props}) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                              
                              // Style lists
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 ml-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-gray-700 ml-2" {...props} />,
                              
                              // Style strong/bold
                              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                              
                              // Style links
                              a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
                              
                              // Style code
                              code: ({node, inline, ...props}) => 
                                inline 
                                  ? <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />
                                  : <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3" {...props} />,
                              
                              // Style blockquotes
                              blockquote: ({node, ...props}) => 
                                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3" {...props} />,
                            }}
                          >
                            {message.aiResponse}
                          </ReactMarkdown>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border-2 border-gray-200 rounded-2xl px-6 py-3">
                  <div className="flex space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 bg-purple-600 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-600 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-600 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="border-t-2 border-gray-200 pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about travel..."
                disabled={loading}
                className="input-field flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !input.trim()}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  loading || !input.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <PaperAirplaneIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              'What are the best beaches in Goa?',
              'Plan a 3-day trip to Paris',
              'Budget travel tips for Europe',
            ].map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInput(suggestion)}
                className="p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all text-left"
              >
                <p className="text-sm text-gray-700">{suggestion}</p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Chat;