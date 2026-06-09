import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getNextSalesman } from './inquiryAssignment';
import { CHAT_CONSTANTS } from './chatSchema';

/**
 * Get or create chat assignment for a customer
 * This function handles both inquiry-initiated and chat-initiated conversations
 */
export const getOrCreateChatAssignment = async (customerData, assignmentMethod = 'chat', inquiryId = null) => {
  try {
    const customerId = customerData.customerId || customerData.email;
    
    // Check if customer already has an assignment
    const assignmentRef = doc(db, CHAT_CONSTANTS.ASSIGNMENT_COLLECTION, customerId);
    const existingAssignment = await getDoc(assignmentRef);
    
    if (existingAssignment.exists()) {
      const assignment = existingAssignment.data();
      
      // Update last activity
      await updateDoc(assignmentRef, {
        lastMessageAt: serverTimestamp(),
        status: CHAT_CONSTANTS.ASSIGNMENT_STATUS.ACTIVE
      });
      
      return {
        ...assignment,
        isExisting: true
      };
    }
    
    // Create new assignment using existing round-robin system
    const nextSalesman = await getNextSalesman();
    
    if (!nextSalesman) {
      throw new Error('No available salespeople');
    }
    
    const newAssignment = {
      customerId,
      customerName: customerData.name,
      customerPhone: customerData.email,
      assignedSalesperson: {
        id: nextSalesman.id,
        email: nextSalesman.email,
        name: nextSalesman.name || nextSalesman.email
      },
      conversationSid: null, // Will be set when Twilio conversation is created
      assignedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      status: CHAT_CONSTANTS.ASSIGNMENT_STATUS.ACTIVE,
      assignmentMethod,
      inquiryId,
      roundRobinIndex: nextSalesman.assignmentIndex || 0
    };
    
    await setDoc(assignmentRef, newAssignment);
    
    return {
      ...newAssignment,
      isExisting: false
    };
    
  } catch (error) {
    console.error('Error in getOrCreateChatAssignment:', error);
    throw error;
  }
};

/**
 * Update chat assignment with Twilio conversation SID
 */
export const updateChatAssignmentWithConversation = async (customerId, conversationSid) => {
  try {
    const assignmentRef = doc(db, CHAT_CONSTANTS.ASSIGNMENT_COLLECTION, customerId);
    await updateDoc(assignmentRef, {
      conversationSid,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating chat assignment with conversation:', error);
    throw error;
  }
};

/**
 * Get chat assignment by customer ID
 */
export const getChatAssignment = async (customerId) => {
  try {
    const assignmentRef = doc(db, CHAT_CONSTANTS.ASSIGNMENT_COLLECTION, customerId);
    const assignmentDoc = await getDoc(assignmentRef);
    
    if (assignmentDoc.exists()) {
      return assignmentDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chat assignment:', error);
    throw error;
  }
};

/**
 * Get all chat assignments for a salesperson
 */
export const getChatAssignmentsForSalesperson = async (salespersonEmail) => {
  try {
    const q = query(
      collection(db, CHAT_CONSTANTS.ASSIGNMENT_COLLECTION),
      where('assignedSalesperson.email', '==', salespersonEmail),
      where('status', '==', CHAT_CONSTANTS.ASSIGNMENT_STATUS.ACTIVE)
    );
    
    const querySnapshot = await getDocs(q);
    const assignments = [];
    
    querySnapshot.forEach((doc) => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return assignments;
  } catch (error) {
    console.error('Error getting chat assignments for salesperson:', error);
    throw error;
  }
};

/**
 * Close chat assignment
 */
export const closeChatAssignment = async (customerId) => {
  try {
    const assignmentRef = doc(db, CHAT_CONSTANTS.ASSIGNMENT_COLLECTION, customerId);
    await updateDoc(assignmentRef, {
      status: CHAT_CONSTANTS.ASSIGNMENT_STATUS.CLOSED,
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error closing chat assignment:', error);
    throw error;
  }
};

/**
 * Create chat assignment from existing inquiry
 * This is called when an inquiry is submitted and we want to create a chat
 */
export const createChatFromInquiry = async (inquiryData) => {
  try {
    const customerData = {
      name: inquiryData.name,
      phone: inquiryData.phone,
      customerId: inquiryData.phone
    };
    
    const assignment = await getOrCreateChatAssignment(
      customerData, 
      CHAT_CONSTANTS.ASSIGNMENT_METHODS.INQUIRY,
      inquiryData.id
    );
    
    // Update the inquiry with chat information
    if (inquiryData.id) {
      const inquiryRef = doc(db, 'inquiries', inquiryData.id);
      await updateDoc(inquiryRef, {
        hasChat: true,
        chatStartedAt: serverTimestamp(),
        lastChatActivity: serverTimestamp()
      });
    }
    
    return assignment;
  } catch (error) {
    console.error('Error creating chat from inquiry:', error);
    throw error;
  }
};

/**
 * Update chat assignment activity
 */
export const updateChatActivity = async (customerId) => {
  try {
    const assignmentRef = doc(db, CHAT_CONSTANTS.ASSIGNMENT_COLLECTION, customerId);
    await updateDoc(assignmentRef, {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating chat activity:', error);
    throw error;
  }
};
