import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#fbf9f9]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-primary border-t-accent animate-spin"></div>
                    <p className="text-primary/60 text-sm font-medium">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}
