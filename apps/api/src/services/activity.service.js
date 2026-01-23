const prisma = require('../config/database');
const { generateActivityExcel } = require('../utils/export');

/**
 * Create a new activity log
 * @param {string} userId - User ID
 * @param {Object} data - Activity data
 * @returns {Promise<Object>} Created activity record
 */
async function createActivity(userId, data) {
    const { title, description, startTime, endTime, photoUrls } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse time strings to Date objects
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTimeDate = new Date();
    startTimeDate.setHours(startHour, startMinute, 0, 0);

    const endTimeDate = new Date();
    endTimeDate.setHours(endHour, endMinute, 0, 0);

    const activity = await prisma.activity.create({
        data: {
            userId,
            date: today,
            title,
            description,
            startTime: startTimeDate,
            endTime: endTimeDate,
            photoUrls: photoUrls || [],
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

    return activity;
}

/**
 * Get user's activities with optional date range
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated activities
 */
async function getActivities(userId, filters = {}) {
    const { startDate, endDate, page = 1, limit = 10 } = filters;

    const where = { userId };

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const activities = await prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
    });

    const total = await prisma.activity.count({ where });

    return {
        data: activities,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Export activities to Excel
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function exportActivities(userId, filters = {}) {
    const { startDate, endDate } = filters;

    const where = { userId };

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const activities = await prisma.activity.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
            user: {
                select: {
                    name: true,
                    jabatan: true,
                },
            },
        },
    });

    return generateActivityExcel(activities);
}

module.exports = {
    createActivity,
    getActivities,
    exportActivities,
};
