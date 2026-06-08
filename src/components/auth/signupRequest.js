// Utility to send signup requests to Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

export async function sendSignupRequest(email, message) {
  // Save the request to a Firestore collection 'signup_requests'
  await addDoc(collection(db, 'signup_requests'), {
    email,
    message,
    status: 'pending',
    requestedAt: serverTimestamp()
  });
}
