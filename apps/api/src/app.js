require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend dev servers
    credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log('');
    console.log('🏛️  ==========================================');
    console.log('    PRESENSI TRIMULYO API');
    console.log('    ==========================================');
    console.log('');
    console.log(`    🚀 Server running on port ${PORT}`);
    console.log(`    📡 Environment: ${config.nodeEnv}`);
    console.log(`    🔗 Base URL: http://localhost:${PORT}`);
    console.log(`    📍 API URL: http://localhost:${PORT}/api`);
    console.log('');
    console.log('    Endpoints:');
    console.log('    - POST /api/auth/login');
    console.log('    - GET  /api/auth/me');
    console.log('    - POST /api/presence/check-in');
    console.log('    - POST /api/presence/check-out');
    console.log('    - GET  /api/presence/today');
    console.log('    - GET  /api/presence/history');
    console.log('    - GET  /api/presence/export');
    console.log('    - POST /api/activities');
    console.log('    - GET  /api/activities');
    console.log('    - GET  /api/activities/export');
    console.log('    - POST /api/leave-requests');
    console.log('    - GET  /api/leave-requests');
    console.log('');
    console.log('🏛️  ==========================================');
    console.log('');
});

module.exports = app;
