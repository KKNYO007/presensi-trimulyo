// Activity Service
import { get, postFormData } from './api';

/**
 * Create new activity
 * @param {Object} data - Activity data
 * @param {string} data.title - Activity title
 * @param {string} data.description - Activity description
 * @param {string} data.startTime - Start time (HH:mm)
 * @param {string} data.endTime - End time (HH:mm)
 * @param {File[]} photos - Array of photo files
 * @returns {Promise<Object>} Created activity
 */
export async function createActivity(data, photos = []) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('startTime', data.startTime);
    formData.append('endTime', data.endTime);

    // Append photos
    photos.forEach((photo, index) => {
        formData.append('photos', photo, `photo_${index}.jpg`);
    });

    const response = await postFormData('/activities', formData);
    return response.data;
}

/**
 * Get user's activities
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Activities with pagination
 */
export async function getActivities({ startDate, endDate, page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page);
    params.append('limit', limit);

    const response = await get(`/activities?${params.toString()}`);
    return response;
}

/**
 * Export activities as Excel
 * @param {Object} params - Query parameters
 * @returns {Promise<Blob>} Excel file blob
 */
export async function exportActivities({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await get(`/activities/export?${params.toString()}`);
    return response;
}

export default {
    createActivity,
    getActivities,
    exportActivities,
};
