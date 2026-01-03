import React, { useEffect, useState } from 'react';
import { Search, Filter, Loader } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Menu = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Pizza', 'Burger', 'Drinks', 'Sides'];

    useEffect(() => {
        const q = query(collection(db, "menuItems"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'All' || item.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Our Menu</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Discover our delicious offerings</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search food..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${category === cat
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="h-10 w-10 text-primary animate-spin" />
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <FoodCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400 dark:text-slate-600">No items found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Menu;
