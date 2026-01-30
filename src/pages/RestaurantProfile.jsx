import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Store, Save, Image as ImageIcon, FileText, MapPin } from 'lucide-react';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const RestaurantProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cuisine: 'Multi-Cuisine',
        image: '',
        phone: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                description: currentUser.description || '',
                cuisine: currentUser.cuisine || 'Multi-Cuisine',
                image: currentUser.image || '',
                phone: currentUser.phone || ''
            });
        }
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                ...formData
            });
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ message: 'Failed to update profile.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-3 rounded-xl">
                            <Store className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Restaurant Profile</h1>
                            <p className="text-gray-500 dark:text-slate-400">Manage your public listing</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Preview */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Live Preview</h2>
                            <div className="bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                                <div className="h-32 bg-slate-200 dark:bg-slate-700 relative">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                                            <ImageIcon className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{formData.name || 'Restaurant Name'}</h3>
                                    <p className="text-xs text-primary font-medium mb-2">{formData.cuisine}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{formData.description || 'Your description will appear here.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                Location
                            </h2>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Update your precise GPS location to help customers find you.</p>
                            <button
                                onClick={() => navigate('/dashboard/map')}
                                className="w-full py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-xl transition-colors text-sm font-medium"
                            >
                                Manage Location
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Key Details Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Restaurant Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g. Burger King"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Cuisine Type</label>
                                    <select
                                        value={formData.cuisine}
                                        onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="Multi-Cuisine">Multi-Cuisine</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Mexican">Mexican</option>
                                        <option value="Fast Food">Fast Food</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary min-h-[120px]"
                                    placeholder="Tell customers about your restaurant..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Cover Image URL</label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                                    placeholder="https://..."
                                />
                                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">Paste a direct link to an image to be displayed on your restaurant card.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default RestaurantProfile;
