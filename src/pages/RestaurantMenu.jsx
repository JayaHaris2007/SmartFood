import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ChefHat, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

const RestaurantMenu = () => {
    // Menu state
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Starter',
        price: '',
        description: '',
        image: ''
    });
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, itemId: null });

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Listen for menu items for THIS restaurant only
        const qMenu = query(
            collection(db, "menuItems"),
            where("restaurantId", "==", currentUser.uid)
        );

        const unsubscribeMenu = onSnapshot(qMenu, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort
            items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setMenuItems(items);
        });

        return () => {
            unsubscribeMenu();
        };
    }, [currentUser]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            await addDoc(collection(db, "menuItems"), {
                ...newItem,
                price: parseFloat(newItem.price),
                rating: 4.5, // Default rating
                restaurantId: currentUser.uid, // Link item to this restaurant
                restaurantName: currentUser.name || "Unknown Restaurant",
                createdAt: new Date().toISOString()
            });
            setNewItem({ name: '', category: 'Starter', price: '', description: '', image: '' }); // Reset form
            setToast({ message: 'Item added successfully!', type: 'success' });
        } catch (error) {
            console.error("Error adding item: ", error);
            setToast({ message: 'Failed to add item.', type: 'error' });
        }
    };

    const confirmDelete = (id) => {
        setConfirmModal({ isOpen: true, itemId: id });
    };

    const handleExecuteDelete = async () => {
        if (!confirmModal.itemId) return;

        try {
            await deleteDoc(doc(db, "menuItems", confirmModal.itemId));
            setToast({ message: 'Item deleted successfully.', type: 'success' });
        } catch (error) {
            console.error("Error deleting item: ", error);
            setToast({ message: 'Failed to delete item.', type: 'error' });
        } finally {
            setConfirmModal({ isOpen: false, itemId: null });
        }
    };

    return (
        <div className="text-gray-900 dark:text-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-3 rounded-xl">
                            <ChefHat className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Menu Management</h1>
                            <p className="text-gray-500 dark:text-slate-400">Add & Edit Items</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Add New Item */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <PlusCircle className="h-5 w-5 text-green-500" />
                                Add Menu Item
                            </h2>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
                                        placeholder="e.g. Spicy Pepperoni"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Category</label>
                                        <select
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="Starter">Starter</option>
                                            <option value="Main Course">Main Course</option>
                                            <option value="Dessert">Dessert</option>
                                            <option value="Drinks">Drinks</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary h-24"
                                        placeholder="Brief description of the item..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={newItem.image}
                                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
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
                    </div>

                    {/* Right Column: Current Menu */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ChefHat className="h-5 w-5 text-primary" />
                                Current Menu ({menuItems.length})
                            </h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {menuItems.length > 0 ? (
                                    menuItems.map(item => (
                                        <div key={item.id} className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-transparent">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-slate-600" />
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-slate-200">{item.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-slate-500">₹{item.price} • {item.category}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => confirmDelete(item.id)}
                                                className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-slate-500 italic">
                                        Menu is empty. Add some items!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onCancel={() => setConfirmModal({ isOpen: false, itemId: null })}
                onConfirm={handleExecuteDelete}
                title="Delete Item"
                message="Are you sure you want to delete this menu item? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
            />
        </div>
    );
};

export default RestaurantMenu;
