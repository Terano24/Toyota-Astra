import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client as ConversationsClient } from '@twilio/conversations';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { getOrCreateChatAssignment, updateChatActivity, updateChatAssignmentWithConversation } from '../../utils/chatAssignment';

const ChatWidget = ({ 
  isOpen, 
  onToggle, 
  customerData = null, // { name, phone } - for inquiry integration
  triggerFromInquiry = false,
  inquiryData = null
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationClient, setConversationClient] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const [customerInfo, setCustomerInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate unique customer ID
  const generateCustomerId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `customer_${timestamp}_${random}`;
  };

  // Get or create customer ID
  const getCustomerId = useCallback(() => {
    let customerId = localStorage.getItem('auto2000_customer_id');
    if (!customerId) {
      customerId = generateCustomerId();
      localStorage.setItem('auto2000_customer_id', customerId);
    }
    return customerId;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeCustomer = useCallback(() => {
    if (triggerFromInquiry && customerData) {
      // Use inquiry data if available
      setCustomerInfo(customerData);
    } else {
      // Generate anonymous customer info
      const customerId = getCustomerId();
      const customerInfo = {
        customerId: customerId,
        name: `Pelanggan ${customerId.slice(-6)}`, // Display name like "Pelanggan abc123"
        email: `${customerId}@auto2000.temp`, // Temporary email for system
        isAnonymous: true
      };
      setCustomerInfo(customerInfo);
    }
    setIsInitialized(true);
  }, [triggerFromInquiry, customerData, getCustomerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get or create chat assignment
      const assignment = await getOrCreateChatAssignment(
        customerInfo,
        triggerFromInquiry ? 'inquiry' : 'chat',
        inquiryData?.id
      );

      // The salesperson is assigned, but we don't need to store it in state here.

      // Get Twilio access token with detailed logging
      console.log('🔑 Requesting token for:', {
        email: customerInfo.email,
        name: customerInfo.name,
        customerId: customerInfo.customerId || customerInfo.email
      });
      
      const tokenResponse = await fetch('https://generatechataccesstoken-hpxnqdjnga-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          customerId: customerInfo.customerId || customerInfo.email
        })
      });

      console.log('📡 Token response status:', tokenResponse.status);
      console.log('📡 Token response headers:', Object.fromEntries(tokenResponse.headers));

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token request failed:', errorText);
        throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('🎫 Token received:', {
        hasToken: !!tokenData.token,
        tokenLength: tokenData.token?.length,
        tokenStart: tokenData.token?.substring(0, 50) + '...'
      });
      
      const { token } = tokenData;

      // Initialize Twilio Conversations client with enhanced debugging
      console.log('🚀 Initializing Twilio Conversations client...');
      const client = new ConversationsClient(token);
      
      // Add comprehensive event listeners with detailed logging
      client.on('connectionStateChanged', (state) => {
        console.log('🔄 Twilio connection state changed:', state);
        console.log('🔄 Connection state details:', {
          state,
          timestamp: new Date().toISOString(),
          clientState: client.connectionState
        });
        
        if (state === 'connected') {
          console.log('✅ Successfully connected to Twilio!');
          setIsConnected(true);
        } else if (state === 'disconnected' || state === 'failed') {
          console.log('❌ Connection failed or disconnected:', state);
          setIsConnected(false);
          if (state === 'failed') {
            setError('Koneksi chat terputus. Silakan refresh halaman.');
          }
        }
      });
      
      client.on('connectionError', (error) => {
        console.error('🚨 Twilio connection error:', error);
        console.error('🚨 Connection error details:', {
          message: error.message,
          code: error.code,
          status: error.status,
          terminal: error.terminal
        });
      });
      
      client.on('tokenAboutToExpire', () => {
        console.log('Token about to expire, should refresh');
        // TODO: Implement token refresh
      });
      
      client.on('tokenExpired', () => {
        console.log('Token expired');
        setError('Sesi chat telah berakhir. Silakan refresh halaman.');
      });
      
      // Wait for client to be ready with extended timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Client initialization timeout after 15 seconds'));
        }, 15000); // Extended to 15 seconds
        
        client.on('initialized', () => {
          console.log('✅ Twilio client initialized successfully');
          console.log('✅ Client details:', {
            state: client.connectionState,
            user: client.user?.identity,
            reachabilityEnabled: client.reachabilityEnabled
          });
          clearTimeout(timeout);
          resolve();
        });
        
        client.on('initFailed', (error) => {
          console.error('❌ Twilio client initialization failed:', error);
          console.error('❌ Init failure details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            terminal: error.terminal,
            body: error.body,
            stack: error.stack
          });
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      setConversationClient(client);

      // Create or get conversation
      let conversation;
      if (assignment.conversationSid) {
        // Join existing conversation
        conversation = await client.getConversationBySid(assignment.conversationSid);
      } else {
        // Create new conversation
        const conversationResponse = await fetch('https://createorgetconversation-hpxnqdjnga-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: customerInfo.customerId || customerInfo.email,
            customerName: customerInfo.name,
            salespersonEmail: assignment.assignedSalesperson.email
          })
        });

        if (!conversationResponse.ok) {
          throw new Error('Failed to create conversation');
        }

        const { conversationSid } = await conversationResponse.json();
        conversation = await client.getConversationBySid(conversationSid);

        // Update assignment with conversation SID
        await updateChatAssignmentWithConversation(customerInfo.customerId || customerInfo.email, conversationSid);
      }

      setActiveConversation(conversation);

      // Load existing messages
      const existingMessages = await conversation.getMessages();
      const formattedMessages = existingMessages.items.map(msg => ({
        id: msg.sid,
        content: msg.body,
        sender: msg.author === (customerInfo.customerId || customerInfo.email) ? 'customer' : 'salesperson',
        timestamp: msg.dateCreated,
        author: msg.author
      }));
      setMessages(formattedMessages);

      // Listen for new messages
      conversation.on('messageAdded', (message) => {
        const formattedMessage = {
          id: message.sid,
          content: message.body,
          sender: message.author === (customerInfo.customerId || customerInfo.email) ? 'customer' : 'salesperson',
          timestamp: message.dateCreated,
          author: message.author
        };
        setMessages(prev => [...prev, formattedMessage]);
        
        // Update activity
        updateChatActivity(customerInfo.customerId || customerInfo.email);
      });

      setIsConnected(true);

      // Send welcome message if new conversation
      if (!assignment.isExisting) {
        const welcomeMessage = triggerFromInquiry 
          ? `Halo ${customerInfo.name}! Terima kasih atas inquiry Anda untuk ${inquiryData?.model || 'mobil Toyota'}. Saya ${assignment.assignedSalesperson.name} siap membantu Anda.`
          : `Halo ${customerInfo.name}! Saya ${assignment.assignedSalesperson.name} dari Auto2000 Way Halim. Ada yang bisa saya bantu?`;
        
        setTimeout(() => {
          conversation.sendMessage(welcomeMessage);
        }, 1000);
      }

    } catch (err) {
      console.error('Chat initialization error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err));
      console.error('Error.error:', err.error);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      // Handle specific Twilio error types
      let errorMessage = 'Terjadi kesalahan saat memulai chat';
      
      if (err.error?.message) {
        const twilioError = err.error.message;
        if (twilioError.includes('Twilsock has disconnected')) {
          errorMessage = 'Koneksi chat tidak dapat dibuat. Silakan periksa koneksi internet Anda dan coba lagi.';
        } else if (twilioError.includes('timeout')) {
          errorMessage = 'Koneksi chat timeout. Silakan coba lagi.';
        } else {
          errorMessage = `Error: ${twilioError}`;
        }
      } else if (err.message) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Koneksi chat timeout. Silakan coba lagi.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [customerInfo, triggerFromInquiry, inquiryData]);

  // Initialize customer info when widget opens
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeCustomer();
    }
  }, [isOpen, isInitialized, initializeCustomer]);

  // Initialize chat when customer info is ready
  useEffect(() => {
    if (isOpen && customerInfo && !conversationClient) {
      initializeChat();
    }
  }, [isOpen, customerInfo, conversationClient, initializeChat]);

  // Handle inquiry trigger
  useEffect(() => {
    if (triggerFromInquiry && inquiryData && customerData) {
      setCustomerInfo(customerData);
      setIsInitialized(true);
      if (isOpen) {
        initializeChat();
      }
    }
  }, [triggerFromInquiry, inquiryData, customerData, isOpen, initializeChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await activeConversation.sendMessage(newMessage);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Send message error:', err);
      setError('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <FiMessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Chat dengan Sales Auto2000</h3>
          <p className="text-sm opacity-90">Tanya langsung tentang mobil Toyota impian Anda!</p>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Connection Status */}
      {!isInitialized && (
        <div className="p-4 border-b border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            Menyiapkan chat...
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center text-gray-500 text-sm">
            Menghubungkan...
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 p-3 rounded mb-2">
            <div className="font-semibold mb-1">⚠️ Chat Error</div>
            <div>{error}</div>
            <button 
              onClick={() => {
                setError('');
                setIsConnected(false);
                setConversationClient(null);
                setActiveConversation(null);
                initializeChat();
              }}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === 'customer'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isConnected && isInitialized && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
            
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
