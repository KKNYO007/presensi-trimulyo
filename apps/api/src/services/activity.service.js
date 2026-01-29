const prisma = require('../config/database');
const { generateActivityExcel } = require('../utils/export');

/**
 * Get "Today" date object based on WIB (UTC+7)
 */
function getTodayWIB() {
    const now = new Date();
    // Shift time to WIB (UTC+7)
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

    // Extract YYYY-MM-DD from the shifted time using UTC methods 
    // (since we manually shifted the epoch, the UTC components now represent WIB components)
    const year = wibTime.getUTCFullYear();
    const month = wibTime.getUTCMonth();
    const day = wibTime.getUTCDate();

    // Return midnight UTC of that specific day
    return new Date(Date.UTC(year, month, day));
}

/**
 * Create a new activity log
 * @param {string} userId - User ID
 * @param {Object} data - Activity data
 * @returns {Promise<Object>} Created activity record
 */
async function createActivity(userId, data) {
    const { title, description, startTime, endTime, photoUrls } = data;

    // Use WIB aware date for the "Date" field
    const today = getTodayWIB();

    // Parse time strings to Date objects
    // We want to construct the time relative to "Today WIB".
    // 'today' is 00:00:00 UTC of the target day.
    // 00:00:00 WIB of the target day is 'today' minus 7 hours.

    const wibMidnightAbsolute = new Date(today.getTime() - (7 * 60 * 60 * 1000));

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Add milliseconds to the WibMidnightAbsolute
    const startTimeDate = new Date(wibMidnightAbsolute.getTime() + (startHour * 60 * 60 * 1000) + (startMinute * 60 * 1000));
    const endTimeDate = new Date(wibMidnightAbsolute.getTime() + (endHour * 60 * 60 * 1000) + (endMinute * 60 * 1000));

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

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, jabatan: true },
    });

    const activities = await prisma.activity.findMany({
        where,
        orderBy: { date: 'asc' }, // Sort ascending for the report
        include: {
            user: {
                select: {
                    name: true,
                    jabatan: true,
                },
            },
        },
    });

    return generateActivityExcel(activities, user, startDate, endDate);
}

module.exports = {
    createActivity,
    getActivities,
    exportActivities,
};
