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

    // For Tepat Waktu logic, we also need to be careful. 
    // WORK_SCHEDULE.checkInTime is local time (e.g. 07:30).
    // We should compare against 'Today WIB at 07:30 WIB' converted to UTC/Absolute.
    const [expectedHour, expectedMinute] = WORK_SCHEDULE.checkInTime.split(':').map(Number);
    const expectedTime = new Date(today.getTime()); // Start with midnight WIB (stored as UTC)
    // Subtract 7 hours to get back to real "Today Midnight in WIB" instant? 
    // Wait, 'today' from getTodayWIB() returns a Date object representing 00:00 UTC of the target date.
    // E.g. Jan 24 00:00 UTC.
    // 07:30 WIB is Jan 24 00:30 UTC.
    // So if 'today' is Jan 24 00:00 UTC...
    // We just need to add (ExpectedHour - 7) hours? 
    // OR simpler: comparing `now` (absolute) vs `target` (absolute).
    // Target is: Today's Date (WIB) at ExpectedHour:ExpectedMinute (WIB).

    // Let's assume 'today' is correct YYYY-MM-DD.
    // We want YYYY-MM-DD HH:MM:00 WIB converted to standard Date object.

    const wibNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentWIBHour = wibNow.getUTCHours();
    const currentWIBMinute = wibNow.getUTCMinutes();

    // Simple comparison in "minutes from midnight"
    const currentTotalMinutes = currentWIBHour * 60 + currentWIBMinute;
    const expectedTotalMinutes = expectedHour * 60 + expectedMinute;

    const status = currentTotalMinutes > expectedTotalMinutes ? PRESENCE_STATUS.TERLAMBAT : PRESENCE_STATUS.TEPAT_WAKTU;

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
