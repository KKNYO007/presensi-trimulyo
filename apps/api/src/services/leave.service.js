const prisma = require('../config/database');
const { LEAVE_STATUS } = require('../config/constants');

/**
 * Submit a new leave request
 * @param {string} userId - User ID
 * @param {Object} data - Leave request data
 * @returns {Promise<Object>} Created leave request
 */
async function createLeaveRequest(userId, data) {
    const { type, startDate, endDate, notes } = data;

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
        throw { statusCode: 400, message: 'Tanggal mulai harus sebelum tanggal selesai' };
    }

    const leaveRequest = await prisma.leaveRequest.create({
        data: {
            userId,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            notes,
            status: LEAVE_STATUS.PENDING,
        },
        include: {
            user: {
                select: {
                    name: true,
                    jabatan: true,
                },
            },
        },
    });

    return leaveRequest;
}

/**
 * Get user's leave requests
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated leave requests
 */
async function getLeaveRequests(userId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;

    const where = { userId };

    if (status) {
        where.status = status;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
    });

    const total = await prisma.leaveRequest.count({ where });

    return {
        data: leaveRequests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

module.exports = {
    createLeaveRequest,
    getLeaveRequests,
};
