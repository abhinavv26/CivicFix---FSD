import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';
import IssueCard from '../components/issues/IssueCard';
import IssueFilterBar from '../components/issues/IssueFilterBar';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { CardSkeleton, StatCardSkeleton } from '../components/common/LoadingSkeleton';
import { PlusCircle, CheckCircle2, Clock, Wrench, AlertCircle, Trash2 } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Deletion modal state
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use custom hook useFetch
  const {
    data: issuesData,
    loading,
    error,
    refetch,
    setData,
  } = useFetch('/issues', {
    params: {
      myIssues: 'true',
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      search: search || undefined,
      sortBy,
      limit: 50,
    },
  });

  const issues = Array.isArray(issuesData) ? issuesData : issuesData?.data || [];

  // Socket listener for live updates
  useEffect(() => {
    if (!socket) return;

    const handleListUpdate = (update) => {
      console.log('[RealTime Citizen] Received list update:', update);
      refetch();
    };

    socket.on('issue:list_update', handleListUpdate);

    return () => {
      socket.off('issue:list_update', handleListUpdate);
    };
  }, [socket, refetch]);

  // Handle upvote toggle
  const handleUpvote = async (issueId) => {
    try {
      const res = await api.post(`/issues/${issueId}/upvote`);
      if (res.data.success) {
        setData((prev) => {
          const list = Array.isArray(prev) ? prev : prev?.data || [];
          const updated = list.map((item) => {
            if (item._id === issueId) {
              const currentUpvotes = item.upvotes || [];
              const hasUpvoted = currentUpvotes.includes(user?._id || user?.id);
              return {
                ...item,
                upvotes: hasUpvoted
                  ? currentUpvotes.filter((id) => id !== (user?._id || user?.id))
                  : [...currentUpvotes, user?._id || user?.id],
              };
            }
            return item;
          });
          return Array.isArray(prev) ? updated : { ...prev, data: updated };
        });
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  // Handle issue deletion
  const confirmDelete = async () => {
    if (!issueToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/issues/${issueToDelete._id}`);
      if (res.data.success) {
        setData((prev) => {
          const list = Array.isArray(prev) ? prev : prev?.data || [];
          const filtered = list.filter((item) => item._id !== issueToDelete._id);
          return Array.isArray(prev) ? filtered : { ...prev, data: filtered };
        });
        setIssueToDelete(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalReported = issues.length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Citizen Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Track real-time progress on your submitted municipal reports across Mumbai.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
                  Total Reported
                </p>
                <p className="font-serif text-2xl font-bold text-charcoal-900 dark:text-sand-50 mt-1">
                  {totalReported}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-charcoal-700 flex items-center justify-center text-charcoal-600 dark:text-sand-300">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
                  In Progress
                </p>
                <p className="font-serif text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {inProgressCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
                  Resolved Tickets
                </p>
                <p className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {resolvedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Search Bar */}
      <IssueFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={true}
      />

      {/* Issue Items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No reported issues found"
          description="You haven't reported any civic issues matching the current filter."
          actionLabel="Report Your First Issue"
          actionLink="/report"
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {issues.map((issue) => {
            const hasUpvoted = (issue.upvotes || []).includes(user?._id || user?.id);

            return (
              <div key={issue._id} className="relative group">
                <IssueCard
                  issue={issue}
                  onUpvote={handleUpvote}
                  userHasUpvoted={hasUpvoted}
                />

                {/* If issue is still in Reported status, citizen has policy permission to delete */}
                {issue.status === 'Reported' && (
                  <button
                    onClick={() => setIssueToDelete(issue)}
                    title="Delete your reported issue"
                    className="absolute top-2 right-12 z-20 p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Issue Deletion */}
      <ConfirmationModal
        isOpen={Boolean(issueToDelete)}
        onClose={() => setIssueToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Civic Report?"
        message={`Are you sure you want to delete "${issueToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Ticket"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CitizenDashboard;
