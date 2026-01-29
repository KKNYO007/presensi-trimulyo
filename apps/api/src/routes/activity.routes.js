const express = require('express');
const activityService = require('../services/activity.service');
const auth = require('../middleware/auth');
const { uploadActivityPhotos } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * POST /api/activities
 * Create new activity log
 */
router.post('/', uploadActivityPhotos, async (req, res, next) => {
    try {
        const { title, description, startTime, endTime } = req.body;

        if (!title || !description || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Judul, deskripsi, jam mulai, dan jam selesai wajib diisi',
            });
        }

        // Get photo URLs from uploaded files
        const photoUrls = [];
        if (req.files && req.files.length > 0) {
            const { uploadToSupabase } = require('../utils/storage');
            for (const file of req.files) {
                const url = await uploadToSupabase(file.buffer, 'activities', file.originalname);
                photoUrls.push(url);
            }
        }

        const activity = await activityService.createActivity(req.user.id, {
            title,
            description,
            startTime,
            endTime,
            photoUrls,
        });

        res.status(201).json({
            success: true,
            message: 'Kegiatan berhasil disimpan',
            data: activity,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/activities
 * Get user's activities
 */
router.get('/', async (req, res, next) => {
    try {
        const { startDate, endDate, page, limit } = req.query;

        const result = await activityService.getActivities(req.user.id, {
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
 * GET /api/activities/export
 * Export activities as Excel
 */
router.get('/export', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const buffer = await activityService.exportActivities(req.user.id, {
            startDate,
            endDate,
        });

        const safeName = req.user.name.replace(/\s+/g, '_');
        const filename = `${safeName}_Aktivitas_${startDate}_${endDate}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
