import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MapPin, Save } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const RestaurantLocation = () => {
    const { currentUser } = useAuth();
    const [restaurantLocation, setRestaurantLocation] = useState(null);
    const [isLocationSaving, setIsLocationSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists() && userDoc.data().location) {
                    setRestaurantLocation(userDoc.data().location);
                }
            }
        };
        fetchLocation();
    }, [currentUser]);

    const handleSaveLocation = async () => {
        if (!restaurantLocation || !currentUser) return;
        setIsLocationSaving(true);
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                location: restaurantLocation
            });
            setToast({ message: 'Location updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Error updating location:", error);
            setToast({ message: 'Failed to update location.', type: 'error' });
        }
        setIsLocationSaving(false);
    };

    return (
        <div className="text-gray-900 dark:text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-primary" />
                    Location Settings
                </h1>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Set your restaurant's location so customers can find you accurately on the map.</p>

                    <div className="h-[400px] rounded-xl overflow-hidden mb-6 border border-gray-200 dark:border-slate-600 shadow-inner">
                        <MapComponent
                            isEditable={true}
                            onLocationSelect={setRestaurantLocation}
                            selectedLocation={restaurantLocation}
                            center={restaurantLocation}
                            zoom={14}
                            onError={(msg) => setToast({ message: msg, type: 'error' })}
                            allowScrollZoom={true}
                        />
                    </div>

                    <button
                        onClick={handleSaveLocation}
                        disabled={isLocationSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Save className="h-5 w-5" />
                        {isLocationSaving ? 'Saving...' : 'Save Location'}
                    </button>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default RestaurantLocation;
