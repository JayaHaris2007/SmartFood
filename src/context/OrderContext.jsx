import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [restaurantAlerts, setRestaurantAlerts] = useState([]);

    // Listen for current user's active order
    useEffect(() => {
        if (!currentUser) {
            setActiveOrder(null);
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid),
            where("status", "!=", "Delivered"), // Only active orders
            orderBy("status"), // Required for inequality filter composite index (or simple match) - actually Firestore requires orderBy field to match inequality filter first or be mindful. 
            // Simpler: Just get recent and filter in client if needed, or:
            // where("status", "in", ["On the way", "Arrived"])
            limit(1)
        );

        // Ideally we need an index for the above query. 
        // Simplification for prototype: Listen to all user's orders sort by date, pick first active.
        // Listen to all user's orders (without specific sort to avoid index issues in dev)
        const qSimple = query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(qSimple, (snapshot) => {
            if (!snapshot.empty) {
                // Client-side sort to get the latest
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const latestOrder = orders[0];

                // Check if it's actually active
                if (latestOrder.status !== 'Completed' && latestOrder.status !== 'Delivered') {
                    setActiveOrder(latestOrder);
                } else {
                    setActiveOrder(null);
                }
            } else {
                setActiveOrder(null);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Listen for alerts (orders approaching) - this is for specific client simulation
    // In a real app, the dashboard listens, but here we simulate 'alerts' if we were the restaurant?
    // Actually the OrderContext Mock showed 'restaurantAlerts'. The Dashboard uses them.
    // We should let the Dashboard listen for alerts directly from Firestore orders.
    // So this context assumes 'Client' role mainly, but 'moveCloser' is a simulation tool.

    // Simulate GPS movement (updates Firestore)
    const moveCloser = async () => {
        if (!activeOrder) return;

        const currentDist = activeOrder.distanceKm;
        if (currentDist <= 0.1) {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                distanceKm: 0,
                status: 'Arrived',
                isApproaching: true
            });
            return;
        }

        const newDistance = Math.max(0, parseFloat((currentDist - 0.5).toFixed(1)));
        const isApproaching = newDistance <= 2.0;
        const newStatus = newDistance === 0 ? 'Arrived' : activeOrder.status;

        await updateDoc(doc(db, "orders", activeOrder.id), {
            distanceKm: newDistance,
            isApproaching: isApproaching,
            status: newStatus
        });
    };

    const placeOrder = async (items, total) => {
        if (!currentUser) return; // Should be protected

        // Extract restaurantId from the first item (assuming single restaurant ordering)
        const restaurantId = items.length > 0 ? items[0].restaurantId : null;

        await addDoc(collection(db, "orders"), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            items,
            total,
            status: 'On the way',
            distanceKm: 5.0,
            isApproaching: false,
            createdAt: new Date().toISOString(),
            restaurantId: restaurantId // Link order to restaurant
        });
        // Snapshot listener will update activeOrder automatically
    };

    const clearOrder = async () => {
        // Mark as delivered/completed
        if (activeOrder) {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                status: 'Completed'
            });
        }
    };

    const cancelOrder = async () => {
        if (activeOrder) {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                status: 'Cancelled'
            });
        }
    };

    // Update order with real GPS data
    const updateOrderLocation = async (distanceKm) => {
        if (!activeOrder) return;

        const isApproaching = distanceKm <= 2.0; // Alert when 2km away
        const status = distanceKm < 0.1 ? 'Arrived' : activeOrder.status; // Update status if arrived

        // Only update if changed significantly to save writes
        if (Math.abs(activeOrder.distanceKm - distanceKm) > 0.05 || status !== activeOrder.status) {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                distanceKm: distanceKm,
                isApproaching: isApproaching,
                status: status === 'Arrived' && activeOrder.status !== 'Arrived' ? 'Arrived' : activeOrder.status
            });
        }
    };

    return (
        <OrderContext.Provider value={{ activeOrder, placeOrder, clearOrder, cancelOrder, moveCloser, updateOrderLocation }}>
            {children}
        </OrderContext.Provider>
    );
};
