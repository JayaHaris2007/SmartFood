import React from 'react';
import { useOrder } from '../context/OrderContext';
import { Navigation, MapPin, CheckCircle, XCircle } from 'lucide-react';

const ActiveOrderTracker = () => {
    const { activeOrder, moveCloser, clearOrder, cancelOrder } = useOrder();

    if (!activeOrder) return null;

    const progress = Math.max(0, Math.min(100, ((5 - activeOrder.distanceKm) / 5) * 100));

    return (
        <div className="fixed bottom-4 right-4 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 w-80 animate-slide-up">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Active Order
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${activeOrder.status === 'Arrived'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {activeOrder.status}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400">
                    <span>Distance</span>
                    <span className="font-mono font-bold">{activeOrder.distanceKm} km</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%`, backgroundColor: activeOrder.status === 'Cancelled' ? '#ef4444' : '' }}
                    />
                </div>

                {activeOrder.status === 'Cancelled' ? (
                    <div className="text-center">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">Order has been cancelled.</p>
                        <button
                            onClick={clearOrder}
                            className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg hover:bg-black dark:hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : activeOrder.status === 'Arrived' ? (
                    <div className="text-center">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">You have arrived! Food is ready.</p>
                        <button
                            onClick={clearOrder}
                            className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg hover:bg-black dark:hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={moveCloser}
                            className="flex-1 bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <MapPin className="h-3 w-3" />
                            Move (-0.5km)
                        </button>
                        <button
                            onClick={cancelOrder}
                            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 p-2 rounded-lg transition-colors"
                            title="Cancel Order"
                        >
                            <XCircle className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveOrderTracker;
