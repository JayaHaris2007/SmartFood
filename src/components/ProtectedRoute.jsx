import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roleRequired }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentUser) {
        if (roleRequired === 'restaurant') {
            return <Navigate to="/restaurant-login" />;
        }
        return <Navigate to="/login" />;
    }

    // If user is logged in but email is not verified, redirect to verification page
    if (!currentUser.emailVerified) {
        return <Navigate to="/verify-email" />;
    }

    // If a specific role is required (e.g., 'restaurant' for dashboard)
    if (roleRequired && userRole !== roleRequired) {
        // If asking for restaurant but user is just a user, redirect to home
        if (roleRequired === 'restaurant') {
            return <Navigate to="/" />;
        }
        // For any other role mismatch, redirect to home
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
