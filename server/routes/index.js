const express = require('express');
const authRoutes = require('./authRoutes');
const issueRoutes = require('./issueRoutes');
const staffRoutes = require('./staffRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CivicFix API v1 is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);

module.exports = router;
