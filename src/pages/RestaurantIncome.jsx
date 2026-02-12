
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, ShoppingBag, Filter, Clock } from 'lucide-react';
import { backfillStats } from '../utils/statsUtils';

const RestaurantIncome = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState([]);
    const [todayOrders, setTodayOrders] = useState([]); // For hourly breakdown
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // 'today', 'week', 'month', 'year', 'all'

    // Fetch Stats (Daily Aggregates only)
    useEffect(() => {
        if (!currentUser) return;

        // 1. Listen to Stats Collection
        const qStats = query(
            collection(db, "restaurant_stats"),
            where("restaurantId", "==", currentUser.uid)
        );

        const unsubscribeStats = onSnapshot(qStats, async (snapshot) => {
            if (snapshot.empty) {
                await backfillStats(currentUser.uid);
            }
            const loadedStats = snapshot.docs.map(doc => doc.data());
            loadedStats.sort((a, b) => new Date(a.date) - new Date(b.date));
            setStats(loadedStats);
            setLoading(false);
        });

        // 2. Listen to Pending Orders
        const qPending = query(
            collection(db, "orders"),
            where("restaurantId", "==", currentUser.uid),
            where("status", "in", ['Pending', 'Preparing', 'Ready', 'On the way', 'Arrived'])
        );

        const unsubscribePending = onSnapshot(qPending, (snapshot) => {
            setPendingOrdersCount(snapshot.size);
        });

        return () => {
            unsubscribeStats();
            unsubscribePending();
        };
    }, [currentUser]);

    // Fetch "Today's" raw orders for Hourly Breakdown
    useEffect(() => {
        if (timeRange === 'today' && currentUser) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const qToday = query(
                collection(db, "orders"),
                where("restaurantId", "==", currentUser.uid),
                where("createdAt", ">=", startOfToday),
                orderBy("createdAt", "asc")
            );

            const unsubscribe = onSnapshot(qToday, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
                }));
                // Filter only completed/valid orders for revenue if needed, 
                // but usually we want to see potentially all for "orders" count, 
                // but strictly revenue should be completed.
                // Let's stick to Completed for Revenue, but maybe all for count? 
                // Matching the statsUtils approach: stats only count "Completed".
                const completedOrders = orders.filter(o => o.status === 'Completed');
                setTodayOrders(completedOrders);
            });

            return () => unsubscribe();
        }
    }, [currentUser, timeRange]);


    // --- Filtering Logic ---
    const getFilteredStats = () => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return stats.filter(stat => {
            // Append T00:00:00 to ensure it's treated as local time
            const statDate = new Date(stat.date + 'T00:00:00');
            switch (timeRange) {
                case 'today': return statDate >= startOfToday; // Daily stat for today
                case 'week': return statDate >= startOfWeek;
                case 'month': return statDate >= startOfMonth;
                case 'year': return statDate >= startOfYear;
                default: return true;
            }
        });
    };

    const filteredStats = getFilteredStats();

    // --- Helper: Group Data for Chart ---
    const prepareChartData = () => {
        if (timeRange === 'today') {
            // hourly breakdown
            const hours = Array(24).fill(0).map((_, i) => ({
                name: `${i}:00`,
                revenue: 0,
                orders: 0
            }));

            todayOrders.forEach(order => {
                const hour = order.createdAt.getHours();
                if (hours[hour]) {
                    hours[hour].revenue += (order.totalPrice || 0);
                    hours[hour].orders += 1;
                }
            });
            // return only hours up to current time? or all 24? All 24 is fine or until now.
            const currentHour = new Date().getHours();
            return hours.slice(0, currentHour + 1);
        }

        if (timeRange === 'year' || timeRange === 'all') {
            // Monthly Grouping
            const monthlyData = {};
            filteredStats.forEach(stat => {
                const date = new Date(stat.date + 'T00:00:00');
                const key = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // "Feb 26"
                if (!monthlyData[key]) {
                    monthlyData[key] = { name: key, revenue: 0, orders: 0, sortDate: date };
                }
                monthlyData[key].revenue += stat.revenue || 0;
                monthlyData[key].orders += stat.ordersCount || 0;
            });
            return Object.values(monthlyData).sort((a, b) => a.sortDate - b.sortDate);
        }

        // Default: Daily (Week, Month)
        return filteredStats.map(stat => ({
            name: new Date(stat.date + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' }),
            revenue: stat.revenue,
            orders: stat.ordersCount
        }));
    };

    const chartData = prepareChartData();

    // --- Calculate Totals ---
    // For 'today', rely on todayOrders for realtime accuracy, else usage filteredStats
    const calculateTotals = () => {
        if (timeRange === 'today') {
            const rev = todayOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
            return {
                revenue: rev,
                orders: todayOrders.length,
                avg: todayOrders.length > 0 ? rev / todayOrders.length : 0
            };
        }

        const totalRevenue = filteredStats.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
        const totalOrders = filteredStats.reduce((acc, curr) => acc + (curr.ordersCount || 0), 0);
        return {
            revenue: totalRevenue,
            orders: totalOrders,
            avg: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    };

    const currentTotals = calculateTotals();


    // --- Growth Calculation ---
    const getGrowthData = () => {
        // Define previous period logic
        let previousStats = [];
        const now = new Date();

        // Helper to get stats in range
        const getStatsInRange = (start, end) => {
            return stats.filter(stat => {
                const d = new Date(stat.date + 'T00:00:00');
                return d >= start && d < end;
            });
        };

        let startCurrent, endCurrent, startPrev, endPrev;

        if (timeRange === 'today') {
            // Compare vs Yesterday
            startCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            startPrev = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endPrev = startCurrent;
        } else if (timeRange === 'week') {
            // Last 7 days vs 7 days before that
            startCurrent = new Date(now); startCurrent.setDate(now.getDate() - 7);
            startPrev = new Date(startCurrent); startPrev.setDate(startPrev.getDate() - 7);
            endPrev = startCurrent;
        } else if (timeRange === 'month') {
            // This Month vs Last Month
            startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
            startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endPrev = startCurrent;
        } else if (timeRange === 'year') {
            // This Year vs Last Year
            startCurrent = new Date(now.getFullYear(), 0, 1);
            startPrev = new Date(now.getFullYear() - 1, 0, 1);
            endPrev = startCurrent;
        } else {
            return null; // No growth for 'all'
        }

        const prevPeriodStats = getStatsInRange(startPrev, endPrev);
        const prevRevenue = prevPeriodStats.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

        if (prevRevenue === 0) return { percent: 100, isPositive: true, label: "from previous period" };

        const diff = currentTotals.revenue - prevRevenue;
        const percent = (diff / prevRevenue) * 100;

        return {
            percent: Math.abs(percent).toFixed(1),
            isPositive: percent >= 0,
            label: "from previous period"
        };
    };

    const growth = getGrowthData();


    if (loading) {
        return <div className="p-8 text-center">Loading analytics...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section with Date Filter */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Income Analytics</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Track your revenue and growth.</p>
                    </div>

                    {/* Date Filter Component */}
                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-x-auto max-w-full">
                        {['today', 'week', 'month', 'year', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${timeRange === range
                                    ? 'bg-gray-900 dark:bg-slate-700 text-white shadow-md transform scale-105'
                                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                    } `}
                            >
                                {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Function Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Total Revenue</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">₹{currentTotals.revenue.toLocaleString()}</h2>

                        {growth && (
                            <p className={`text-xs flex items-center gap-1 mt-2 ${growth.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                <TrendingUp className={`h-3 w-3 ${!growth.isPositive && 'rotate-180'}`} />
                                {growth.isPositive ? '+' : '-'}{growth.percent}% <span className="text-gray-400 ml-1">{growth.label}</span>
                            </p>
                        )}
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Total Orders</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{currentTotals.orders}</h2>
                        {/* Optional: Add growth for orders too if needed, using same logic */}
                    </div>

                    {/* Pending Orders Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Pending</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{pendingOrdersCount}</h2>
                        <p className="text-xs text-gray-400 mt-2">
                            Active orders
                        </p>
                    </div>

                    {/* Avg Order Value */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Filter className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Avg. Order Value</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">₹{currentTotals.avg.toFixed(0)}</h2>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Revenue Overview {timeRange === 'today' && '(Hourly)'} {timeRange === 'year' && '(Monthly)'}
                        </h3>
                    </div>

                    <div className="h-80 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                                <p>No data available for this period</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantIncome;
