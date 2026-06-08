import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { toast } from 'react-toastify';


const SalesmanProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: '',
    employeeId: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const profileRef = doc(db, 'salesmen', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setFormData(prev => ({
            ...prev,
            ...profileSnap.data(),
            email: currentUser.email // Always use the email from auth
          }));
        } else {
          // If no profile exists, just set the email
          setFormData(prev => ({
            ...prev,
            email: currentUser.email
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const profileRef = doc(db, 'salesmen', currentUser.uid);
      await setDoc(profileRef, {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 md:py-12 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Left: Profile Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={/* Reset password logic here */() => {}}
              className="px-5 py-2 rounded-lg border border-red-500 text-red-500 bg-white hover:bg-gray-100 font-semibold transition"
            >
              Reset Password
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow"
            >
              Save
            </button>
          </div>
        </form>
        {/* Right: Profile Picture & Name */}
        <div className="flex flex-col items-center w-full">
          {/* Upload Image Area */}
          <div className="w-44 h-44 md:w-56 md:h-56 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 relative mb-4 overflow-hidden">
            {/* Profile picture or placeholder */}
            {formData.photoURL ? (
              <img src={formData.photoURL} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-400 flex flex-col items-center">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5-4.5 2.015-4.5 4.5 2.015 4.5 4.5 4.5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5"/>
                </svg>
                Upload Image
              </span>
            )}
            {/* Upload button overlay (optional, can be implemented for actual upload) */}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          {/* Name Display */}
          <div className="text-lg font-semibold text-gray-900 mb-6">{formData.firstName || 'First Name'}</div>
          {/* Notification Area */}
          {/* Show "All changes are saved" dynamically */}
          {/** Example static notification below. Replace with dynamic logic as needed. **/}
          <div className="flex items-center space-x-2 bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 text-sm">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>All changes are saved</span>
          </div>

          {/* WhatsApp Opt-in Section */}
          <div className="w-full mt-8 p-6 bg-gray-800 text-white rounded-xl flex flex-col items-center text-center">
            <h3 className="text-lg font-bold mb-2">Enable WhatsApp Notifications</h3>
            <p className="text-sm text-gray-300 mb-4">Scan this code with your phone's camera to join our WhatsApp channel and receive new lead alerts.</p>
            <div className="p-2 bg-white rounded-lg">
                <img 
                    src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FAuto%20Notifier.png?alt=media&token=b38830fc-b35b-48a0-944d-6626e7008611"
                    alt="WhatsApp Opt-in QR Code"
                    className="w-36 h-36"
                    style={{ filter: 'invert(1)' }}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesmanProfile;
