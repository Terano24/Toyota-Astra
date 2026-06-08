import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';

function Signup() {
  const { user } = useAuth();
  const [approved, setApproved] = useState(null); // null=loading, false=not approved, true=approved
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    // Check if user is approved in signup_requests
    async function checkApproval() {
      const q = query(
        collection(db, 'signup_requests'),
        where('email', '==', user.email),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setApproved(false);
        setTimeout(() => navigate('/login', { replace: true }), 1000);
        return;
      }
      // Now check if user is already registered in Firebase Auth
      try {
        const { getAuth, fetchSignInMethodsForEmail } = await import('firebase/auth');
        const auth = getAuth();
        const methods = await fetchSignInMethodsForEmail(auth, user.email);
        if (methods && methods.length > 0) {
          // User already registered!
          setApproved(false);
          setTimeout(() => navigate('/login', { replace: true }), 1000);
          return;
        }
      } catch (e) {
        // ignore
      }
      setApproved(true);
    }
    checkApproval();
  }, [user, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (approved === null) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="text-gray-600">Checking approval...</div>
      </div>
    );
  }
  if (!approved) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="text-red-600">You are not approved to sign up. Redirecting...</div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded-lg" value={email} disabled />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Password</label>
            <input type="password" className="w-full px-3 py-2 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Confirm Password</label>
            <input type="password" className="w-full px-3 py-2 border rounded-lg" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          {error && <div className="text-red-600 mb-3 text-center">{error}</div>}
          {success && <div className="text-green-600 mb-3 text-center">Signup successful! Redirecting to login...</div>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-2" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
