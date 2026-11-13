const express = require('express');
const { body } = require('express-validator');
const {
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.put(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),
    body('phone').optional().trim(),
  ],
  validate,
  updateProfile
);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],
  validate,
  changePassword
);

module.exports = router;
