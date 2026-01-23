import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        if (!authService.isAuthenticated()) {
            setLoading(false);
            return;
        }

        try {
            const userData = await authService.getMe();
            setUser(userData);
        } catch (error) {
            console.error('Auth check failed:', error);
            authService.logout();
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const result = await authService.login(email, password);
        setUser(result.user);
        return result;
    }

    function logout() {
        authService.logout();
        setUser(null);
        navigate('/');
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
