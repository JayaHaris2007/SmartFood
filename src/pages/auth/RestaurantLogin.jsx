import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Lock } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const RestaurantLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const userCredential = await login(email, password);

            // Strict Check for Restaurant Role
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists() && userDoc.data().role === 'restaurant') {
                navigate('/dashboard');
            } else {
                setError('Access Denied. Not a restaurant account.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to log in to Restaurant Portal.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20">
                        <ChefHat className="h-12 w-12 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-white">
                    Restaurant Portal
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    Staff Access Only
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 text-red-400 text-sm p-4 rounded-lg flex items-center gap-2 border border-red-500/20">
                                <Lock className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Staff ID (Email)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                                    placeholder="admin@smartfood.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
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
                                    className="appearance-none block w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-primary hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all uppercase tracking-wide"
                            >
                                {loading ? 'Authenticating...' : 'Access Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestaurantLogin;
