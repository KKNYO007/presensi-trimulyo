const ExcelJS = require('exceljs');

/**
 * Generate Excel file from presence data
 * @param {Array} presences - Array of presence records
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generatePresenceExcel(presences) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Presensi Trimulyo';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Rekap Presensi');

    // Define columns
    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Jabatan', key: 'jabatan', width: 20 },
        { header: 'Jam Masuk', key: 'checkInTime', width: 12 },
        { header: 'Jam Keluar', key: 'checkOutTime', width: 12 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Jarak (km)', key: 'distanceKm', width: 12 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD4A853' }, // Golden accent color
    };

    // Add data rows
    presences.forEach((presence, index) => {
        worksheet.addRow({
            no: index + 1,
            date: formatDate(presence.date),
            name: presence.user?.name || '-',
            jabatan: presence.user?.jabatan || '-',
            checkInTime: formatTime(presence.checkInTime),
            checkOutTime: formatTime(presence.checkOutTime),
            status: presence.status,
            distanceKm: presence.distanceKm?.toFixed(2) || '-',
        });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    return workbook.xlsx.writeBuffer();
}

/**
 * Generate Excel file from activity data
 * @param {Array} activities - Array of activity records
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateActivityExcel(activities) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Presensi Trimulyo';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Log Kegiatan');

    // Define columns
    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Jabatan', key: 'jabatan', width: 20 },
        { header: 'Judul Kegiatan', key: 'title', width: 30 },
        { header: 'Deskripsi', key: 'description', width: 50 },
        { header: 'Jam Mulai', key: 'startTime', width: 12 },
        { header: 'Jam Selesai', key: 'endTime', width: 12 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD4A853' },
    };

    // Add data rows
    activities.forEach((activity, index) => {
        worksheet.addRow({
            no: index + 1,
            date: formatDate(activity.date),
            name: activity.user?.name || '-',
            jabatan: activity.user?.jabatan || '-',
            title: activity.title,
            description: activity.description,
            startTime: formatTime(activity.startTime),
            endTime: formatTime(activity.endTime),
        });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', wrapText: true };
    });

    return workbook.xlsx.writeBuffer();
}

/**
 * Format date to Indonesian locale
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Format time to HH:MM
 * @param {Date} time 
 * @returns {string}
 */
function formatTime(time) {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

module.exports = {
    generatePresenceExcel,
    generateActivityExcel,
};
