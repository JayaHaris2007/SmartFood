import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('user'); // Default to 'user'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return setError('Password must be at least 8 characters long and include at least one uppercase letter and one number.');
        }

        try {
            setError('');
            setLoading(true);
            setLoading(true);
            await register(email, password, role, name, phoneNumber); // Pass selected role and new fields
            navigate('/');
        } catch (err) {
            setError('Failed to create an account.');
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
            setError('Failed to sign up with Google.');
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
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-red-500">
                        Sign in
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
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                I am a...
                            </label>
                            <div className="mt-1 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('user')}
                                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${role === 'user'
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    Customer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('restaurant')}
                                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${role === 'restaurant'
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    Restaurant Owner
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                {role === 'restaurant' ? 'Restaurant Name' : 'Full Name'}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                Phone Number
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white sm:text-sm"
                                />
                            </div>
                        </div>

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
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {loading ? 'Creating account...' : 'Create Account'}
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
                                Sign up with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
