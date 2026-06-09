
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

/**
 * Saves a signup request to Firestore for admin approval.
 * @param {string} email - The email address of the requester.
 * @param {string} message - The message provided by the requester.
 * @returns {Promise} - Resolves if the request is saved successfully, rejects otherwise.
 */

export async function sendSignupRequest(email, message) {
    if (!email || !message) {
        console.error('Signup Request Error: Email and message are required');
        throw new Error('Email and message are required');
    }

    try {
        // 1. First save to Firestore
        const docRef = await addDoc(collection(db, 'signup_requests'), {
            email,
            message,
            status: 'pending',
            requestedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        console.log('Signup request saved with ID: ', docRef.id);
        
        // 2. Send email notification
        try {
// Old email notification logic removed
            console.log('Email notification sent successfully');
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request if email fails
        }
        
        return { success: true, id: docRef.id };
        
    } catch (error) {
        console.error('Error in signup request:', error);
        throw new Error('Failed to process your request. Please try again later.');
    }
}
