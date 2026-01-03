import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, MapPin, ChefHat, Sun, Moon, Menu as MenuIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { totalItems } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const { currentUser, userRole, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path
            ? 'text-primary font-bold'
            : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary';
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <ChefHat className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            SmartFood
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={isActive('/')}>Home</Link>
                        <Link to="/menu" className={isActive('/menu')}>Menu</Link>
                        {/* Only show Restaurant View if user has role='restaurant' */}
                        {userRole === 'restaurant' && (
                            <Link to="/dashboard" className={`flex items-center gap-1 ${isActive('/dashboard')}`}>
                                <MapPin className="h-4 w-4" />
                                Restaurant View
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5 text-yellow-400" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Cart Icon */}
                        <Link to="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ShoppingBag className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 h-5 w-5 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full animate-bounce">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Auth Button */}
                        {currentUser ? (
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
