import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { userLoggedIn, loading, userRole } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!userLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // If a role is required and the user has a role that doesn't match, redirect.
    // We check `userRole !== null` to prevent redirecting before the role is fetched.
    if (requiredRole && userRole !== null && userRole !== requiredRole) {
        // Redirect to a page indicating they are not authorized for this specific role.
        // Or, to a default dashboard if that's preferred.
        return <Navigate to="/encrypted-dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
