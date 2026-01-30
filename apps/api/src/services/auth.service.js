const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User data and token
 */
async function login(email, password) {
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw { statusCode: 401, message: 'Email atau password salah' };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
        throw { statusCode: 401, message: 'Email atau password salah' };
    }

    // Generate token
    const token = generateToken({
        userId: user.id,
        email: user.email,
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token,
    };
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
async function getProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            jabatan: true,
            phoneNumber: true,
            avatarUrl: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw { statusCode: 404, message: 'User tidak ditemukan' };
    }

    return user;
}

module.exports = {
    login,
    getProfile,
    updateAvatar,
    updateProfile,
    updatePassword,
};

/**
 * Update user avatar
 * @param {string} userId - User ID
 * @param {string} avatarUrl - URL of the uploaded avatar
 * @returns {Promise<Object>} Updated user data
 */
async function updateAvatar(userId, avatarUrl) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
            id: true,
            email: true,
            name: true,
            jabatan: true,
            phoneNumber: true,
            avatarUrl: true,
            createdAt: true,
        },
    });

    return user;
}

/**
 * Update user profile (phone number)
 * @param {string} userId - User ID
 * @param {string} phoneNumber - New phone number
 * @returns {Promise<Object>} Updated user data
 */
async function updateProfile(userId, phoneNumber) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { phoneNumber },
        select: {
            id: true,
            email: true,
            name: true,
            jabatan: true,
            phoneNumber: true,
            avatarUrl: true,
            createdAt: true,
        },
    });

    return user;
}

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user data
 */
async function updatePassword(userId, currentPassword, newPassword) {
    const { hashPassword } = require('../utils/password');

    // Get user with current password
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw { statusCode: 404, message: 'User tidak ditemukan' };
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
        throw { statusCode: 401, message: 'Password saat ini salah' };
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
        select: {
            id: true,
            email: true,
            name: true,
            jabatan: true,
            phoneNumber: true,
            avatarUrl: true,
            createdAt: true,
        },
    });

    return updatedUser;
}
