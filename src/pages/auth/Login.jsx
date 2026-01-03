import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Failed to log in with Google.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-3 rounded-xl">
                        <ChefHat className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to SmartFood
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
                    Or{' '}
                    <Link to="/register" className="font-medium text-primary hover:text-red-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-slate-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
