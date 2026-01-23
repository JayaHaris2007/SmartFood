import React from 'react';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ActiveOrderTracker = () => {
    const { activeOrder, moveCloser, clearOrder, cancelOrder, updateOrderLocation } = useOrder();
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
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl text-white overflow-hidden relative">

                {/* Background Progress Bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${activeOrder.status === 'Arrived' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
                            <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg leading-none mb-1">
                                {activeOrder.status === 'Arrived' ? 'You reached successfully!' : activeOrder.isApproaching ? 'Approaching...' : 'On the way'}
                            </h4>
                            <p className="text-xs text-slate-300 font-medium tracking-wide opacity-80 uppercase">
                                {activeOrder.status === 'Arrived' ? 'Enjoy your meal' : `${activeOrder.distanceKm} km remaining`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                {activeOrder.status === 'Cancelled' ? (
                    <button
                        onClick={clearOrder}
                        className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-all"
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
                                className="col-span-2 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
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
                            onClick={() => setShowCancelConfirm(true)}
                            className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
                        <h4 className="text-lg font-bold text-white mb-2 text-center">Cancel Order?</h4>
                        <p className="text-sm text-slate-400 text-center mb-6">Are you sure you want to cancel? This action cannot be undone.</p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 py-2 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
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
