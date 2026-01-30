import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { db } from '../lib/firebase';
import { collection, query, where, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import RestaurantDashboard from './RestaurantDashboard';

const Home = () => {
    const { userRole } = useAuth();
    const [featuredItems, setFeaturedItems] = React.useState([]);

    React.useEffect(() => {
        const fetchRestaurants = () => {
            try {
                // Fetch restaurants (users with role 'restaurant')
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "restaurant"),
                    limit(6)
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    setFeaturedItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, (error) => {
                    console.error("Error fetching restaurants:", error);
                });

                return unsubscribe;
            } catch (error) {
                console.error("Error setting up restaurant listener:", error);
                return () => { };
            }
        };

        const unsubscribe = fetchRestaurants();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <>
            {userRole === 'restaurant' ? (
                <RestaurantDashboard />
            ) : (
                <div className="space-y-16 pb-12">
                    {/* Hero Section */}
                    <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                            alt="Delicious variety of food on a table"
                            className="absolute inset-0 w-full h-full object-cover"
                            fetchPriority="high"
                            width="1600"
                            height="800"
                        />

                        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto space-y-6">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                                Order Smart.<br />
                                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">
                                    Eat Fresh.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light">
                                Pre-order your favorites and let our smart GPS tracking ensure your food is prepared exactly when you arrive. No waiting, just eating.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    to="/menu"
                                    className="px-8 py-3.5 bg-primary hover:bg-red-600 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2"
                                >
                                    View Menu <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="sr-only">Our Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Clock, title: "Zero Wait Time", desc: "Our GPS tracking tells us when to start cooking so your food is fresh upon arrival." },
                                { icon: Star, title: "Premium Quality", desc: "Top-rated chefs preparing delicious meals with locally sourced ingredients." },
                                { icon: ArrowRight, title: "Smart Re-order", desc: "One-tap re-ordering of your favorite combinations." }
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Restaurants Grid */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular Restaurants</h2>
                                <p className="text-gray-600 dark:text-slate-400">Order from the best places near you</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredItems.map(restaurant => (
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
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            {restaurant.isOpen !== false ? (
                                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                    OPEN
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-900/80 backdrop-blur text-white text-xs font-bold rounded-full shadow-lg">
                                                    CLOSED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`p-6 ${restaurant.isOpen === false ? 'opacity-60 grayscale-[0.5]' : ''}`}>
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
                                                <span>• Fast Food, American</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {featuredItems.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 dark:text-slate-400">
                                    No restaurants found. Be the first to join!
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default Home;
