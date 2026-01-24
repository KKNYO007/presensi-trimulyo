// API Configuration and HTTP Client
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get auth token from localStorage
 */
function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Set auth token in localStorage
 */
export function setToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeToken() {
    localStorage.removeItem('authToken');
}

/**
 * Make an API request with authentication
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response data
 */
async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        ...options.headers,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle file downloads (e.g., Excel exports)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('spreadsheetml')) {
        if (!response.ok) {
            throw new Error('Download failed');
        }
        return response.blob();
    }

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            message: data.message || 'Terjadi kesalahan',
            ...data,
        };
    }

    return data;
}

/**
 * GET request
 */
export function get(endpoint) {
    return request(endpoint, { method: 'GET' });
}

/**
 * POST request with JSON body
 */
export function post(endpoint, body) {
    return request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * POST request with FormData
 */
export function postFormData(endpoint, formData) {
    return request(endpoint, {
        method: 'POST',
        body: formData,
    });
}

/**
 * PUT request with JSON body
 */
export function put(endpoint, body) {
    return request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * DELETE request
 */
export function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
}

export default {
    get,
    post,
    postFormData,
    put,
    del,
    setToken,
    removeToken,
};
