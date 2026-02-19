import React from 'react';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, CheckCircle, XCircle, FileText } from 'lucide-react';
import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ActiveOrderTracker = () => {
    const { activeOrder, moveCloser, clearOrder, cancelOrder, updateOrderLocation, dismissOrder } = useOrder();
    const navigate = useNavigate();
    const [restaurantLocation, setRestaurantLocation] = React.useState(null);
    const [loadingLocation, setLoadingLocation] = React.useState(false);
    const [usingLiveGPS, setUsingLiveGPS] = React.useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

    // Calculate distance between two coordinates in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1)); // Return rounded to 1 decimal
    };

    React.useEffect(() => {
        const fetchRestaurantLocation = async () => {
            setLoadingLocation(true);
            try {
                try {
                    if (activeOrder.restaurantId) {
                        const docRef = doc(db, "users", activeOrder.restaurantId);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists() && docSnap.data().location) {
                            setRestaurantLocation(docSnap.data().location);
                        } else {
                            setRestaurantLocation(null);
                        }
                    } else {
                        setRestaurantLocation(null);
                    }
                } catch (err) {
                    console.error("ActiveOrderTracker Error:", err);
                } finally {
                    setLoadingLocation(false);
                }
            } catch (err) {
                console.error("ActiveOrderTracker Error:", err);
            } finally {
                setLoadingLocation(false);
            }
        };

        if (activeOrder) {
            fetchRestaurantLocation();
        }
    }, [activeOrder]);

    // Live GPS Tracking
    React.useEffect(() => {
        let watchId;
        if (activeOrder && activeOrder.status !== 'Arrived' && activeOrder.status !== 'Completed' && activeOrder.status !== 'Cancelled' && restaurantLocation) {
            if ("geolocation" in navigator) {
                setUsingLiveGPS(true);
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const userLat = position.coords.latitude;
                        const userLng = position.coords.longitude;

                        const dist = calculateDistance(
                            userLat, userLng,
                            restaurantLocation.lat, restaurantLocation.lng
                        );

                        // Update order with real distance
                        // Use a simple debounce or threshold in context to avoid spamming writes
                        updateOrderLocation(dist);
                    },
                    (error) => {
                        console.error("Error watching position:", error);
                        setUsingLiveGPS(false);
                    },
                    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
                );
            }
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [activeOrder, restaurantLocation, updateOrderLocation]);

    if (!activeOrder) return null;

    const progress = Math.max(0, Math.min(100, ((5 - activeOrder.distanceKm) / 5) * 100));

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[5000] w-[90%] max-w-md animate-slide-up">
            {/* Glassmorphic Container */}
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-2xl text-gray-900 dark:text-white overflow-hidden relative">

                {/* Background Progress Bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gray-200 dark:bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between mb-6 mt-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shadow-lg border border-white/10 ${activeOrder.status === 'Arrived' ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                            {activeOrder.status === 'Arrived' ? <CheckCircle className="h-6 w-6" /> : <Navigation className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400">
                                    {activeOrder.status === 'Arrived' ? 'Arrived!' : activeOrder.isApproaching ? 'Approaching...' : 'On the way'}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 rounded-md font-mono text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600">
                                    #{activeOrder.id.slice(0, 6)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-bold tracking-wide uppercase flex items-center gap-1.5">
                                {activeOrder.status === 'Arrived' ? (
                                    <span className="text-green-500">Pick up your order</span>
                                ) : (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        {activeOrder.distanceKm} km remaining
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                {activeOrder.status === 'Cancelled' ? (
                    <button
                        onClick={dismissOrder}
                        className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-xl font-bold transition-all"
                    >
                        Dismiss Cancelled Order
                    </button>
                ) : activeOrder.status === 'Arrived' ? (
                    <button
                        onClick={clearOrder}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
                    >
                        Enjoy your meal! (Close)
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {restaurantLocation ? (
                            <button
                                onClick={() => {
                                    navigate('/map', { state: { routeTo: restaurantLocation } });
                                }}
                                className="col-span-2 py-3 bg-gray-100 dark:bg-white text-gray-900 dark:text-black rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <MapPin className="h-4 w-4" />
                                Track on Map
                            </button>
                        ) : (
                            <div className="col-span-2 text-center text-xs text-gray-400 italic py-2">
                                GPS Tracking Unavailable
                            </div>
                        )}

                        <button
                            onClick={moveCloser}
                            className="w-full py-3 bg-primary hover:bg-red-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
                        >
                            Simulate Move
                        </button>

                        <button
                            onClick={async () => {
                                const { downloadInvoice } = await import('../utils/invoiceGenerator');
                                downloadInvoice(activeOrder);
                            }}
                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
                        >
                            <FileText className="h-4 w-4" />
                            Invoice
                        </button>

                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Cancel Order?</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">Are you sure you want to cancel? This action cannot be undone.</p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    cancelOrder();
                                    setShowCancelConfirm(false);
                                }}
                                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveOrderTracker;
