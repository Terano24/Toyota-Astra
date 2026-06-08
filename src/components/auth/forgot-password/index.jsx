import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';

const ForgotPassword = () => {
    const { userLoggedIn, doSendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSending) return;

        setIsSending(true);
        setErrorMessage('');

        try {
            await doSendPasswordResetEmail(email);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("ForgotPassword: Error sending reset email:", error);
            setErrorMessage('Gagal mengirim email reset. Silakan coba lagi.');
        }

        setIsSending(false);
    };

    return (
        <div 
            className="min-h-screen w-full flex flex-col items-center justify-center bg-center bg-cover p-4"
            style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FLogin-BG.png?alt=media&token=2f164c6b-4e37-4216-8445-49cc8c99b861')" }}
        >
            {userLoggedIn && (<Navigate to={'/encrypted-dashboard'} replace={true} />)}

            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <h3 className="text-white text-2xl font-semibold">Lupa Kata Sandi</h3>
                        <p className="text-gray-300 mt-1">Masukkan email Anda untuk reset kata sandi</p>
                    </div>
                    
                    <form onSubmit={onSubmit} className="space-y-5">
                        {errorMessage && (
                            <div className="text-sm text-center p-2 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                                {errorMessage}
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-200 block mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete='email'
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
                                placeholder="contoh@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`w-full px-4 py-3 text-white font-bold rounded-lg transition-transform duration-300 ${isSending ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
                        >
                            {isSending ? 'Mengirim...' : 'Kirim Link Reset'}
                        </button>
                    </form>
                    <p className="text-center text-sm mt-6">
                        <Link to={'/login'} className="text-gray-300 hover:text-white hover:underline font-semibold">Kembali ke Login</Link>
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
                        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-green-500/20 rounded-full">
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-white">Email Terkirim!</h2>
                        <p className="text-gray-300 mb-6">Link untuk reset kata sandi telah dikirim. Silakan periksa inbox atau folder spam email Anda.</p>
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-2.5 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ForgotPassword
