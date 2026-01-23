import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { Clock, Bell, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RestaurantOrders = () => {
    const [orders, setOrders] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        const qSimpleOrders = query(
            collection(db, "orders"),
            where("restaurantId", "==", currentUser.uid)
        );

        const unsubscribeOrders = onSnapshot(qSimpleOrders, (snapshot) => {
            const loadedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort to avoid index issues
            loadedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(loadedOrders);

            // Generate alerts from data
            const newAlerts = [];
            loadedOrders.forEach(order => {
                if (order.isApproaching) {
                    newAlerts.push({
                        id: order.id + '_alert',
                        message: `Order #${order.id.slice(0, 5)}... is approaching! (${order.distanceKm}km)`,
                        timestamp: new Date().toLocaleTimeString()
                    });
                }
            });
            setAlerts(newAlerts);
        });

        return () => unsubscribeOrders();
    }, [currentUser]);

    const [orderToCancel, setOrderToCancel] = useState(null);
    const [orderToDelete, setOrderToDelete] = useState(null);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-400" />
                    All Orders
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Orders Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <div key={order.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'Completed' ? 'bg-green-500' : order.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex justify-between mb-4">
                                        <span className="font-mono text-lg font-bold">Order #{order.id.slice(0, 8)}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                                            order.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' :
                                                'bg-blue-500/20 text-blue-300'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-slate-300">
                                                <span>{item.quantity}x {item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                                        <div className="text-sm text-slate-400">
                                            Distance: <span className="text-white font-mono">{order.distanceKm} km</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {order.isApproaching && order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                                <span className="text-red-400 font-bold animate-pulse">APPROACHING!</span>
                                            )}

                                            {['Completed', 'Cancelled'].includes(order.status) ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOrderToDelete(order);
                                                    }}
                                                    className="px-3 py-1 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg text-xs font-semibold border border-slate-600 hover:border-red-500/30 transition-all flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOrderToCancel(order);
                                                    }}
                                                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-semibold border border-red-500/30 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-800 rounded-xl border border-slate-700">
                                No active orders at the moment.
                            </div>
                        )}
                    </div>

                    {/* Right Column: Alert Log */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 sticky top-4">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                Alert Log
                            </h2>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {alerts.length > 0 ? (
                                    alerts.map(alert => (
                                        <div key={alert.id} className="bg-slate-700/30 p-4 rounded-xl border-l-4 border-primary animate-fade-in">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-red-300">⚠️ Alert</span>
                                                <span className="text-xs text-slate-500">{alert.timestamp}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm">{alert.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 italic">
                                        No recent alerts.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Modal - Bottom Center */}
            {orderToCancel && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end items-center pb-8 animate-fade-in">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 w-[90%] max-w-sm shadow-2xl animate-slide-up">
                        <h3 className="text-xl font-bold text-white mb-2 text-center">Cancel Order?</h3>
                        <p className="text-slate-400 mb-6 text-center text-sm">Are you sure you want to cancel order <span className="text-white font-medium">#{orderToCancel.id.slice(0, 5)}</span>?</p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setOrderToCancel(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={async () => {
                                    await updateDoc(doc(db, "orders", orderToCancel.id), {
                                        status: 'Cancelled'
                                    });
                                    setOrderToCancel(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - Bottom Center */}
            {orderToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end items-center pb-8 animate-fade-in">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 w-[90%] max-w-sm shadow-2xl animate-slide-up">
                        <h3 className="text-xl font-bold text-white mb-2 text-center">Delete History?</h3>
                        <p className="text-slate-400 mb-6 text-center text-sm">Remove this order from your history permanently?</p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setOrderToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await deleteDoc(doc(db, "orders", orderToDelete.id));
                                    setOrderToDelete(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantOrders;
