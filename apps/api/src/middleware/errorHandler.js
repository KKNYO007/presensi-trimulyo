/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    const fs = require('fs');
    fs.appendFileSync('error.log', `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`);

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan server';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * Not found handler
 */
function notFound(req, res, next) {
    res.status(404).json({
        success: false,
        message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
    });
}

module.exports = {
    errorHandler,
    notFound,
};
