const prisma = require('../config/database');
const { calculateDistanceFromOffice } = require('../utils/geo');
const { generatePresenceExcel } = require('../utils/export');
const { PRESENCE_STATUS, WORK_SCHEDULE } = require('../config/constants');

/**
 * Check in for the day
 * @param {string} userId - User ID
 * @param {Object} data - Check-in data
 * @returns {Promise<Object>} Created presence record
 */
async function checkIn(userId, data) {
    const { latitude, longitude, selfieUrl } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingPresence = await prisma.presence.findFirst({
        where: {
            userId,
            date: today,
        },
    });

    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);

    // const existingPresence = await prisma.presence.findFirst({
    //     where: {
    //         userId,
    //         date: {
    //             gte: startOfDay,
    //             lte: endOfDay,
    //         },
    //     },
    // });


    if (existingPresence) {
        throw { statusCode: 400, message: 'Anda sudah melakukan presensi masuk hari ini' };
    }

    // Calculate distance from office
    const distanceKm = calculateDistanceFromOffice(latitude, longitude);

    // Determine status based on time
    const now = new Date();
    const [expectedHour, expectedMinute] = WORK_SCHEDULE.checkInTime.split(':').map(Number);
    const expectedTime = new Date();
    expectedTime.setHours(expectedHour, expectedMinute, 0, 0);

    const status = now > expectedTime ? PRESENCE_STATUS.TERLAMBAT : PRESENCE_STATUS.TEPAT_WAKTU;

    // Create presence record
    const presence = await prisma.presence.create({
        data: {
            userId,
            date: today,
            checkInTime: now,
            latitude,
            longitude,
            distanceKm,
            selfieUrl,
            status,
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

    return presence;
}

/**
 * Check out for the day
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated presence record
 */
async function checkOut(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);
    // Find today's presence
    const presence = await prisma.presence.findFirst({
        where: {
            userId,
            date: today,
        },
        // where: {
        //     userId,
        //     date: {
        //         gte: startOfDay,
        //         lte: endOfDay,
        //     },
        // },
    });

    if (!presence) {
        throw { statusCode: 400, message: 'Anda belum melakukan presensi masuk hari ini' };
    }

    if (presence.checkOutTime) {
        throw { statusCode: 400, message: 'Anda sudah melakukan presensi keluar hari ini' };
    }

    // Update with check-out time
    const updatedPresence = await prisma.presence.update({
        where: { id: presence.id },
        data: {
            checkOutTime: new Date(),
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

    return updatedPresence;
}

/**
 * Get today's presence status
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Today's presence or null
 */
async function getTodayPresence(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presence = await prisma.presence.findFirst({
        where: {
            userId,
            date: today,
        },
    });

    return presence;
    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);

    // return prisma.presence.findFirst({
    //     where: {
    //         userId,
    //         date: {
    //             gte: startOfDay,
    //             lte: endOfDay,
    //         },
    //     },
    // });

}

/**
 * Get presence history with optional date range
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of presence records
 */
async function getPresenceHistory(userId, filters = {}) {
    const { startDate, endDate, page = 1, limit = 10 } = filters;

    const where = { userId };

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const presences = await prisma.presence.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
    });

    const total = await prisma.presence.count({ where });

    return {
        data: presences,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Export presence data to Excel
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function exportPresence(userId, filters = {}) {
    const { startDate, endDate } = filters;

    const where = { userId };

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const presences = await prisma.presence.findMany({
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

    return generatePresenceExcel(presences);
}

module.exports = {
    checkIn,
    checkOut,
    getTodayPresence,
    getPresenceHistory,
    exportPresence,
};
