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

/**
 * POST /api/auth/avatar
 * Update user avatar
 */
const { uploadAvatar } = require('../middleware/upload');
router.post('/avatar', auth, uploadAvatar, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File avatar wajib diupload',
            });
        }

        const { uploadToSupabase } = require('../utils/storage');
        // Reuse 'selfies' bucket or use a new 'avatars' bucket.
        // As per plan, reuse 'selfies' for simplicity if permissions allow, or just 'avatars'.
        // Plan said: reuse 'selfies'.
        const avatarUrl = await uploadToSupabase(req.file.buffer, 'selfies', req.file.originalname);

        const updatedUser = await authService.updateAvatar(req.user.id, avatarUrl);

        res.json({
            success: true,
            message: 'Avatar berhasil diupdate',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile (phone number)
 */
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Nomor HP wajib diisi',
            });
        }

        const updatedUser = await authService.updateProfile(req.user.id, phoneNumber);

        res.json({
            success: true,
            message: 'Profil berhasil diupdate',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/auth/password
 * Update user password
 */
router.put('/password', auth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password saat ini dan password baru wajib diisi',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password baru minimal 6 karakter',
            });
        }

        const updatedUser = await authService.updatePassword(req.user.id, currentPassword, newPassword);

        res.json({
            success: true,
            message: 'Password berhasil diupdate',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
