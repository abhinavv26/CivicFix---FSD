const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const {
  emitIssueUpdated,
  sendNotificationToUser,
} = require('../services/socketService');

// @desc    Get issues assigned to current staff member
// @route   GET /api/v1/staff/issues
// @access  Private (Staff only)
const getMyAssignedIssues = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;

    const query = { assignedTo: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { address: searchRegex }];
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (currentPage - 1) * pageLimit;

    const total = await Issue.countDocuments(query);
    const totalPages = Math.ceil(total / pageLimit);

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email role phone avatar')
      .sort({ updatedAt: -1 })
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

// @desc    Update status of an assigned issue (In Progress, Resolved) with optional proof image
// @route   PATCH /api/v1/staff/issues/:id/status
// @access  Private (Staff only)
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Ensure this issue is assigned to this staff member (or staff is admin)
    if (
      req.user.role !== 'admin' &&
      (!issue.assignedTo || issue.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to update issues assigned to you.',
      });
    }

    const validStatuses = ['In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status update. Allowed statuses: ${validStatuses.join(', ')}`,
      });
    }

    // Capture proof image URL if uploaded
    let proofImageUrl = '';
    if (req.file) {
      proofImageUrl = req.file.url;
    } else if (req.body.proofImageUrl) {
      proofImageUrl = req.body.proofImageUrl;
    }

    // Update issue fields
    issue.status = status;
    if (proofImageUrl) {
      issue.proofImage = proofImageUrl;
    }

    // Add status history record
    issue.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note ? note.trim() : `Status updated to ${status} by staff member`,
      proofImage: proofImageUrl || '',
      timestamp: new Date(),
    });

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role avatar')
      .populate('assignedTo', 'name email role phone')
      .populate('statusHistory.changedBy', 'name role email');

    // Notify the citizen reporter
    const notification = await Notification.create({
      recipient: issue.reportedBy,
      sender: req.user._id,
      type: 'status_change',
      issue: issue._id,
      title: `Issue Status Updated: ${status}`,
      message: `Your civic report "${issue.title}" has been updated to "${status}".`,
    });
    sendNotificationToUser(issue.reportedBy, notification);

    // Emit live update
    emitIssueUpdated(populatedIssue);

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: populatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyAssignedIssues,
  updateIssueStatus,
};
