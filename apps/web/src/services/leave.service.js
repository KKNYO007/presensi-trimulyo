// Leave Request Service
import { get, post } from './api';

/**
 * Create new leave request
 * @param {Object} data - Leave request data
 * @param {string} data.type - Leave type (SAKIT, IZIN, CUTI)
 * @param {string} data.startDate - Start date (YYYY-MM-DD)
 * @param {string} data.endDate - End date (YYYY-MM-DD)
 * @param {string} data.notes - Optional notes
 * @returns {Promise<Object>} Created leave request
 */
export async function createLeaveRequest(data) {
    const response = await post('/leave-requests', data);
    return response.data;
}

/**
 * Get user's leave requests
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (PENDING, APPROVED, REJECTED)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Leave requests with pagination
 */
export async function getLeaveRequests({ status, page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('limit', limit);

    const response = await get(`/leave-requests?${params.toString()}`);
    return response;
}

export default {
    createLeaveRequest,
    getLeaveRequests,
};
