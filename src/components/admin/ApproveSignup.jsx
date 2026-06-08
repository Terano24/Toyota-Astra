import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';


function ApproveSignup() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const { currentUser } = useAuth();

  // Fetch pending signup requests
  useEffect(() => {
    const q = query(
      collection(db, 'signup_requests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  

  const handleApprove = async (request) => {
    if (!window.confirm(`Approve signup request for ${request.email}?`)) {
      return;
    }
    try {
      setStatus({ type: 'processing', message: 'Processing approval...' });
      const auth = getAuth();
      try {
        await createUserWithEmailAndPassword(
          auth,
          request.email,
          Math.random().toString(36).slice(-10) + 'A1!'
        );

      } catch (authError) {
        if (authError.code !== 'auth/email-already-in-use') {
          throw authError;
        }
        // If user already exists, just proceed to approval
      }
      // Immediately send password reset email after approval
      await sendPasswordResetEmail(auth, request.email);
      // Send approval notification via EmailJS
      try {
        emailjs.init('1Wrr3tO9webkKwslK');
        await emailjs.send(
          'service_6p22bud',
          'template_blc4wpk',
          {
            email: request.email,
            login_url: "http://localhost:3000/login",
            to_email: request.email
          }
        );
      } catch (emailError) {
        console.error('Failed to send approval notification via EmailJS:', emailError);
      }
      await updateDoc(doc(db, 'signup_requests', request.id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
      setStatus({
        type: 'success',
        message: `Successfully approved ${request.email}. A password reset email has been sent by Firebase.`
      });
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error approving request:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to approve request'
      });
    }
  };

  const handleReject = async (request) => {
    if (!window.confirm(`Reject signup request for ${request.email}?`)) {
      return;
    }
    
    try {
      setStatus({ type: 'processing', message: 'Processing rejection...' });
      
      await updateDoc(doc(db, 'signup_requests', request.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
      
      setStatus({
        type: 'success',
        message: `Successfully rejected ${request.email}.`
      });
      
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to reject request'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 md:mb-6" style={{ color: '#E31937' }}>Signup Requests</h1>
      
      {status.message && (
        <div 
          className={`mb-4 p-4 rounded ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {status.message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          No pending signup requests
        </div>
      ) : (
        <div>
          {/* Mobile View: Cards */}
          <div className="md:hidden space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                <div>
                  <p className="text-base font-bold text-gray-800 break-all">{request.email}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(request.requestedAt || new Date()).toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-gray-700">
                  {request.message || 'No message'}
                </p>
                <div className="flex justify-end items-center mt-4 space-x-2">
                  <button
                    onClick={() => handleApprove(request)}
                    className="px-4 py-2 text-xs font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
                    disabled={status.type === 'processing'}
                  >
                    {status.type === 'processing' ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
                    disabled={status.type === 'processing'}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestedAt || new Date()).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {request.message || 'No message'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleApprove(request)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      disabled={status.type === 'processing'}
                    >
                      {status.type === 'processing' ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors ml-2"
                      disabled={status.type === 'processing'}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproveSignup;
