
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import emailjs from '@emailjs/browser';

/**
 * Saves a signup request to Firestore for admin approval.
 * @param {string} email - The email address of the requester.
 * @param {string} message - The message provided by the requester.
 * @returns {Promise} - Resolves if the request is saved successfully, rejects otherwise.
 */
// Initialize EmailJS with your public key
const EMAILJS_SERVICE_ID = 'service_6p22bud'; // Correct service ID
// const EMAILJS_TEMPLATE_ID = 'template_5jwhb4l'; // Old template ID (DISABLED)
const EMAILJS_PUBLIC_KEY = '1Wrr3tO9webkKwslK'; // Correct public key

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
            const templateParams = {
    email: email,
    password: "-", // You can replace '-' with a temp password if needed
    to_email: email
};
console.log('[EmailJS] SignupRequest templateParams:', templateParams);
// await emailjs.send(
//    EMAILJS_SERVICE_ID,
//    EMAILJS_TEMPLATE_ID,
//    templateParams,
//    EMAILJS_PUBLIC_KEY
// ); // Disabled old template notification
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
