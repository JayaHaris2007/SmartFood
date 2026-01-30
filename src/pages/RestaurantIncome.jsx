import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const RestaurantIncome = () => {
    const [orders, setOrders] = useState([]);

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // We need orders to calculate stats
        const qSimpleOrders = query(
            collection(db, "orders"),
            where("restaurantId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribeOrders = onSnapshot(qSimpleOrders, (snapshot) => {
            const loadedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(loadedOrders);
        });

        return () => unsubscribeOrders();
    }, [currentUser]);

    // Calculate total revenue (assuming totalPrice exists on order)
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

    return (
        <div className="text-gray-900 dark:text-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <span className="text-green-500 text-4xl">$</span>
                    Income & Stats
                </h1>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-transparent">
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Total Revenue</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-green-500 mt-2">+12% this week</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-transparent">
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Total Orders</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                            <p className="text-xs text-blue-500 mt-2">Lifetime</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-transparent">
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Avg. Order Value</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">${avgOrder.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-transparent">
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Pending Orders</p>
                            <p className="text-4xl font-bold text-yellow-500 dark:text-yellow-400">
                                {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantIncome;
