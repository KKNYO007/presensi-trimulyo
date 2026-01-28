const express = require('express');
const presenceService = require('../services/presence.service');
const auth = require('../middleware/auth');
const { uploadSelfie } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * POST /api/presence/check-in
 * Submit check-in with selfie and location
 */
router.post('/check-in', uploadSelfie, async (req, res, next) => {
    console.log('MASUK ROUTE CHECK-IN');
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Lokasi (latitude dan longitude) wajib diisi',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Foto selfie wajib diupload',
            });
        }

        const { uploadToSupabase } = require('../utils/storage');
        const selfieUrl = await uploadToSupabase(req.file.buffer, 'selfies', req.file.originalname);

        const presence = await presenceService.checkIn(req.user.id, {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            selfieUrl,
        });

        res.status(201).json({
            success: true,
            message: 'Presensi masuk berhasil',
            data: presence,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/presence/check-out
 * Submit check-out
 */
router.post('/check-out', async (req, res, next) => {
    try {
        const presence = await presenceService.checkOut(req.user.id);

        res.json({
            success: true,
            message: 'Presensi keluar berhasil',
            data: presence,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/presence/today
 * Get today's presence status
 */
router.get('/today', async (req, res, next) => {
    try {
        const presence = await presenceService.getTodayPresence(req.user.id);

        res.json({
            success: true,
            data: presence,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/presence/history
 * Get presence history with optional date range
 */
router.get('/history', async (req, res, next) => {
    try {
        const { startDate, endDate, page, limit } = req.query;

        const result = await presenceService.getPresenceHistory(req.user.id, {
            startDate,
            endDate,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/presence/export
 * Export presence data as Excel
 */
router.get('/export', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const buffer = await presenceService.exportPresence(req.user.id, {
            startDate,
            endDate,
        });

        const filename = `presensi_${req.user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        next(error);
    }
});



/**
 * GET /api/presence/:id
 * Get presence detail by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Skip if ID is not a valid UUID or special keyword like 'today', 'history', 'export'
        if (['today', 'history', 'export', 'check-in', 'check-out'].includes(id)) {
            return next();
        }

        const presence = await presenceService.getPresenceById(req.user.id, id);

        res.json({
            success: true,
            data: presence,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
