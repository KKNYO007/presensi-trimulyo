const express = require('express');
const authService = require('../services/auth.service');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi',
            });
        }

        const result = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Login berhasil',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
