const express = require('express');
const authRoutes = require('./auth.routes');
const presenceRoutes = require('./presence.routes');
const activityRoutes = require('./activity.routes');
const leaveRoutes = require('./leave.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/presence', presenceRoutes);
router.use('/activities', activityRoutes);
router.use('/leave-requests', leaveRoutes);

module.exports = router;
