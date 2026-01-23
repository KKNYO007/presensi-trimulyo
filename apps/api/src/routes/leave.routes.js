const express = require('express');
const leaveService = require('../services/leave.service');
const auth = require('../middleware/auth');
const { LEAVE_TYPE } = require('../config/constants');

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * POST /api/leave-requests
 * Submit new leave request
 */
router.post('/', async (req, res, next) => {
    try {
        const { type, startDate, endDate, notes } = req.body;

        if (!type || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Tipe izin, tanggal mulai, dan tanggal selesai wajib diisi',
            });
        }

        // Validate leave type
        const validTypes = Object.values(LEAVE_TYPE);
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Tipe izin tidak valid. Gunakan: ${validTypes.join(', ')}`,
            });
        }

        const leaveRequest = await leaveService.createLeaveRequest(req.user.id, {
            type,
            startDate,
            endDate,
            notes,
        });

        res.status(201).json({
            success: true,
            message: 'Pengajuan izin berhasil dikirim',
            data: leaveRequest,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/leave-requests
 * Get user's leave requests
 */
router.get('/', async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;

        const result = await leaveService.getLeaveRequests(req.user.id, {
            status,
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

module.exports = router;
