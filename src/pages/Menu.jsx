import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader, Star, MapPin } from 'lucide-react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Menu = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "restaurant"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching restaurants:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredRestaurants = restaurants.filter(restaurant => {
        return restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Restaurants</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Discover the best places to eat near you</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="h-10 w-10 text-primary animate-spin" />
                </div>
            ) : filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRestaurants.map(restaurant => (
                        <Link
                            key={restaurant.id}
                            to={`/restaurant/${restaurant.id}`}
                            className="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-slate-700"
                        >
                            {/* Placeholder Cover Image */}
                            <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 relative flex items-center justify-center">
                                <span className="text-6xl font-black text-white/20 select-none">
                                    {restaurant.name?.charAt(0) || 'R'}
                                </span>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                    {restaurant.name || "Restaurant"}
                                </h3>
                                <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium text-gray-900 dark:text-white">4.5</span>
                                        <span>• 25-30 mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                                            Promoted
                                        </div>
                                        {restaurant.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>Nearby</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400 dark:text-slate-600">No restaurants found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Menu;
