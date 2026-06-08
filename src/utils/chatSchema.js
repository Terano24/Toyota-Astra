// Chat System Database Schema for Firestore

/**
 * Collection: chat_assignments
 * Purpose: Track customer-salesperson relationships
 * Document ID: customer phone number or unique identifier
 */
export const CHAT_ASSIGNMENT_SCHEMA = {
  customerId: 'string', // phone number or unique ID
  customerName: 'string',
  customerPhone: 'string',
  assignedSalesperson: {
    id: 'string',
    email: 'string', 
    name: 'string'
  },
  conversationSid: 'string', // Twilio Conversation SID
  assignedAt: 'timestamp',
  lastMessageAt: 'timestamp',
  status: 'string', // 'active', 'inactive', 'closed'
  assignmentMethod: 'string', // 'inquiry', 'chat', 'manual'
  roundRobinIndex: 'number', // for tracking assignment order
  inquiryId: 'string' // if started from inquiry
};

/**
 * Collection: chat_messages (optional - for backup/analytics)
 * Purpose: Mirror Twilio messages in Firestore for analytics
 * Document ID: auto-generated
 */
export const CHAT_MESSAGE_SCHEMA = {
  conversationSid: 'string',
  messageSid: 'string', // Twilio message SID
  customerId: 'string',
  salespersonId: 'string',
  content: 'string',
  sender: 'string', // 'customer' or 'salesperson'
  timestamp: 'timestamp',
  messageType: 'string' // 'text', 'media', 'system'
};

/**
 * Collection: chat_sessions
 * Purpose: Track active chat sessions and presence
 * Document ID: conversation SID
 */
export const CHAT_SESSION_SCHEMA = {
  conversationSid: 'string',
  customerId: 'string',
  salespersonId: 'string',
  customerOnline: 'boolean',
  salespersonOnline: 'boolean',
  lastCustomerActivity: 'timestamp',
  lastSalespersonActivity: 'timestamp',
  sessionStarted: 'timestamp',
  sessionEnded: 'timestamp',
  status: 'string' // 'active', 'waiting', 'ended'
};

/**
 * Enhanced inquiry schema to include chat integration
 */
export const ENHANCED_INQUIRY_SCHEMA = {
  // ... existing inquiry fields
  hasChat: 'boolean', // whether this inquiry has associated chat
  conversationSid: 'string', // Twilio conversation SID if chat exists
  chatStartedAt: 'timestamp',
  lastChatActivity: 'timestamp'
};

/**
 * Collection: chat_round_robin
 * Purpose: Track round-robin assignment for chat (separate from inquiry)
 * Document ID: 'chat_tracker'
 */
export const CHAT_ROUND_ROBIN_SCHEMA = {
  lastAssignedIndex: 'number',
  lastAssignedTo: 'string', // salesperson email
  lastAssignedAt: 'timestamp',
  totalAssignments: 'number',
  updatedAt: 'timestamp'
};

// Constants for chat system
export const CHAT_CONSTANTS = {
  ASSIGNMENT_COLLECTION: 'chat_assignments',
  MESSAGES_COLLECTION: 'chat_messages', 
  SESSIONS_COLLECTION: 'chat_sessions',
  ROUND_ROBIN_DOC: 'chat_tracker',
  
  ASSIGNMENT_METHODS: {
    INQUIRY: 'inquiry',
    CHAT: 'chat',
    MANUAL: 'manual'
  },
  
  SESSION_STATUS: {
    ACTIVE: 'active',
    WAITING: 'waiting', 
    ENDED: 'ended'
  },
  
  ASSIGNMENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CLOSED: 'closed'
  }
};
