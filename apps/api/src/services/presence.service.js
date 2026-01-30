const prisma = require('../config/database');
const { calculateDistanceFromOffice } = require('../utils/geo');
const { generatePresenceExcel } = require('../utils/export');
const { PRESENCE_STATUS, WORK_SCHEDULE } = require('../config/constants');

/**
 * Get "Today" date object based on WIB (UTC+7)
 * This ensures that 00:00 - 06:59 WIB counts as the correct day,
 * instead of the previous day (due to being UTC-1 if calculated naively on a UTC server)
 */
function getTodayWIB() {
    const now = new Date();
    // Get current time in Jakarta (WIB)
    const options = { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric', day: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);

    const year = parseInt(parts.find(p => p.type === 'year').value);
    const month = parseInt(parts.find(p => p.type === 'month').value) - 1; // JS months are 0-based
    const day = parseInt(parts.find(p => p.type === 'day').value);

    // Create a UTC date for that specific day (00:00:00 UTC)
    // This assumes we are storing "dates" as UTC Midnight regardless of timezone
    return new Date(Date.UTC(year, month, day));
}

/**
 * Check in for the day
 * @param {string} userId - User ID
 * @param {Object} data - Check-in data
 * @returns {Promise<Object>} Created presence record
 */
async function checkIn(userId, data) {
    const { latitude, longitude, selfieUrl } = data;

    // Use WIB aware date
    const today = getTodayWIB();

    // Check if already checked in today
    const existingPresence = await prisma.presence.findFirst({
        where: {
            userId,
            date: today,
        },
    });

    if (existingPresence) {
        throw { statusCode: 400, message: 'Anda sudah melakukan presensi masuk hari ini' };
    }

    // Calculate distance from office
    const distanceKm = calculateDistanceFromOffice(latitude, longitude);

    // Determine status based on time
    const now = new Date();

    // Convert current time to WIB (UTC+7)
    const wibNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentWIBHour = wibNow.getUTCHours();
    const currentWIBMinute = wibNow.getUTCMinutes();

    // Calculate total minutes from midnight for comparison
    const currentTotalMinutes = currentWIBHour * 60 + currentWIBMinute;

    // Define time boundaries in minutes from midnight
    const EARLIEST_CHECK_IN = 6 * 60; // 06:00 = 360 minutes
    const LATEST_TEPAT_WAKTU = 8 * 60; // 08:00 = 480 minutes

    // Check if before 06:00 - cannot check in
    if (currentTotalMinutes < EARLIEST_CHECK_IN) {
        throw { statusCode: 400, message: 'Presensi belum dapat dilakukan. Waktu presensi dimulai pukul 06:00 WIB.' };
    }

    // Determine status: TEPAT_WAKTU if between 06:00-08:00 (inclusive), TERLAMBAT after 08:00
    const status = currentTotalMinutes <= LATEST_TEPAT_WAKTU ? PRESENCE_STATUS.TEPAT_WAKTU : PRESENCE_STATUS.TERLAMBAT;

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
    const today = getTodayWIB();

    // Find today's presence
    const presence = await prisma.presence.findFirst({
        where: {
            userId,
            date: today,
        },
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
    const today = getTodayWIB();

    const presence = await prisma.presence.findFirst({
        where: {
            userId,
            date: today,
        },
    });

    return presence;
}

/**
 * Get presence detail by ID
 * @param {string} userId - User ID
 * @param {string} presenceId - Presence ID
 * @returns {Promise<Object|null>} Presence detail
 */
async function getPresenceById(userId, presenceId) {
    const presence = await prisma.presence.findFirst({
        where: {
            id: presenceId,
            userId,
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

    if (!presence) {
        throw { statusCode: 404, message: 'Data presensi tidak ditemukan' };
    }

    return presence;
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
        // Assume inputs are YYYY-MM-DD
        // We need to match records where 'date' (which is set to Midnight UTC of that WIB day) falls in range.
        where.date = {
            gte: new Date(startDate), // ISO string normally parses to UTC midnight if YYYY-MM-DD
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

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, jabatan: true },
    });

    const presences = await prisma.presence.findMany({
        where,
        orderBy: { date: 'asc' },
        include: {
            user: {
                select: {
                    name: true,
                    jabatan: true,
                },
            },
        },
    });

    return generatePresenceExcel(presences, user, filters.startDate, filters.endDate);
}

module.exports = {
    checkIn,
    checkOut,
    getTodayPresence,
    getPresenceById,
    getPresenceHistory,
    exportPresence,
};
