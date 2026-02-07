import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, ShoppingBag, Filter, Clock } from 'lucide-react';

const RestaurantIncome = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // 'today', 'week', 'month', 'all'

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "orders"),
            where("restaurantId", "==", currentUser.uid)
            // Removed status filter to get ALL orders for analytics
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
            }));

            // Client-side sorting to avoid index issues
            ordersData.sort((a, b) => b.createdAt - a.createdAt);

            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Filter orders based on time range
    const getFilteredOrders = () => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            switch (timeRange) {
                case 'today': return orderDate >= startOfDay;
                case 'week': return orderDate >= startOfWeek;
                case 'month': return orderDate >= startOfMonth;
                default: return true;
            }
        });
    };

    const filteredOrders = getFilteredOrders();

    // Calculate Stats
    // Revenue only from Completed orders
    const completedOrders = filteredOrders.filter(o => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const totalCompletedOrdersCount = completedOrders.length;
    const avgOrder = totalCompletedOrdersCount > 0 ? totalRevenue / totalCompletedOrdersCount : 0;

    // Pending Orders (active orders including Pending, Preparing, Ready)
    const pendingOrdersCount = filteredOrders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length;

    // Prepare Chart Data
    const getChartData = () => {
        const dataMap = {};

        completedOrders.forEach(order => {
            const date = new Date(order.createdAt);
            let key;
            if (timeRange === 'today') {
                key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (timeRange === 'month' || timeRange === 'all') {
                key = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            } else {
                key = date.toLocaleDateString([], { weekday: 'short' }); // Day name for week view
            }

            if (!dataMap[key]) {
                dataMap[key] = { name: key, revenue: 0, orders: 0 };
            }
            dataMap[key].revenue += (order.totalPrice || 0);
            dataMap[key].orders += 1;
        });

        // Convert to array and sort if needed (mostly for 'today' and dates)
        let chartData = Object.values(dataMap);

        if (timeRange === 'today') {
            // Sort by time roughly? simpler to rely on input order if sorted desc. 
            // Actually input is DESC, so reverse for chart to go Left->Right (Old->New)
            return chartData.reverse();
        } else if (timeRange === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            chartData.sort((a, b) => days.indexOf(a.name) - days.indexOf(b.name));
        } else {
            // Sort by date key if possible, but simplest is relying on reverse of input list
            return chartData.reverse();
        }

        return chartData;
    };

    const chartData = getChartData();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <span className="text-primary text-4xl">₹</span>
                            Income Analytics
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400">Track your revenue and growth</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex">
                        {['today', 'week', 'month', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Function Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign className="h-24 w-24 text-primary" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Total Revenue</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                            ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {timeRange === 'today' ? 'Today\'s earnings' :
                                timeRange === 'week' ? 'This week' :
                                    timeRange === 'month' ? 'This month' : 'Lifetime earnings'}
                        </p>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Total Orders</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{totalCompletedOrdersCount}</h2>
                        <p className="text-xs text-gray-400 mt-2">
                            Completed orders
                        </p>
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
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Filter className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Avg. Value</span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                            ₹{avgOrder.toFixed(2)}
                        </h2>
                        <p className="text-xs text-gray-400 mt-2">
                            Per completed order
                        </p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Revenue Trend</h3>
                    <div className="h-[350px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
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
