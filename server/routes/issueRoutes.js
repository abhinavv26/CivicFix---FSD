const express = require('express');
const { body } = require('express-validator');
const {
  createIssue,
  getIssues,
  getIssueById,
  upvoteIssue,
  addComment,
  getComments,
  deleteIssue,
} = require('../controllers/issueController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload, processImageUpload } = require('../middleware/upload');

const router = express.Router();

router.post(
  '/',
  protect,
  upload.array('images', 5),
  processImageUpload,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 4, max: 120 })
      .withMessage('Title must be between 4 and 120 characters'),
    body('category')
      .trim()
      .isIn(['Pothole', 'Garbage', 'Streetlight', 'Water Leakage', 'Other'])
      .withMessage('Category must be one of: Pothole, Garbage, Streetlight, Water Leakage, Other'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('lat').notEmpty().withMessage('Latitude coordinate is required'),
    body('lng').notEmpty().withMessage('Longitude coordinate is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],
  validate,
  createIssue
);

router.get('/', optionalAuth, getIssues);
router.get('/:id', optionalAuth, getIssueById);
router.post('/:id/upvote', protect, upvoteIssue);

router.post(
  '/:id/comments',
  protect,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content cannot be empty')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters'),
  ],
  validate,
  addComment
);

router.get('/:id/comments', optionalAuth, getComments);
router.delete('/:id', protect, deleteIssue);

module.exports = router;
