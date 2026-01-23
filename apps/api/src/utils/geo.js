const config = require('../config/env');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance from office
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistanceFromOffice(latitude, longitude) {
    return calculateDistance(
        latitude,
        longitude,
        config.office.lat,
        config.office.lng
    );
}

/**
 * Check if location is within office radius
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {boolean} True if within radius
 */
function isWithinOfficeRadius(latitude, longitude) {
    const distance = calculateDistanceFromOffice(latitude, longitude);
    return distance <= config.office.maxDistanceKm;
}

module.exports = {
    calculateDistance,
    calculateDistanceFromOffice,
    isWithinOfficeRadius,
};
