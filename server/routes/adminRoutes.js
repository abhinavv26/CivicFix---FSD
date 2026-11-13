const express = require('express');
const { body } = require('express-validator');
const {
  getAdminStats,
  getStaffList,
  assignIssue,
  updateIssueStatusAdmin,
  getUsers,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Admin-only guard on all endpoints in this router
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/staff-list', getStaffList);

router.patch(
  '/issues/:id/assign',
  [body('assignedTo').notEmpty().withMessage('Staff ID is required to assign ticket')],
  validate,
  assignIssue
);

router.patch(
  '/issues/:id/status',
  [
    body('status')
      .trim()
      .isIn(['Reported', 'Assigned', 'In Progress', 'Resolved'])
      .withMessage('Valid status required: Reported, Assigned, In Progress, Resolved'),
  ],
  validate,
  updateIssueStatusAdmin
);

router.get('/users', getUsers);

router.patch(
  '/users/:id/role',
  [
    body('role')
      .trim()
      .isIn(['citizen', 'staff', 'admin'])
      .withMessage('Role must be one of: citizen, staff, admin'),
  ],
  validate,
  updateUserRole
);

router.patch(
  '/users/:id/status',
  [body('isActive').isBoolean().withMessage('isActive must be a boolean true/false')],
  validate,
  toggleUserStatus
);

module.exports = router;
