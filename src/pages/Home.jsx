import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { foodItems } from '../data/mockData';

const Home = () => {
    const featuredItems = foodItems.slice(0, 3);

    return (
        <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover"
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
                            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Items */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular This Week</h2>
                        <p className="text-gray-500 dark:text-slate-400">Most ordered items by our community</p>
                    </div>
                    <Link to="/menu" className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline">
                        See all <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredItems.map(item => (
                        <FoodCard key={item.id} item={item} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
