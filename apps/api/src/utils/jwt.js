const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT token for a user
 * @param {Object} payload - Token payload (userId, nip)
 * @returns {string} JWT token
 */
function generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
}

module.exports = {
    generateToken,
    verifyToken,
};
