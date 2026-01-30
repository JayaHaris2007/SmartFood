import React from 'react';
import { Plus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

import { useAuth } from '../context/AuthContext';

const FoodCard = ({ item }) => {
    const { addToCart } = useCart();
    const { userRole } = useAuth();
    const isRestaurant = userRole === 'restaurant';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-transparent dark:border-slate-700">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-semibold shadow-sm text-gray-800 dark:text-white">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs font-medium text-primary uppercase tracking-wider">{item.category}</p>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1">{item.name}</h3>
                    </div>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">${item.price}</span>
                </div>

                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                <button
                    onClick={() => !isRestaurant && !item.isStoreClosed && addToCart(item)}
                    disabled={isRestaurant || item.isStoreClosed}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group/btn ${isRestaurant || item.isStoreClosed
                            ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-gray-900 dark:bg-primary text-white hover:bg-black dark:hover:bg-red-600 active:scale-95'
                        }`}
                >
                    {isRestaurant ? (
                        'Restaurant Account'
                    ) : item.isStoreClosed ? (
                        'Store Closed'
                    ) : (
                        <>
                            <Plus className="h-4 w-4 group-hover/btn:rotate-90 transition-transform" />
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FoodCard;
