// Presence Service
import { get, postFormData } from './api';

/**
 * Check-in with selfie and location
 * @param {number} latitude - User latitude
 * @param {number} longitude - User longitude
 * @param {File|Blob} selfie - Selfie image file
 * @returns {Promise<Object>} Presence data
 */
export async function checkIn(latitude, longitude, selfie) {
    const formData = new FormData();
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('selfie', selfie, 'selfie.jpg');

    const response = await postFormData('/presence/check-in', formData);
    return response.data;
}

/**
 * Check-out
 * @returns {Promise<Object>} Updated presence data
 */
export async function checkOut() {
    const response = await postFormData('/presence/check-out', new FormData());
    return response.data;
}

/**
 * Get today's presence status
 * @returns {Promise<Object|null>} Today's presence or null
 */
export async function getTodayPresence() {
    const response = await get('/presence/today');
    return response.data;
}

/**
 * Get presence detail by ID
 * @param {string} id - Presence ID
 * @returns {Promise<Object>} Presence detail
 */
export async function getPresenceById(id) {
    const response = await get(`/presence/${id}`);
    return response.data;
}

/**
 * Get presence history
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Presence history with pagination
 */
export async function getPresenceHistory({ startDate, endDate, page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page);
    params.append('limit', limit);

    const response = await get(`/presence/history?${params.toString()}`);
    return response;
}

/**
 * Export presence as Excel
 * @param {Object} params - Query parameters
 * @returns {Promise<Blob>} Excel file blob
 */
export async function exportPresence({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await get(`/presence/export-v3?${params.toString()}`);
    return response;
}

export default {
    checkIn,
    checkOut,
    getTodayPresence,
    getPresenceById,
    getPresenceHistory,
    exportPresence,
};
