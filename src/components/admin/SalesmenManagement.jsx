import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';

const COLORS = {
  primary: '#dc2626',
  primaryHover: '#b91c1c',
  secondary: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray800: '#1f2937',
  gray900: '#111827'
};

const SalesmenManagement = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [signupRequests, setSignupRequests] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [deletingSalesman, setDeletingSalesman] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const { currentUser } = useAuth();

  // Fetch all data
  useEffect(() => {
    const unsubscribeSalesmen = onSnapshot(collection(db, 'salesmen'), (snapshot) => {
      const salesmenData = [];
      snapshot.forEach((doc) => {
        salesmenData.push({ id: doc.id, ...doc.data() });
      });
      setSalesmen(salesmenData);
    });

    const unsubscribeRequests = onSnapshot(
      query(collection(db, 'signup_requests'), where('status', '==', 'pending')),
      (snapshot) => {
        const requestsData = [];
        snapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() });
        });
        setSignupRequests(requestsData);
      }
    );

    const unsubscribeInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const inquiriesData = [];
      snapshot.forEach((doc) => {
        inquiriesData.push({ id: doc.id, ...doc.data() });
      });
      setInquiries(inquiriesData);
      setLoading(false);
    });

    return () => {
      unsubscribeSalesmen();
      unsubscribeRequests();
      unsubscribeInquiries();
    };
  }, []);

  // Toggle isActive status
  const toggleActiveStatus = async (salesmanId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'salesmen', salesmanId), {
        isActive: !currentStatus
      });
      setStatus({ 
        type: 'success', 
        message: `Salesman ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update status' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  // Delete salesman completely (from both Firestore and Firebase Auth)
  const deleteSalesman = async () => {
    if (!deletingSalesman) return;
    
    try {
      setStatus({ type: 'processing', message: 'Deleting user from system...' });
      
      // Call the Cloud Function to delete user from both Firestore and Firebase Auth
      const response = await fetch('https://us-central1-astra-c196c.cloudfunctions.net/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: deletingSalesman.email,
          salesmanId: deletingSalesman.id,
          adminEmail: currentUser.email
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ 
          type: 'success', 
          message: result.message || 'User has been completely removed from the system'
        });
        
        // Log the deletion details for admin reference
        console.log('Deletion completed:', {
          deletedFromFirestore: result.deletedFromFirestore,
          deletedFromAuth: result.deletedFromAuth,
          authNote: result.authNote
        });
        
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
      
      setShowDeleteModal(false);
      setDeletingSalesman(null);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      
    } catch (error) {
      console.error('Delete user error:', error);
      setStatus({ 
        type: 'error', 
        message: error.message || 'Failed to delete user completely'
      });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  // Get inquiry stats for a salesman
  const getSalesmanStats = (salesmanEmail) => {
    const salesmanInquiries = inquiries.filter(
      inquiry => inquiry.assignedTo?.email === salesmanEmail
    );
    
    const totalInquiries = salesmanInquiries.length;
    // Fix: Check for the actual status values used in Firestore
    const followedUp = salesmanInquiries.filter(
      inquiry => inquiry.status === 'sudah-follow-up' || 
                inquiry.status === 'followed_up' || 
                inquiry.status === 'completed' || 
                inquiry.status === 'done' ||
                inquiry.followUpStatus === 'completed' ||
                inquiry.followUpCount > 0
    ).length;
    const pending = salesmanInquiries.filter(
      inquiry => inquiry.status === 'assigned' || 
                inquiry.status === 'pending' ||
                inquiry.status === 'new' ||
                inquiry.subStatus === 'pending' ||
                (!inquiry.status && !inquiry.followUpCount)
    ).length;

    return { totalInquiries, followedUp, pending };
  };

  // Handle signup approval
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
      
      // Send password reset email
      await sendPasswordResetEmail(auth, request.email);
      
      // Send approval notification via EmailJS
      try {
        emailjs.init('1Wrr3tO9webkKwslK');
        await emailjs.send(
          'service_6p22bud',
          'template_blc4wpk',
          {
            email: request.email,
            login_url: window.location.origin + "/login",
            to_email: request.email
          }
        );
      } catch (emailError) {
        console.error('Failed to send approval notification via EmailJS:', emailError);
      }
      
      // Update the signup request status
      await updateDoc(doc(db, 'signup_requests', request.id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
      
      setStatus({
        type: 'success',
        message: `Successfully approved ${request.email}. A password reset email has been sent.`
      });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (error) {
      console.error('Error approving request:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to approve request'
      });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  // Handle signup rejection
  const handleReject = async (request) => {
    if (!window.confirm(`Reject signup request for ${request.email}?`)) {
      return;
    }
    
    try {
      setStatus({ type: 'processing', message: 'Processing rejection...' });
      
      // Update the signup request status to rejected
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
      
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to reject request'
      });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  // Show salesman details
  const showSalesmanDetail = (salesman) => {
    setSelectedSalesman(salesman);
    setShowDetailModal(true);
  };

  // Format WhatsApp number
  const formatWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    // If starts with 0, replace with 62 (Indonesia country code)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    // If doesn't start with 62, add it
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" style={{ backgroundColor: COLORS.gray100, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        {/* Mobile: Title and Button in first row, Total Inquiry box in second row */}
        <div className="md:hidden w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: COLORS.gray900 }}>
              Manajemen Sales
            </h1>
            
            {/* Approve Signup Button with Badge */}
            <button
              onClick={() => setShowSignupModal(true)}
              className="relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm shadow-sm transform hover:scale-105 active:scale-95 hover:shadow-lg"
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.white
              }}
            >
              Approve Signup Requests
              {signupRequests.length > 0 && (
                <span 
                  className="absolute -top-2 -right-2 rounded-full text-xs font-bold min-w-[20px] h-5 flex items-center justify-center"
                  style={{ backgroundColor: COLORS.warning, color: COLORS.white }}
                >
                  {signupRequests.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Total Inquiry Count Box - Mobile Only */}
          <div 
            className="w-full p-6 rounded-xl shadow-lg border-l-4"
            style={{ 
              backgroundColor: COLORS.white, 
              borderLeftColor: COLORS.primary 
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: COLORS.gray900 }}>
                  Total Inquiry
                </h3>
                <p className="text-sm" style={{ color: COLORS.gray600 }}>
                  Semua inquiry yang masuk
                </p>
              </div>
              <div className="text-right">
                <div 
                  className="text-3xl font-bold"
                  style={{ color: COLORS.primary }}
                >
                  {inquiries.length}
                </div>
                <div className="text-xs" style={{ color: COLORS.gray500 }}>
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop: Original layout */}
        <h1 className="hidden md:block text-2xl font-bold" style={{ color: COLORS.gray900 }}>
          Manajemen Sales
        </h1>
        
        {/* Desktop Approve Signup Button */}
        <button
          onClick={() => setShowSignupModal(true)}
          className="hidden md:block relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm shadow-sm transform hover:scale-105 active:scale-95 hover:shadow-lg"
          style={{
            backgroundColor: COLORS.primary,
            color: COLORS.white
          }}
        >
          Approve Signup Requests
          {signupRequests.length > 0 && (
            <span 
              className="absolute -top-2 -right-2 rounded-full text-xs font-bold min-w-[20px] h-5 flex items-center justify-center"
              style={{ backgroundColor: COLORS.warning, color: COLORS.white }}
            >
              {signupRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Status Message */}
      {status.message && (
        <div 
          className={`mb-4 p-4 rounded-md ${
            status.type === 'success' ? 'bg-green-100 text-green-800' : 
            status.type === 'error' ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {salesmen.map((salesman) => {
          return (
            <div 
              key={salesman.id} 
              className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-[1.01] min-h-[100px]"
              style={{ border: `1px solid ${COLORS.gray200}` }}
            >
              {/* Red accent bar on the left */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: COLORS.primary }}
              ></div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  {salesman.photoURL ? (
                    <img 
                      src={salesman.photoURL} 
                      alt={`${salesman.firstName} ${salesman.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: COLORS.gray500 }}
                    >
                      {salesman.firstName?.[0]}{salesman.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: COLORS.gray900 }}>
                      {salesman.firstName} {salesman.lastName}
                    </h3>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        salesman.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {salesman.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => showSalesmanDetail(salesman)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: COLORS.white 
                  }}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead style={{ backgroundColor: COLORS.gray50 }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.gray500 }}>
                Salesman
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.gray500 }}>
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.gray500 }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.gray500 }}>
                Inquiries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.gray500 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ divideColor: COLORS.gray200 }}>
            {salesmen.map((salesman) => {
              const stats = getSalesmanStats(salesman.email);
              return (
                <tr key={salesman.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {salesman.photoURL ? (
                        <img 
                          src={salesman.photoURL} 
                          alt={`${salesman.firstName} ${salesman.lastName}`}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3"
                          style={{ backgroundColor: COLORS.gray500 }}
                        >
                          {salesman.firstName?.[0]}{salesman.lastName?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium" style={{ color: COLORS.gray900 }}>
                          {salesman.firstName} {salesman.lastName}
                        </div>
                        <div className="text-sm" style={{ color: COLORS.gray500 }}>
                          ID: {salesman.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: COLORS.gray900 }}>
                      {salesman.email}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.gray500 }}>
                      {salesman.contactNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          salesman.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {salesman.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs" style={{ color: COLORS.gray500 }}>
                        WhatsApp: {salesman.isActive ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-4 text-sm">
                      <span style={{ color: COLORS.primary }}>
                        Total: <strong>{stats.totalInquiries}</strong>
                      </span>
                      <span style={{ color: COLORS.success }}>
                        Done: <strong>{stats.followedUp}</strong>
                      </span>
                      <span style={{ color: COLORS.warning }}>
                        Pending: <strong>{stats.pending}</strong>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showSalesmanDetail(salesman)}
                        className="px-3 py-1 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
                        style={{ 
                          backgroundColor: COLORS.gray200, 
                          color: COLORS.gray800 
                        }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => toggleActiveStatus(salesman.id, salesman.isActive)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                          salesman.isActive 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {salesman.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setDeletingSalesman(salesman);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSalesman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: COLORS.gray900 }}>
                  Salesman Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  {selectedSalesman.photoURL ? (
                    <img 
                      src={selectedSalesman.photoURL} 
                      alt={`${selectedSalesman.firstName} ${selectedSalesman.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
                      style={{ backgroundColor: COLORS.gray500 }}
                    >
                      {selectedSalesman.firstName?.[0]}{selectedSalesman.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: COLORS.gray900 }}>
                      {selectedSalesman.firstName} {selectedSalesman.lastName}
                    </h3>
                    <p style={{ color: COLORS.gray600 }}>
                      {selectedSalesman.email}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: COLORS.gray900 }}>
                    Contact Information
                  </h4>
                  <p><strong>Phone:</strong> {selectedSalesman.contactNumber}</p>
                  <p><strong>Address:</strong> {selectedSalesman.address}</p>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: COLORS.gray900 }}>
                    Performance Statistics
                  </h4>
                  {(() => {
                    const stats = getSalesmanStats(selectedSalesman.email);
                    return (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.gray100 }}>
                          <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                            {stats.totalInquiries}
                          </div>
                          <div className="text-sm" style={{ color: COLORS.gray600 }}>
                            Total Inquiries
                          </div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.gray100 }}>
                          <div className="text-2xl font-bold" style={{ color: COLORS.success }}>
                            {stats.followedUp}
                          </div>
                          <div className="text-sm" style={{ color: COLORS.gray600 }}>
                            Followed Up
                          </div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.gray100 }}>
                          <div className="text-2xl font-bold" style={{ color: COLORS.warning }}>
                            {stats.pending}
                          </div>
                          <div className="text-sm" style={{ color: COLORS.gray600 }}>
                            Pending
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: COLORS.gray900 }}>
                    Status
                  </h4>
                  <div className="flex items-center gap-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedSalesman.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedSalesman.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm" style={{ color: COLORS.gray600 }}>
                      WhatsApp Notifications: {selectedSalesman.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Button */}
                {selectedSalesman.contactNumber && (
                  <div className="pt-4">
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(selectedSalesman.contactNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-md mb-4"
                      style={{ backgroundColor: '#25D366', color: 'white' }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Chat di WhatsApp
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      toggleActiveStatus(selectedSalesman.id, selectedSalesman.isActive);
                      setShowDetailModal(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedSalesman.isActive 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {selectedSalesman.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSalesman(selectedSalesman);
                      setShowDetailModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingSalesman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-600">Delete Salesman</h2>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>{deletingSalesman.firstName} {deletingSalesman.lastName}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">
                  <strong>Warning:</strong> This will permanently remove the salesman from the entire system:
                </p>
                <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                  <li>Their account will be deleted from the database</li>
                  <li>Their login access will be completely revoked</li>
                  <li>They will no longer receive any notifications</li>
                  <li>All their inquiry assignments will remain for record keeping</li>
                  <li><strong>This action cannot be undone</strong></li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingSalesman(null);
                }}
                className="flex-1 px-4 py-2 rounded-md font-medium transition-colors"
                style={{ 
                  backgroundColor: COLORS.gray200, 
                  color: COLORS.gray800 
                }}
              >
                Cancel
              </button>
              <button
                onClick={deleteSalesman}
                className="flex-1 px-4 py-2 rounded-md font-medium transition-colors bg-red-600 text-white hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Requests Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: COLORS.gray900 }}>
                  Pending Signup Requests ({signupRequests.length})
                </h2>
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {signupRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: COLORS.gray500 }}>No pending signup requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {signupRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="border rounded-lg p-4"
                      style={{ borderColor: COLORS.gray200 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold" style={{ color: COLORS.gray900 }}>
                            {request.firstName} {request.lastName}
                          </h3>
                          <p style={{ color: COLORS.gray600 }}>{request.email}</p>
                          <p className="text-sm" style={{ color: COLORS.gray500 }}>
                            Phone: {request.contactNumber}
                          </p>
                          <p className="text-sm" style={{ color: COLORS.gray500 }}>
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={status.type === 'processing'}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 transform hover:scale-105 active:scale-95 hover:shadow-md"
                            style={{
                              backgroundColor: COLORS.success,
                              color: COLORS.white
                            }}
                          >
                            {status.type === 'processing' ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            disabled={status.type === 'processing'}
                            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 transform hover:scale-105 active:scale-95 hover:shadow-md"
                            style={{
                              backgroundColor: COLORS.danger,
                              color: COLORS.white
                            }}
                          >
                            {status.type === 'processing' ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmenManagement;
