// Authentication Service
import { post, get, postFormData, setToken, removeToken } from './api';

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

/**
 * Update user avatar
 * @param {Blob|File} file - Image file
 * @returns {Promise<Object>} Updated user data
 */
export async function updateAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file, 'avatar.jpg');

    const response = await postFormData('/auth/avatar', formData);
    return response.data;
}

export default {
    login,
    getMe,
    logout,
    isAuthenticated,
    updateAvatar,
};
