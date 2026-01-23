import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { MapPin, Star, Clock, ArrowLeft, Loader } from 'lucide-react';
import FoodCard from '../components/FoodCard';

const RestaurantDetails = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurantAndMenu = async () => {
            try {
                setLoading(true);
                // 1. Fetch Restaurant Details
                const restaurantDoc = await getDoc(doc(db, "users", id));
                if (restaurantDoc.exists()) {
                    setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });
                } else {
                    console.error("Restaurant not found");
                }

                // 2. Fetch Restaurant Menu
                const q = query(collection(db, "menuItems"), where("restaurantId", "==", id));
                const menuSnapshot = await getDocs(q);
                setMenuItems(menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error loading restaurant:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRestaurantAndMenu();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Restaurant Not Found</h2>
                <Link to="/" className="text-primary hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12">
            {/* Restaurant Header */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Restaurants
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Placeholder Image */}
                        <div className="w-full md:w-32 h-32 bg-gradient-to-br from-primary/80 to-orange-500/80 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {restaurant.name?.charAt(0) || 'R'}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {restaurant.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
                                {restaurant.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>Location Available</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span>4.5 (100+ ratings)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-green-500" />
                                    <span>30-40 min</span>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-2xl">
                                Fresh and delicious food delivered hot to your location with GPS tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Menu</h2>

                {menuItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {menuItems.map(item => (
                            <FoodCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <p className="text-gray-500 dark:text-slate-400 text-lg">
                            No menu items added yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetails;
