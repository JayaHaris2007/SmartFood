import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Updates the daily statistics for a restaurant.
 * @param {string} restaurantId 
 * @param {number} orderTotal 
 * @param {Date} dateObj 
 */
export const updateDailyStats = async (restaurantId, orderTotal, dateObj = new Date()) => {
    if (!restaurantId) return;

    const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const statsId = `${restaurantId}_${dateStr}`;
    const statsRef = doc(db, 'restaurant_stats', statsId);

    try {
        const docSnap = await getDoc(statsRef);

        if (docSnap.exists()) {
            await updateDoc(statsRef, {
                revenue: increment(orderTotal),
                ordersCount: increment(1),
                updatedAt: serverTimestamp()
            });
        } else {
            await setDoc(statsRef, {
                restaurantId,
                date: dateStr,
                revenue: orderTotal,
                ordersCount: 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error updating daily stats:", error);
    }
};

/**
 * Backfills statistics from existing orders.
 * Should be run once.
 * @param {string} restaurantId 
 */
export const backfillStats = async (restaurantId) => {
    if (!restaurantId) return;

    try {
        console.log(`Starting stats backfill for ${restaurantId}...`);

        // 1. Get all completed orders
        const q = query(
            collection(db, "orders"),
            where("restaurantId", "==", restaurantId),
            where("status", "==", "Completed")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No completed orders to backfill.");
            return;
        }

        // 2. Aggregate in memory
        const statsMap = {}; // { "2024-02-07": { revenue: 0, count: 0 } }

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const dateStr = date.toISOString().split('T')[0];
            const total = data.totalPrice || data.total || 0;

            if (!statsMap[dateStr]) {
                statsMap[dateStr] = { revenue: 0, count: 0 };
            }

            statsMap[dateStr].revenue += total;
            statsMap[dateStr].count += 1;
        });

        // 3. Write to Firestore (Batch)
        const batch = writeBatch(db);

        Object.keys(statsMap).forEach(dateStr => {
            const statsId = `${restaurantId}_${dateStr}`;
            const statsRef = doc(db, 'restaurant_stats', statsId);
            const stat = statsMap[dateStr];

            batch.set(statsRef, {
                restaurantId,
                date: dateStr,
                revenue: stat.revenue,
                ordersCount: stat.count,
                updatedAt: serverTimestamp(),
                isBackfilled: true
            }, { merge: true }); // Merge to avoid overwriting if exists
        });

        await batch.commit();
        console.log("Stats backfill completed successfully.");
        return true;

    } catch (error) {
        console.error("Error backfilling stats:", error);
        throw error;
    }
};
