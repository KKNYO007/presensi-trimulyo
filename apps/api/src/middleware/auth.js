const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 */
async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan',
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                jabatan: true,
                phoneNumber: true,
                avatarUrl: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User tidak ditemukan',
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token sudah kadaluarsa',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid',
            });
        }

        console.error('Auth Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
}

module.exports = auth;
