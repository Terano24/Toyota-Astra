import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    // Verify the oobCode is valid and get the user's email
    const auth = getAuth();
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => setEmail(email))
        .catch(() => {
          setError('Invalid or expired reset link. Please request a new one.');
        });
    } else {
      setError('Invalid reset link.');
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Reset Password</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {success ? (
          <div className="text-green-500 mb-4 text-center">
            Password reset successful! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {email && (
              <div className="mb-2 text-gray-300 text-center text-xs">Resetting password for: {email}</div>
            )}
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-lg bg-gray-700 text-white"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-lg bg-gray-700 text-white"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-2"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
