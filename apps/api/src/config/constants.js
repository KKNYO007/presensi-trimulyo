// Presence status types
const PRESENCE_STATUS = {
    TEPAT_WAKTU: 'TEPAT_WAKTU',
    TERLAMBAT: 'TERLAMBAT',
    IZIN: 'IZIN',
};

// Leave request types
const LEAVE_TYPE = {
    SAKIT: 'SAKIT',
    IZIN: 'IZIN',
    CUTI: 'CUTI',
};

// Leave request status
const LEAVE_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

// Work schedule (for determining late status)
const WORK_SCHEDULE = {
    checkInTime: '08:00', // Expected check-in time
    checkOutTime: '16:00', // Expected check-out time
};

module.exports = {
    PRESENCE_STATUS,
    LEAVE_TYPE,
    LEAVE_STATUS,
    WORK_SCHEDULE,
};
