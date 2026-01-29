const ExcelJS = require('exceljs');

/**
 * Generate Excel file from presence data (New Format with User Header)
 * @param {Array} presences - Array of presence records
 * @param {Object} user - User object
 * @param {string} startDate - Start Date String
 * @param {string} endDate - End Date String
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generatePresenceExcel(presences, user, startDate, endDate) {
    console.log('--- GENERATING EXCEL (FINAL FIX with DATES) ---');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Presensi Trimulyo';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Rekap Presensi');

    // Determine Period String (Month Year)
    const dateObj = new Date(startDate);
    const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // -- User Info Section --
    // Headers
    worksheet.getCell('B1').value = 'Nama';
    worksheet.getCell('C1').value = 'Jabatan';
    worksheet.getCell('D1').value = 'Bulan';

    // Values
    worksheet.getCell('B2').value = user?.name || '-';
    worksheet.getCell('C2').value = user?.jabatan || '-';
    worksheet.getCell('D2').value = monthYear;

    // Styling for User Info Headers
    ['B1', 'C1', 'D1'].forEach(key => {
        const cell = worksheet.getCell(key);
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD4A853' }, // Golden accent
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Styling for User Info Values
    ['B2', 'C2', 'D2'].forEach(key => {
        const cell = worksheet.getCell(key);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // -- Main Table --
    // Header Row (Row 4)
    const headerRow = worksheet.getRow(4);
    headerRow.values = ['No', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Jarak (km)'];
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD4A853' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Add data rows
    presences.forEach((presence, index) => {
        const row = worksheet.addRow([
            index + 1,
            formatDate(presence.date),
            formatTime(presence.checkInTime),
            formatTime(presence.checkOutTime),
            presence.status,
            presence.distanceKm?.toFixed(2) || '-',
        ]);

        // Conditional Formatting: Red Text if Distance > 2 km
        if (presence.distanceKm > 2) {
            row.getCell(6).font = { color: { argb: 'FFFF0000' } }; // Red font
        }

        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // Set Column Widths
    worksheet.getColumn(1).width = 5;  // No
    worksheet.getColumn(2).width = 25; // Tanggal
    worksheet.getColumn(3).width = 15; // Jam Masuk
    worksheet.getColumn(4).width = 15; // Jam Keluar
    worksheet.getColumn(5).width = 20; // Status
    worksheet.getColumn(6).width = 15; // Jarak

    return workbook.xlsx.writeBuffer();
}

/**
 * Generate Excel file from activity data (Grouped by Date, Fill Empty Dates)
 * @param {Array} activities - Array of activity records
 * @param {Object} user - User object
 * @param {string} startDate - Start of range
 * @param {string} endDate - End of range
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateActivityExcel(activities, user, startDate, endDate) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Presensi Trimulyo';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Log Kegiatan');

    // -- User Info Section (Top Header) --
    worksheet.getCell('B1').value = 'Nama';
    worksheet.getCell('C1').value = 'Jabatan';
    worksheet.getCell('B2').value = user?.name || '-';
    worksheet.getCell('C2').value = user?.jabatan || '-';

    // Styling for User Info
    ['B1', 'C1'].forEach(key => {
        const cell = worksheet.getCell(key);
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD4A853' }, // Golden accent
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    ['B2', 'C2'].forEach(key => {
        const cell = worksheet.getCell(key);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Start data from row 5
    let currentRowIndex = 5;

    // Set Column Widths globally
    worksheet.getColumn(1).width = 5;  // No
    worksheet.getColumn(2).width = 15; // Jam
    worksheet.getColumn(3).width = 30; // Kegiatan
    worksheet.getColumn(4).width = 50; // Deskripsi
    worksheet.getColumn(5).width = 20; // Extra/Foto placeholder

    // Iterate through EVERY day in range
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Safety check for loop
    if (start > end) {
        end.setTime(start.getTime());
    }

    // Helper to format date consistent with how we stored/compare
    // We iterate using Date object logic, but compare using string format

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDateString = formatDate(d);

        // Find activities for this day
        const dayActivities = activities.filter(a => formatDate(a.date) === currentDateString);

        if (currentRowIndex > 5) {
            currentRowIndex++; // Add blank row between groups
        }

        // 1. Date Header Row
        const dateRow = worksheet.getRow(currentRowIndex);
        dateRow.getCell(1).value = currentDateString;
        dateRow.getCell(1).font = { bold: true, size: 12 };
        worksheet.mergeCells(`A${currentRowIndex}:E${currentRowIndex}`);
        dateRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
        dateRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' }
        };
        currentRowIndex++;

        // 2. Column Header Row
        const folderHeaderRow = worksheet.getRow(currentRowIndex);
        folderHeaderRow.values = ['No', 'Jam', 'Kegiatan', 'Deskripsi', 'Foto (Link)'];
        folderHeaderRow.font = { bold: true };
        folderHeaderRow.eachCell((cell, colNumber) => {
            if (colNumber <= 5) { // Limit styling to columns we use
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD4A853' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            }
        });
        currentRowIndex++;

        // 3. Activity Rows (if any)
        if (dayActivities.length > 0) {
            dayActivities.forEach((activity, idx) => {
                const timeRange = `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`;
                const photoLink = (activity.photoUrls && activity.photoUrls.length > 0) ? 'Lihat Foto' : '-';

                const row = worksheet.getRow(currentRowIndex);
                row.getCell(1).value = idx + 1; // Numbering resets daily
                row.getCell(2).value = timeRange;
                row.getCell(3).value = activity.title;
                row.getCell(4).value = activity.description;

                if (photoLink !== '-') {
                    row.getCell(5).value = activity.photoUrls[0] || '-';
                } else {
                    row.getCell(5).value = '-';
                }

                // Styling
                row.eachCell((cell, colNumber) => {
                    if (colNumber <= 5) {
                        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        if (colNumber === 1 || colNumber === 2) {
                            cell.alignment = { vertical: 'top', horizontal: 'center' };
                        }
                    }
                });

                // Hyperlink
                if (photoLink !== '-' && activity.photoUrls && activity.photoUrls.length > 0) {
                    const cell = row.getCell(5);
                    cell.value = { text: 'Link Foto', hyperlink: activity.photoUrls[0] };
                    cell.font = { color: { argb: 'FF0000FF' }, underline: true };
                }

                currentRowIndex++;
            });
        }
    }

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
        timeZone: 'Asia/Jakarta',
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
        timeZone: 'Asia/Jakarta',
    });
}

module.exports = {
    generatePresenceExcel,
    generateActivityExcel,
};
