import React from 'react';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
    const { placeOrder } = useOrder();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cart.length === 0) return;
        placeOrder(cart, totalPrice);
        clearCart();
        navigate('/'); // Redirect to Home where the tracker will appear
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-10 w-10 text-gray-400 dark:text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-8">Looks like you haven't added anything yet.</p>
                <button
                    onClick={() => navigate('/menu')}
                    className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-red-600 transition-colors"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />

                            <div className="flex-grow">
                                <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                <p className="text-primary font-medium">${item.price}</p>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-md shadow-sm dark:shadow-none hover:shadow text-gray-600 dark:text-gray-200 font-bold"
                                >
                                    -
                                </button>
                                <span className="font-medium text-gray-900 dark:text-white w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-md shadow-sm dark:shadow-none hover:shadow text-gray-600 dark:text-gray-200 font-bold"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm sticky top-24 transition-colors">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-slate-400">
                                <span>Tax (5%)</span>
                                <span>${(totalPrice * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>${(totalPrice * 1.05).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            Checkout & Start Trek
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-xs text-gray-400 dark:text-slate-500 text-center mt-4">
                            By checking out, you agree to enable location tracking for your order.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
