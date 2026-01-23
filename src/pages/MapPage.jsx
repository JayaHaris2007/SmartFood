import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const MapPage = () => {
    const [restaurantMarkers, setRestaurantMarkers] = useState([]);
    const location = useLocation();
    const routeTo = location.state?.routeTo;

    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "restaurant"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const markers = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    if (data.location && data.location.lat && data.location.lng) {
                        return {
                            position: [data.location.lat, data.location.lng],
                            popup: data.name || "Restaurant"
                        };
                    }
                    return null;
                })
                .filter(marker => marker !== null);

            setRestaurantMarkers(markers);
        }, (error) => {
            console.error("Error fetching restaurants:", error);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen pt-16 bg-slate-900 relative">
            {/* Floating Header */}
            <div className="absolute top-24 left-4 z-10 bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                <h1 className="text-2xl font-bold text-white mb-1">Live Map</h1>
                <p className="text-gray-400 text-sm">Tracking active deliveries</p>
            </div>

            <div className="h-[calc(100vh-64px)] w-full">
                <MapComponent
                    zoom={13}
                    markers={restaurantMarkers}
                    routeTo={routeTo}
                />
            </div>
        </div>
    );
};

export default MapPage;
