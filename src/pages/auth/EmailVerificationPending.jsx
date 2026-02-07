import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import Toast from '../../components/Toast';

const EmailVerificationPending = () => {
    const { currentUser, resendVerificationEmail, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser?.emailVerified) {
            navigate('/');
        }

        // Poll for verification status change (optional, but good UX)
        const interval = setInterval(async () => {
            await currentUser?.reload();
            if (currentUser?.emailVerified) {
                navigate('/');
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [currentUser, navigate]);


    const handleResend = async () => {
        setLoading(true);
        try {
            await resendVerificationEmail();
            setToast({ message: 'Verification email sent! Please check your inbox.', type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ message: 'Failed to send email. Please try again later.', type: 'error' });
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center items-center px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5 text-center space-y-6">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>

                <p className="text-gray-600 dark:text-slate-300">
                    We've sent a verification email to <span className="font-semibold text-gray-900 dark:text-white">{currentUser.email}</span>.
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                    Please click the link in the email to verify your account and access the application.
                </p>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-red-600 focus:ring-4 focus:ring-red-500/20 disabled:opacity-70 transition-all shadow-lg shadow-red-500/20"
                    >
                        {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                        {loading ? 'Sending...' : 'Resend Verification Email'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EmailVerificationPending;
