const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  emitIssueCreated,
  emitIssueUpdated,
  emitNewComment,
  emitUpvoteUpdated,
  sendNotificationToUser,
} = require('../services/socketService');

// @desc    Create a new civic issue
// @route   POST /api/v1/issues
// @access  Private (Citizen, Staff, Admin)
const createIssue = async (req, res, next) => {
  try {
    const { title, category, description, lat, lng, address } = req.body;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude coordinates are required.',
      });
    }

    // Collect image URLs from multer processing or body
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.url);
    } else if (req.file) {
      images = [req.file.url];
    } else if (req.body.imageUrl) {
      images = [req.body.imageUrl];
    }

    const issue = await Issue.create({
      title: title.trim(),
      category,
      description: description.trim(),
      images,
      location: {
        type: 'Point',
        coordinates: [parsedLng, parsedLat], // GeoJSON order: [lng, lat]
      },
      address: address ? address.trim() : 'Location pinned on map',
      status: 'Reported',
      reportedBy: req.user._id,
      statusHistory: [
        {
          status: 'Reported',
          changedBy: req.user._id,
          note: 'Civic issue reported by citizen',
          timestamp: new Date(),
        },
      ],
    });

    const populatedIssue = await Issue.findById(issue._id).populate(
      'reportedBy',
      'name email role avatar'
    );

    // Notify admins of new issue
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        sender: req.user._id,
        type: 'new_issue',
        issue: issue._id,
        title: `New Civic Issue Reported: ${category}`,
        message: `"${title}" has been reported at ${issue.address}.`,
      });
      sendNotificationToUser(admin._id, notification);
    }

    // Emit live socket event
    emitIssueCreated(populatedIssue);

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: populatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all issues with filters, search, and pagination
// @route   GET /api/v1/issues
// @access  Public / Private
const getIssues = async (req, res, next) => {
  try {
    const {
      category,
      status,
      search,
      myIssues,
      assignedToMe,
      nearLat,
      nearLng,
      maxDistance = 10000, // 10 km default
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter user's reported issues
    if (myIssues === 'true' && req.user) {
      query.reportedBy = req.user._id;
    }

    // Filter issues assigned to current staff
    if (assignedToMe === 'true' && req.user) {
      query.assignedTo = req.user._id;
    }

    // Text search in title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
      ];
    }

    // GeoJSON geospatial near query
    if (nearLat && nearLng) {
      const lat = parseFloat(nearLat);
      const lng = parseFloat(nearLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: parseInt(maxDistance, 10),
          },
        };
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'status') {
      sortOptions = { status: 1, createdAt: -1 };
    } else if (sortBy === 'upvotes') {
      sortOptions = { upvotes: -1, createdAt: -1 };
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (currentPage - 1) * pageLimit;

    const total = await Issue.countDocuments(query);
    const totalPages = Math.ceil(total / pageLimit);

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email role avatar')
      .populate('assignedTo', 'name email role phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: currentPage,
      totalPages,
      data: issues,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single issue detail by ID
// @route   GET /api/v1/issues/:id
// @access  Public / Private
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email role avatar')
      .populate('assignedTo', 'name email role phone')
      .populate('statusHistory.changedBy', 'name role email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Fetch related comments
    const comments = await Comment.find({ issue: issue._id })
      .populate('user', 'name role avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...issue.toObject(),
        comments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle upvote for an issue
// @route   POST /api/v1/issues/:id/upvote
// @access  Private
const upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const userId = req.user._id.toString();
    const alreadyUpvotedIndex = issue.upvotes.findIndex(
      (id) => id.toString() === userId
    );

    let userHasUpvoted = false;

    if (alreadyUpvotedIndex > -1) {
      // Remove upvote (toggle off)
      issue.upvotes.splice(alreadyUpvotedIndex, 1);
      userHasUpvoted = false;
    } else {
      // Add upvote
      issue.upvotes.push(req.user._id);
      userHasUpvoted = true;

      // Notify the issue author if not self
      if (issue.reportedBy.toString() !== userId) {
        const notification = await Notification.create({
          recipient: issue.reportedBy,
          sender: req.user._id,
          type: 'upvote',
          issue: issue._id,
          title: 'Issue Upvoted',
          message: `${req.user.name} upvoted your civic report "${issue.title}".`,
        });
        sendNotificationToUser(issue.reportedBy, notification);
      }
    }

    await issue.save();

    // Broadcast upvote update via sockets
    emitUpvoteUpdated(issue._id, issue.upvotes.length, userHasUpvoted, userId);

    res.status(200).json({
      success: true,
      message: userHasUpvoted ? 'Issue upvoted' : 'Upvote removed',
      data: {
        upvotesCount: issue.upvotes.length,
        userHasUpvoted,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to an issue
// @route   POST /api/v1/issues/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const comment = await Comment.create({
      issue: issue._id,
      user: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name role avatar'
    );

    // Notify issue reporter (if someone else commented)
    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: issue.reportedBy,
        sender: req.user._id,
        type: 'comment',
        issue: issue._id,
        title: 'New Comment on Your Issue',
        message: `${req.user.name} commented on "${issue.title}".`,
      });
      sendNotificationToUser(issue.reportedBy, notification);
    }

    // Also notify assigned staff if assigned and not the commenter
    if (
      issue.assignedTo &&
      issue.assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await Notification.create({
        recipient: issue.assignedTo,
        sender: req.user._id,
        type: 'comment',
        issue: issue._id,
        title: 'New Comment on Assigned Issue',
        message: `${req.user.name} commented on ticket "${issue.title}".`,
      });
      sendNotificationToUser(issue.assignedTo, notification);
    }

    // Broadcast new comment to room
    emitNewComment(issue._id, populatedComment);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get comments for an issue
// @route   GET /api/v1/issues/:id/comments
// @access  Public / Private
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ issue: req.params.id })
      .populate('user', 'name role avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an issue (Citizen can delete if still 'Reported'; Admin can delete anytime)
// @route   DELETE /api/v1/issues/:id
// @access  Private (Citizen owner or Admin)
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Check permissions
    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this issue.',
      });
    }

    // Citizen can only delete if still in 'Reported' status
    if (isOwner && !isAdmin && issue.status !== 'Reported') {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete an issue that is already assigned or in progress.',
      });
    }

    await Comment.deleteMany({ issue: issue._id });
    await Notification.deleteMany({ issue: issue._id });
    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  upvoteIssue,
  addComment,
  getComments,
  deleteIssue,
};
