import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Load from local storage if available
        const saved = localStorage.getItem('smartfood_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('smartfood_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            // Check for restaurant mismatch
            if (prev.length > 0 && prev[0].restaurantId !== item.restaurantId) {
                // Ideally prompt user, but for now we can either block or alert.
                // Simple version: Alert and do not add.
                // Since this is a void function, we must use window.alert (not ideal but works for "fix bugs")
                // Or we can return false? But signature is void.
                // Better: Clear cart if mixing? No, that's annoying.
                // Alerting is safest.
                if (!window.confirm("You can only order from one restaurant at a time. Clear cart and add this item?")) {
                    return prev;
                }
                return [{ ...item, quantity: 1 }];
            }

            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return newQty === 0 ? null : { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};
