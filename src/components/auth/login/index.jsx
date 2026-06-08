import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { sendSignupRequest } from './signupRequest';

const Login = () => {
    const { userLoggedIn, loading: authLoading, doSignInWithEmailAndPassword, doSignOut, userRole } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Signup Modal State
    const [showSignup, setShowSignup] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');
    const [signupMessage, setSignupMessage] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [signupError, setSignupError] = useState('');
    const [notification, setNotification] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);

    useEffect(() => {
        if (authLoading) {
            return; // Wait for auth processing to complete
        }

        if (userLoggedIn && userRole) {
            if (userRole === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else if (userRole === 'salesman') {
                navigate('/encrypted-dashboard', { replace: true });
            } else if (userRole === 'unauthorized_admin') {
                setErrorMessage('Akun Anda tidak memiliki hak akses sebagai admin.');
                doSignOut(); // Sign out the user after showing the message
            }
        }
    }, [userLoggedIn, userRole, authLoading, navigate, doSignOut]);







    // Redirect if already logged in


    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;

        setIsSigningIn(true);
        setErrorMessage('');

        try {
            await doSignInWithEmailAndPassword(email, password, false);
        } catch (err) {
            console.error("Login Error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setErrorMessage('Email atau kata sandi yang Anda masukkan salah.');
            } else {
                setErrorMessage('Terjadi kesalahan saat mencoba login.');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleSignupRequest = async (e) => {
        e.preventDefault();
        if (signupLoading) return;

        setSignupLoading(true);
        setSignupError('');

        try {
            await sendSignupRequest(signupEmail, signupMessage);
            setNotification('Permintaan pendaftaran Anda telah terkirim. Mohon tunggu persetujuan admin.');
        } catch (error) {
            setSignupError(error.message);
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div 
            className="h-screen w-full flex flex-col items-center justify-center bg-center bg-cover bg-fixed p-4 overflow-hidden"
            style={{ 
                backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FLogin-BG.png?alt=media&token=2f164c6b-4e37-4216-8445-49cc8c99b861')",
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >


            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-white">Selamat Datang</h2>
                        <p className="text-gray-300 mt-1">Login untuk melanjutkan ke dashboard</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
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

                        <div>
                            <label className="text-sm font-medium text-gray-200 block mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete='current-password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-12 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>



                        {errorMessage && (
                            <span className='text-red-400 font-semibold text-center block'>{errorMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full px-4 py-3 text-white font-bold rounded-lg transition-transform duration-300 ${isSigningIn ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
                        >
                            {isSigningIn ? 'Mencoba Masuk...' : 'Login'}
                        </button>
                    </form>

                    <div className="text-center text-sm mt-6">
                        <Link to={'/forgot-password'} className="text-gray-300 hover:text-white hover:underline font-semibold">
                            Lupa Kata Sandi?
                        </Link>
                    </div>
                </div>
            </div>

            {/* Signup Button */}
            <div className="absolute bottom-6 right-6 z-10">
                <button 
                    className="bg-white/20 backdrop-blur-lg text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg border border-white/30 hover:bg-white/30 transition-colors duration-300"
                    onClick={() => setShowSignup(true)}
                >
                    Minta Akses Pendaftaran
                </button>
            </div>

            {/* Signup Modal */}
            {showSignup && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-white">{signupSuccess ? 'Pendaftaran Disetujui' : 'Minta Akses Pendaftaran'}</h2>
                        {signupSuccess ? (
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <div className="text-green-400 text-center">Permintaan Anda telah disetujui. Anda sekarang dapat melanjutkan ke halaman pendaftaran.</div>
                                <button
                                    className="w-full py-2.5 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    onClick={() => navigate('/signup')}
                                >
                                    Lanjutkan ke Pendaftaran
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-yellow-400 mb-4 text-center text-sm">Akun Anda perlu disetujui oleh admin sebelum Anda dapat mendaftar.</p>
                                <form onSubmit={handleSignupRequest} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Email</label>
                                        <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Pesan (Opsional)</label>
                                        <textarea value={signupMessage} onChange={e => setSignupMessage(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500" />
                                    </div>
                                    {signupError && <div className="text-red-400 text-center">{signupError}</div>}
                                    <button type="submit" disabled={signupLoading} className={`w-full py-2.5 px-4 text-white font-semibold rounded-lg ${signupLoading ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'}`}>{signupLoading ? 'Mengirim...' : 'Kirim Permintaan'}</button>
                                </form>
                            </>
                        )}
                        <button
                            className="mt-4 w-full py-2.5 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 text-white font-semibold"
                            onClick={() => {
                                setShowSignup(false);
                                setSignupSuccess(false);
                                setSignupError('');
                                setNotification('');
                            }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-6 right-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
                    {notification}
                    <button className="ml-4 text-green-900 font-bold" onClick={() => setNotification('')}>×</button>
                </div>
            )}
        </div>
    );
};

export default Login;