import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { ChefHat, Bell, Clock, PlusCircle, Trash2 } from 'lucide-react';

const RestaurantDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [alerts, setAlerts] = useState([]);
    // Menu state
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Pizza',
        price: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        // Listen for all active orders
        const qOrders = query(
            collection(db, "orders"),
            where("status", "!=", "Delivered"),
            orderBy("status"),
            orderBy("createdAt", "desc")
        );

        // Simple query without composite index for orders
        const qSimpleOrders = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

        const unsubscribeOrders = onSnapshot(qSimpleOrders, (snapshot) => {
            const loadedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(o => o.status !== 'Completed'); // Filtering client side for simplicity

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

        // Listen for menu items
        const qMenu = query(collection(db, "menuItems"), orderBy("createdAt", "desc"));
        const unsubscribeMenu = onSnapshot(qMenu, (snapshot) => {
            setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeOrders();
            unsubscribeMenu();
        };
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "menuItems"), {
                ...newItem,
                price: parseFloat(newItem.price),
                rating: 4.5, // Default rating
                createdAt: new Date().toISOString()
            });
            setNewItem({ name: '', category: 'Pizza', price: '', description: '', image: '' }); // Reset form
            alert('Item added successfully!');
        } catch (error) {
            console.error("Error adding item: ", error);
            alert('Failed to add item.');
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteDoc(doc(db, "menuItems", id));
            } catch (error) {
                console.error("Error deleting item: ", error);
                alert('Failed to delete item.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-3 rounded-xl">
                            <ChefHat className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
                            <p className="text-slate-400">Manage Orders & Menu</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Orders */}
                    <div className="space-y-8">
                        {/* Active Order Status */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-400" />
                                Active Orders
                            </h2>
                            {/* ... Orders List Code (Existing) ... */}
                            <div className="space-y-4">
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <div key={order.id} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                            <div className="flex justify-between mb-4">
                                                <span className="font-mono text-lg font-bold">Order #{order.id.slice(0, 8)}</span>
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
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
                                                    {order.isApproaching && (
                                                        <span className="text-red-400 font-bold animate-pulse">APPROACHING!</span>
                                                    )}
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Are you sure you want to cancel this order?')) {
                                                                await updateDoc(doc(db, "orders", order.id), {
                                                                    status: 'Cancelled'
                                                                });
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-semibold border border-red-500/30 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        No active orders at the moment.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Menu Management & Alerts */}
                    <div className="space-y-8">
                        {/* Add New Item */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <PlusCircle className="h-5 w-5 text-green-400" />
                                Add Menu Item
                            </h2>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                                        placeholder="e.g. Spicy Pepperoni"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                        <select
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="Pizza">Pizza</option>
                                            <option value="Burger">Burger</option>
                                            <option value="Drinks">Drinks</option>
                                            <option value="Sides">Sides</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary h-24"
                                        placeholder="Brief description of the item..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={newItem.image}
                                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                                        placeholder="https://..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Add to Menu
                                </button>
                            </form>
                        </div>

                        {/* Current Menu Items */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ChefHat className="h-5 w-5 text-primary" />
                                Current Menu ({menuItems.length})
                            </h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {menuItems.length > 0 ? (
                                    menuItems.map(item => (
                                        <div key={item.id} className="bg-slate-700/30 p-3 rounded-lg flex justify-between items-center group hover:bg-slate-700/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-600" />
                                                <div>
                                                    <h3 className="font-medium text-slate-200">{item.name}</h3>
                                                    <p className="text-xs text-slate-500">${item.price} • {item.category}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 italic">
                                        Menu is empty. Add some items!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Alerts Feed */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                Alert Log
                            </h2>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {alerts.length > 0 ? (
                                    alerts.map(alert => (
                                        <div key={alert.id} className="bg-slate-700/30 p-4 rounded-xl border-l-4 border-primary animate-fade-in">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-red-300">⚠️ Proximity Alert</span>
                                                <span className="text-xs text-slate-500">{alert.timestamp}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm">{alert.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 italic">
                                        Waiting for incoming alerts...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
