import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Document reference for tracking assignment state
const ASSIGNMENT_TRACKER_DOC = 'assignment_tracker';
const SALESMEN_COLLECTION = 'salesmen';

/**
 * Get the next available salesman in round-robin fashion
 */
const getNextSalesman = async () => {
  try {
    // Get all active salesmen and sort them consistently by email to ensure stable ordering
    const salesmenSnapshot = await getDocs(collection(db, SALESMEN_COLLECTION));
    const salesmen = [];
    
    salesmenSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email) { // Only include salesmen with email
        salesmen.push({
          id: doc.id,
          email: data.email,
          name: data.name || 'Salesperson ' + doc.id,
          ...data
        });
      }
    });

    // Sort salesmen by email to ensure consistent ordering
    salesmen.sort((a, b) => a.email.localeCompare(b.email));

    if (salesmen.length === 0) {
      throw new Error('No valid salesmen found (must have email)');
    }

    console.log('Available salesmen (sorted):', salesmen.map(s => s.email));

    // Get or initialize the assignment tracker
    const trackerRef = doc(db, 'system', ASSIGNMENT_TRACKER_DOC);
    let trackerData = null;
    
    // Try to get the tracker, create if it doesn't exist
    const trackerDoc = await getDoc(trackerRef);
    if (trackerDoc.exists()) {
      trackerData = trackerDoc.data();
      console.log('Current tracker data:', trackerData);
    } else {
      console.log('No tracker document found, creating a new one');
      trackerData = {
        lastAssignedIndex: -1,
        lastAssignedEmail: null,
        salesmenCount: salesmen.length,
        salesmenEmails: salesmen.map(s => s.email),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(trackerRef, trackerData);
      console.log('Created new assignment tracker');
    }

    let nextIndex = 0;
    
    // Check if the salesmen team has changed
    const currentEmails = salesmen.map(s => s.email);
    const trackedEmails = trackerData.salesmenEmails || [];
    const teamChanged = currentEmails.length !== trackedEmails.length || 
                       !currentEmails.every(email => trackedEmails.includes(email));

    if (teamChanged) {
      console.log('Salesmen team has changed. Recalculating assignment...');
      console.log('Previous team:', trackedEmails);
      console.log('Current team:', currentEmails);
      
      // If team changed, find the position of the last assigned salesman in the new team
      if (trackerData.lastAssignedEmail) {
        const lastAssignedIndex = salesmen.findIndex(s => s.email === trackerData.lastAssignedEmail);
        if (lastAssignedIndex !== -1) {
          // Continue from the next person after the last assigned
          nextIndex = (lastAssignedIndex + 1) % salesmen.length;
          console.log(`Last assigned was ${trackerData.lastAssignedEmail} at index ${lastAssignedIndex}, continuing from index ${nextIndex}`);
        } else {
          // Last assigned person is no longer in the team, start from beginning
          nextIndex = 0;
          console.log(`Last assigned person ${trackerData.lastAssignedEmail} is no longer in team, starting from index 0`);
        }
      } else {
        // No previous assignment, start from beginning
        nextIndex = 0;
        console.log('No previous assignment found, starting from index 0');
      }
    } else {
      // Team hasn't changed, continue normal round-robin
      const lastIndex = typeof trackerData.lastAssignedIndex === 'number' ? trackerData.lastAssignedIndex : -1;
      nextIndex = (lastIndex + 1) % salesmen.length;
      console.log(`Team unchanged. Last index: ${lastIndex}, next index: ${nextIndex}`);
    }

    const nextSalesman = salesmen[nextIndex];
    console.log('Next salesman:', nextSalesman.email, 'at index:', nextIndex);

    // Update the tracker with the new assignment
    const updatedTrackerData = {
      lastAssignedIndex: nextIndex,
      lastAssignedEmail: nextSalesman.email,
      salesmenCount: salesmen.length,
      salesmenEmails: currentEmails,
      updatedAt: serverTimestamp(),
      lastAssignedTo: nextSalesman.email,
      lastAssignedAt: serverTimestamp()
    };

    await setDoc(trackerRef, updatedTrackerData, { merge: true });
    console.log('Updated tracker with new assignment data');
    
    return nextSalesman;
  } catch (error) {
    console.error('Error in getNextSalesman:', error);
    throw error;
  }
};

/**
 * Assign a new inquiry to the next available salesman
 */
export const assignInquiry = async (inquiryData) => {
  try {
    console.log('Starting inquiry assignment for:', inquiryData);
    const nextSalesman = await getNextSalesman();
    
    if (!nextSalesman || !nextSalesman.id || !nextSalesman.email) {
      throw new Error('Invalid salesman data received');
    }
    
    const assignedInquiry = {
      ...inquiryData,
      assignedSalesperson: nextSalesman.email, // Field required by Cloud Function
      assignedTo: {
        id: nextSalesman.id,
        email: nextSalesman.email,
        name: nextSalesman.name || 'Salesperson ' + nextSalesman.id,
        assignedAt: serverTimestamp(),
      },
      status: 'assigned',
      updatedAt: serverTimestamp(),
    };
    
    console.log('Assigned inquiry to:', nextSalesman.email);
    return assignedInquiry;
    
  } catch (error) {
    console.error('Error in assignInquiry:', error);
    // Return unassigned inquiry if there's an error
    const unassignedInquiry = {
      ...inquiryData,
      status: 'unassigned',
      error: error.message,
      updatedAt: serverTimestamp(),
      lastAssignmentAttempt: serverTimestamp()
    };
    console.log('Returning unassigned inquiry:', unassignedInquiry);
    return unassignedInquiry;
  }
};

/**
 * Reassign all unassigned inquiries
 */
export const reassignUnassignedInquiries = async () => {
  try {
    const q = query(
      collection(db, 'inquiries'),
      where('status', '==', 'unassigned')
    );
    
    const querySnapshot = await getDocs(q);
    const updates = [];
    
    for (const doc of querySnapshot.docs) {
      const inquiryData = doc.data();
      const updatedInquiry = await assignInquiry(inquiryData);
      updates.push(updateDoc(doc.ref, updatedInquiry));
    }
    
    await Promise.all(updates);
    return { success: true, count: updates.length };
  } catch (error) {
    console.error('Error reassigning inquiries:', error);
    throw error;
  }
};

/**
 * Reset the assignment tracker for testing purposes
 */
export const resetAssignmentTracker = async () => {
  try {
    const trackerRef = doc(db, 'system', ASSIGNMENT_TRACKER_DOC);
    await setDoc(trackerRef, {
      lastAssignedIndex: -1,
      updatedAt: serverTimestamp(),
      resetAt: serverTimestamp()
    }, { merge: true });
    console.log('Assignment tracker has been reset');
    return { success: true };
  } catch (error) {
    console.error('Error resetting assignment tracker:', error);
    throw error;
  }
};

// Export the missing function
export { getNextSalesman };
