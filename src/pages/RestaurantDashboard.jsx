import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ChefHat, TrendingUp, ShoppingBag, MapPin, ArrowRight, Utensils, Clock, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

const RestaurantDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        totalOrders: 0,
        menuItemsCount: 0
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        if (!currentUser) return;

        // 1. Fetch Stats for Revenue and Total Orders (Consistent with Income Page)
        const qStats = query(
            collection(db, "restaurant_stats"),
            where("restaurantId", "==", currentUser.uid)
        );

        const unsubscribeStats = onSnapshot(qStats, (snapshot) => {
            let totalRev = 0;
            let totalOrd = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalRev += (data.revenue || 0);
                totalOrd += (data.ordersCount || 0);
            });

            setStats(prev => ({
                ...prev,
                totalRevenue: totalRev,
                totalOrders: totalOrd
            }));
        });

        // 2. Fetch Active Orders (Real-time pending orders)
        // Active: Not Completed, Not Cancelled
        const qActiveOrders = query(
            collection(db, "orders"),
            where("restaurantId", "==", currentUser.uid),
            where("status", "in", ['Pending', 'Preparing', 'Ready', 'On the way', 'Arrived'])
        );

        const unsubscribeActive = onSnapshot(qActiveOrders, (snapshot) => {
            setStats(prev => ({
                ...prev,
                activeOrders: snapshot.size
            }));
        });

        // Fetch Menu Items count
        const qMenu = query(
            collection(db, "menuItems"),
            where("restaurantId", "==", currentUser.uid)
        );

        const unsubscribeMenu = onSnapshot(qMenu, (snapshot) => {
            setStats(prev => ({
                ...prev,
                menuItemsCount: snapshot.size
            }));
        });

        return () => {
            clearInterval(timer);
            unsubscribeStats();
            unsubscribeActive();
            unsubscribeMenu();
        };
    }, [currentUser]);

    const greeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const toggleStoreStatus = async () => {
        if (!currentUser) return;
        try {
            const newStatus = !currentUser.isOpen;
            await updateDoc(doc(db, "users", currentUser.uid), {
                isOpen: newStatus
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="pb-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                            <Clock className="w-4 h-4" />
                            <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            {greeting()}, <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                                {currentUser?.name || 'Chef'}
                            </span>
                        </h1>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Store Status</p>
                        <button
                            onClick={toggleStoreStatus}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${currentUser?.isOpen !== false
                                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30'
                                : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30'
                                }`}
                        >
                            <span className="relative flex h-3 w-3">
                                {currentUser?.isOpen !== false && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${currentUser?.isOpen !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </span>
                            <span className="font-bold text-sm">
                                {currentUser?.isOpen !== false ? 'Open to Orders' : 'Closed Now'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Ledger */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Revenue Card */}
                    <Link to="/dashboard/income" className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-2xl border border-green-200 dark:border-green-500/30">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg">LIFETIME</span>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    ₹{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                        </div>
                    </Link>

                    {/* Active Orders Card */}
                    <div className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl border border-blue-200 dark:border-blue-500/30">
                                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                {stats.activeOrders > 0 && (
                                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        LIVE
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Active Orders</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {stats.activeOrders}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items Card */}
                    <div className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-2xl border border-orange-200 dark:border-orange-500/30">
                                    <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Menu Items</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {stats.menuItemsCount}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-2xl border border-purple-200 dark:border-purple-500/30">
                                    <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Total Orders</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {stats.totalOrders}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-primary rounded-full"></span>
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Menu Management */}
                    <Link to="/dashboard/menu" className="group relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-auto md:h-64 flex flex-col justify-end p-8 transition-transform hover:scale-[1.02]">
                        <img
                            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                            alt="Menu"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 text-white">
                                <Utensils className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Manage Menu</h3>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">Add new dishes, update prices, or edit offerings.</p>
                            <span className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 group-hover:bg-primary group-hover:border-primary transition-colors">
                                Go to Menu <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>

                    {/* Orders */}
                    <Link to="/dashboard/orders" className="group relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-auto md:h-64 flex flex-col justify-end p-8 transition-transform hover:scale-[1.02]">
                        <img
                            src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80"
                            alt="Orders"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 text-white">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">View Orders</h3>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">Track incoming orders and manage deliveries.</p>
                            <span className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                                Track Orders <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>

                    {/* Map */}
                    <div className="group relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-auto md:h-64 flex flex-col justify-end transition-transform hover:shadow-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {/* Interactive Map Background */}
                        <div className="absolute inset-0 z-0">
                            <MapComponent
                                center={currentUser?.location}
                                zoom={15}
                                markers={currentUser?.location ? [{ position: currentUser.location, popup: currentUser.name }] : []}
                            />
                        </div>

                        {/* Overlay Gradient (lighter to see map) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10" />

                        {/* Content Overlay */}
                        <div className="relative z-20 p-8 pointer-events-none">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 text-white">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Live Map</h3>
                                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 max-w-[80%]">
                                        {currentUser?.location ? "Location active on map." : "Set your location to accept orders."}
                                    </p>
                                </div>

                                <Link
                                    to="/dashboard/map"
                                    className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 transition-colors pointer-events-auto shadow-lg"
                                >
                                    Full Screen <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
