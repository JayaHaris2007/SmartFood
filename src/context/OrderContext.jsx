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

        // Simplification for prototype: Listen to all user's orders sort by date, pick first active.
        const qSimple = query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(qSimple, (snapshot) => {
            if (!snapshot.empty) {
                // Client-side sort to get the latest
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Find the first relevant order:
                // - Not dismissed by user
                // - Status is one of: On the way, Arrived, Cancelled
                // - NOT Completed (unless we wanted to show history, but usually we don't track completed)
                // - NOT Delivered (legacy)
                const latestRelevant = orders.find(o =>
                    !o.userDismissed &&
                    (o.status === 'On the way' || o.status === 'Arrived' || o.status === 'Cancelled')
                );

                setActiveOrder(latestRelevant || null);
            } else {
                setActiveOrder(null);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // ... (moveCloser remains same)

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
        if (!currentUser) return;

        const restaurantId = items.length > 0 ? items[0].restaurantId : null;

        await addDoc(collection(db, "orders"), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.name || currentUser.displayName || 'Guest',
            customerName: currentUser.name || currentUser.displayName || 'Guest',
            items,
            total,
            status: 'On the way',
            distanceKm: 5.0,
            isApproaching: false,
            createdAt: new Date().toISOString(),
            restaurantId: restaurantId,
            userDismissed: false // Initialize as not dismissed
        });
    };

    const clearOrder = async () => {
        // Mark as delivered/completed
        if (activeOrder) {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                status: 'Completed',
                userDismissed: true // Also dismiss it so it clears from tracker instantly
            });
        }
    };

    const dismissOrder = async () => {
        if (activeOrder) {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                userDismissed: true
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
        <OrderContext.Provider value={{ activeOrder, placeOrder, clearOrder, cancelOrder, moveCloser, updateOrderLocation, dismissOrder }}>
            {children}
        </OrderContext.Provider>
    );
};
