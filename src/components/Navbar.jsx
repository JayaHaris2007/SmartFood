import React, { useState } from 'react';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close mobile menu when route changes
    React.useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const isActive = (path) => {
        return location.pathname === path
            ? 'text-primary font-bold'
            : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary';
    };

    return (
        <nav className="sticky top-0 z-[2000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
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
                        {userRole === 'restaurant' ? (
                            <>
                                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                                <Link to="/dashboard/orders" className={isActive('/dashboard/orders')}>Orders</Link>
                                <Link to="/dashboard/map" className={isActive('/dashboard/map')}>Map</Link>
                                <Link to="/dashboard/income" className={isActive('/dashboard/income')}>Income</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/" className={isActive('/')}>Home</Link>
                                <Link to="/menu" className={isActive('/menu')}>Restaurants</Link>
                            </>
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

                        {/* Cart Icon - Only for Customers */}
                        {userRole !== 'restaurant' && (
                            <Link to="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-2 md:mr-0">
                                <ShoppingBag className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full animate-bounce">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Desktop Auth Button */}
                        <div className="hidden md:flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    <Link
                                        to={userRole === 'restaurant' ? '/dashboard/profile' : '/profile'}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors"
                                        title="Profile"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {currentUser.email[0].toUpperCase()}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all animate-slide-down">
                    <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
                        {userRole === 'restaurant' ? (
                            <>
                                <Link to="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}>Dashboard</Link>
                                <Link to="/dashboard/orders" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/orders')}`}>Orders</Link>
                                <Link to="/dashboard/map" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/map')}`}>Map</Link>
                                <Link to="/dashboard/income" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard/income')}`}>Income</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>Home</Link>
                                <Link to="/menu" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/menu')}`}>Restaurants</Link>
                            </>
                        )}

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                            {currentUser ? (
                                <div className="space-y-2">
                                    <Link to={userRole === 'restaurant' ? '/dashboard/profile' : '/profile'} className="flex items-center px-3 gap-3 mb-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {currentUser.email[0].toUpperCase()}
                                        </div>
                                        <span className="text-gray-900 dark:text-white font-medium">{currentUser.name || currentUser.email}</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
