const express = require('express');
const { body } = require('express-validator');
const {
  getMyAssignedIssues,
  updateIssueStatus,
} = require('../controllers/staffController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { upload, processImageUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/issues', protect, authorize('staff', 'admin'), getMyAssignedIssues);

router.patch(
  '/issues/:id/status',
  protect,
  authorize('staff', 'admin'),
  upload.single('proofImage'),
  processImageUpload,
  [
    body('status')
      .trim()
      .isIn(['In Progress', 'Resolved'])
      .withMessage('Staff can only change status to "In Progress" or "Resolved"'),
  ],
  validate,
  updateIssueStatus
);

module.exports = router;
