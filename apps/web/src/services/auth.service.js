// Authentication Service
import { post, get, setToken, removeToken } from './api';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export async function login(email, password) {
    const response = await post('/auth/login', { email, password });

    if (response.success && response.data.token) {
        setToken(response.data.token);
    }

    return response.data;
}

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export async function getMe() {
    const response = await get('/auth/me');
    return response.data;
}

/**
 * Logout - clear token and user data
 */
export function logout() {
    removeToken();
    localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

export default {
    login,
    getMe,
    logout,
    isAuthenticated,
};
