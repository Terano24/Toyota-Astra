import React, { useState, useEffect, useRef } from 'react';
import { Client as ConversationsClient } from '@twilio/conversations';
import { FiMessageCircle, FiSend, FiUser, FiClock, FiPhone } from 'react-icons/fi';
import { useAuth } from '../../contexts/authContext';
import { getChatAssignmentsForSalesperson } from '../../utils/chatAssignment';

const COLORS = {
  primary: '#dc2626',
  secondary: '#1f2937',
  background: '#f8fafc',
  white: '#ffffff',
  textLight: '#6b7280',
  border: '#e5e7eb'
};

const ChatInterface = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationClient, setConversationClient] = useState(null);
  const [activeConversationObj, setActiveConversationObj] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat client and load conversations
  useEffect(() => {
    if (currentUser?.email) {
      initializeChatClient();
      loadConversations();
    }
  }, [currentUser]);

  const initializeChatClient = async () => {
    try {
      // Get Twilio access token for salesperson
      const tokenResponse = await fetch('/api/generateSalespersonChatToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salespersonEmail: currentUser.email,
          salespersonName: currentUser.displayName || currentUser.email
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
      }

      const { token } = await tokenResponse.json();

      // Initialize Twilio Conversations client
      const client = new ConversationsClient(token);
      setConversationClient(client);

      // Listen for new conversations
      client.on('conversationJoined', (conversation) => {
        console.log('Joined conversation:', conversation.sid);
        loadConversations(); // Refresh conversation list
      });

    } catch (error) {
      console.error('Failed to initialize chat client:', error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const assignments = await getChatAssignmentsForSalesperson(currentUser.email);
      
      // Sort by last message time
      const sortedAssignments = assignments.sort((a, b) => {
        const aTime = a.lastMessageAt?.toDate() || a.assignedAt?.toDate() || new Date(0);
        const bTime = b.lastMessageAt?.toDate() || b.assignedAt?.toDate() || new Date(0);
        return bTime - aTime;
      });
      
      setConversations(sortedAssignments);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    if (!conversationClient || !conversation.conversationSid) return;

    try {
      setSelectedConversation(conversation);
      setMessages([]);

      // Get Twilio conversation object
      const twilioConversation = await conversationClient.getConversationBySid(conversation.conversationSid);
      setActiveConversationObj(twilioConversation);

      // Load messages
      const existingMessages = await twilioConversation.getMessages();
      const formattedMessages = existingMessages.items.map(msg => ({
        id: msg.sid,
        content: msg.body,
        sender: msg.author === conversation.customerId ? 'customer' : 'salesperson',
        timestamp: msg.dateCreated,
        author: msg.author
      }));
      setMessages(formattedMessages);

      // Listen for new messages in this conversation
      twilioConversation.on('messageAdded', (message) => {
        const formattedMessage = {
          id: message.sid,
          content: message.body,
          sender: message.author === conversation.customerId ? 'customer' : 'salesperson',
          timestamp: message.dateCreated,
          author: message.author
        };
        setMessages(prev => [...prev, formattedMessage]);
      });

    } catch (error) {
      console.error('Failed to select conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversationObj) return;

    try {
      await activeConversationObj.sendMessage(newMessage);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiMessageCircle size={20} />
            Chat Pelanggan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} percakapan aktif
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FiMessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Belum ada percakapan</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <FiUser size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {conversation.customerName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessageAt || conversation.assignedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <FiPhone size={12} />
                      <span className="truncate">{conversation.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        conversation.assignmentMethod === 'inquiry' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {conversation.assignmentMethod === 'inquiry' ? 'Dari Inquiry' : 'Chat Langsung'}
                      </span>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-gray-400">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser size={20} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedConversation.customerName}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiPhone size={12} />
                      {selectedConversation.customerPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      Dimulai {formatDate(selectedConversation.assignedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'salesperson' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'salesperson'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'salesperson' ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiSend size={16} />
                  Kirim
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <FiMessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Pilih Percakapan</h3>
              <p>Pilih percakapan dari daftar untuk mulai chat dengan pelanggan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
