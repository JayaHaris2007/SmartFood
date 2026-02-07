import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const EmailNotVerifiedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (currentUser.emailVerified) {
        return <Navigate to="/" />;
    }

    return children;
};

export default EmailNotVerifiedRoute;
