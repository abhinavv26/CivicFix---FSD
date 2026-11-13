import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusTimeline from '../components/issues/StatusTimeline';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle,
  Send,
  Trash2,
  Share2,
} from 'lucide-react';

export const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();
  const { socket, joinIssue, leaveIssue } = useSocket();
  const { addToast } = useNotification();

  // Fetch issue details
  const { data: issue, loading, error, refetch, setData } = useFetch(`/issues/${id}`);

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Join issue room for live comments and status updates
  useEffect(() => {
    if (id) {
      joinIssue(id);
    }
    return () => {
      if (id) {
        leaveIssue(id);
      }
    };
  }, [id, joinIssue, leaveIssue]);

  // Socket listeners for real-time updates on this issue
  useEffect(() => {
    if (!socket || !id) return;

    const handleIssueUpdate = (updatedIssue) => {
      if (updatedIssue._id === id) {
        console.log('[RealTime Detail] Issue updated:', updatedIssue);
        setData((prev) => ({
          ...prev,
          ...updatedIssue,
        }));
      }
    };

    const handleNewComment = (comment) => {
      console.log('[RealTime Detail] New comment received:', comment);
      setData((prev) => {
        if (!prev) return prev;
        const existingComments = prev.comments || [];
        // Avoid duplicate if added locally
        if (existingComments.some((c) => c._id === comment._id)) return prev;
        return {
          ...prev,
          comments: [...existingComments, comment],
        };
      });
    };

    const handleUpvoted = ({ issueId, upvotesCount, userHasUpvoted, userId }) => {
      if (issueId === id) {
        setData((prev) => {
          if (!prev) return prev;
          let newUpvotes = [...(prev.upvotes || [])];
          if (userHasUpvoted) {
            if (!newUpvotes.includes(userId)) newUpvotes.push(userId);
          } else {
            newUpvotes = newUpvotes.filter((uid) => uid.toString() !== userId.toString());
          }
          return { ...prev, upvotes: newUpvotes };
        });
      }
    };

    socket.on('issue:updated', handleIssueUpdate);
    socket.on('comment:new', handleNewComment);
    socket.on('issue:upvoted', handleUpvoted);

    return () => {
      socket.off('issue:updated', handleIssueUpdate);
      socket.off('comment:new', handleNewComment);
      socket.off('issue:upvoted', handleUpvoted);
    };
  }, [socket, id, setData]);

  // Upvote toggle handler
  const handleToggleUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/issues/${id}/upvote`);
      if (res.data.success) {
        // State updated optimistically or via socket
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    }
  };

  // Submit comment handler
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCommentSubmitting(true);
    try {
      const res = await api.post(`/issues/${id}/comments`, { content: newComment.trim() });
      if (res.data.success) {
        setNewComment('');
        // Note: socket will also append comment
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete issue handler
  const handleDeleteIssue = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/issues/${id}`);
      if (res.data.success) {
        addToast({
          title: 'Issue Deleted',
          message: 'The civic issue ticket was removed.',
          type: 'info',
        });
        navigate(role === 'admin' ? '/admin/issues' : '/citizen');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-charcoal-500">Loading civic ticket record...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="font-serif text-xl font-bold text-charcoal-900 dark:text-sand-50">
          Ticket Not Found
        </h2>
        <p className="text-xs text-charcoal-500">{error || 'This issue may have been removed.'}</p>
        <Link
          to="/explore"
          className="inline-block mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Map
        </Link>
      </div>
    );
  }

  const userId = user?._id || user?.id;
  const hasUpvoted = (issue.upvotes || []).some((uid) => uid.toString() === userId?.toString());
  const isOwner = issue.reportedBy?._id?.toString() === userId?.toString();
  const canDelete = (isOwner && issue.status === 'Reported') || role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 dark:hover:text-sand-200 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to List</span>
        </button>

        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Main Issue Details, Images, Comments */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Issue Header Card */}
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CategoryBadge category={issue.category} />
                <StatusBadge status={issue.status} />
              </div>

              {/* Upvote Button */}
              <button
                type="button"
                onClick={handleToggleUpvote}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  hasUpvoted
                    ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                    : 'bg-sand-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-sand-200 hover:bg-sand-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
                <span>{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                <span className="ml-0.5 opacity-80">({issue.upvotes?.length || 0})</span>
              </button>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 leading-tight">
              {issue.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500 dark:text-charcoal-400 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                <span className="font-medium text-charcoal-700 dark:text-sand-300">
                  {issue.address}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                    dateStyle: 'medium',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Reported by {issue.reportedBy?.name || 'Citizen'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-sand-100 dark:border-charcoal-700">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500 mb-1.5">
                Issue Description
              </h4>
              <p className="text-sm text-charcoal-700 dark:text-charcoal-200 leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>

            {/* Image Gallery */}
            {issue.images && issue.images.length > 0 && (
              <div className="pt-3 border-t border-sand-100 dark:border-charcoal-700">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500 mb-2">
                  Photographic Evidence
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issue.images.map((imgUrl, i) => (
                    <a
                      key={i}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-28 rounded-xl overflow-hidden border border-sand-200 dark:border-charcoal-700 group"
                    >
                      <img
                        src={imgUrl}
                        alt={`Evidence ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proof of Resolution (if resolved) */}
            {issue.proofImage && (
              <div className="pt-4 border-t border-emerald-100 dark:border-emerald-950/60 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Proof of Work & Resolution</span>
                </div>
                <img
                  src={issue.proofImage}
                  alt="Proof of work"
                  className="w-full max-h-72 object-cover rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Comments & Discussion Section */}
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-sand-100 dark:border-charcoal-700 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
                  Citizen Discussion & Field Notes
                </h3>
              </div>
              <span className="text-xs text-charcoal-400">
                {issue.comments?.length || 0} comment(s)
              </span>
            </div>

            {/* Comment Thread */}
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {!issue.comments || issue.comments.length === 0 ? (
                <p className="text-xs text-charcoal-500 text-center py-4">
                  No comments posted yet. Be the first to share an update!
                </p>
              ) : (
                issue.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-3 rounded-xl bg-sand-50 dark:bg-charcoal-700/50 border border-sand-200/60 dark:border-charcoal-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-charcoal-900 dark:text-sand-100">
                          {comment.user?.name || 'Member'}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-sand-200/70 dark:bg-charcoal-600 text-charcoal-600 dark:text-sand-300">
                          {comment.user?.role || 'Citizen'}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal-400">
                        {new Date(comment.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-700 dark:text-charcoal-200 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? 'Write a comment or status observation...'
                    : 'Log in to join the civic discussion...'
                }
                disabled={!isAuthenticated || commentSubmitting}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/60 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || !newComment.trim() || commentSubmitting}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{commentSubmitting ? 'Posting...' : 'Post'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Timeline & Assigned Crew Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Timeline */}
          <StatusTimeline
            statusHistory={issue.statusHistory || []}
            currentStatus={issue.status}
          />

          {/* Assigned Crew Card */}
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500">
              Assigned Field Staff
            </h4>

            {issue.assignedTo ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-sand-50 dark:bg-charcoal-700/50 border border-sand-200 dark:border-charcoal-600">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                  {issue.assignedTo.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-900 dark:text-sand-100 truncate">
                    {issue.assignedTo.name}
                  </p>
                  <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400">
                    Municipal Field Officer
                  </p>
                  {issue.assignedTo.phone && (
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-0.5">
                      {issue.assignedTo.phone}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-charcoal-500 italic">
                Awaiting administrator assignment to municipal ward team.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteIssue}
        title="Delete this Civic Ticket?"
        message="This action will permanently delete the ticket, all comments, and history logs from the platform."
        confirmText="Confirm Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default IssueDetail;
