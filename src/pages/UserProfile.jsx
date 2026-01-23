import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Phone, Package, Calendar, MapPin, Clock } from 'lucide-react';
import Toast from '../components/Toast';

const UserProfile = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
    });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name || '',
                phone: currentUser.phone || ''
            });
            fetchOrders();
        }
    }, [currentUser]);

    const fetchOrders = async () => {
        try {
            const q = query(
                collection(db, "orders"),
                where("userId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const ordersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort by date desc
            ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                name: profileData.name,
                phone: profileData.phone
            });
            setIsEditing(false);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ message: 'Failed to update profile.', type: 'error' });
        }
    };

    if (!currentUser) return <div className="text-white text-center pt-20">Please log in.</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Header Card */}
                <div className="bg-slate-800 rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                    <div className="flex flex-col md:flex-row items-center gap-6 z-10 relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-4 border-slate-700 shadow-xl">
                            <span className="text-3xl font-bold text-white">{currentUser.email[0].toUpperCase()}</span>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            {isEditing ? (
                                <div className="space-y-3 max-w-sm">
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Display Name"
                                    />
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-white">{currentUser.name || 'User'}</h1>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-slate-400 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-4 w-4" />
                                            {currentUser.email}
                                        </div>
                                        {currentUser.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-4 w-4" />
                                                {currentUser.phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {currentUser.role === 'restaurant' ? 'Restaurant Owner' : 'Customer'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium border border-white/5 transition-all"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order History Section */}
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6 text-primary" />
                        Order History
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="grid gap-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-slate-800 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-slate-500 text-sm flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-white">Order #{order.id.slice(-6)}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-400">${order.total?.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500">{order.items?.length} items</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-700 pt-4 mt-4">
                                        <div className="flex flex-wrap gap-2">
                                            {order.items?.map((item, idx) => (
                                                <span key={idx} className="text-sm text-slate-300 bg-slate-900 px-3 py-1 rounded-lg">
                                                    {item.count}x {item.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-dashed border-slate-700">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="h-8 w-8 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-300 mb-1">No orders yet</h3>
                            <p className="text-slate-500">Looks like you haven't ordered anything yet.</p>
                        </div>
                    )}
                </div>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default UserProfile;
