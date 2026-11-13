import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton, StatCardSkeleton } from '../components/common/LoadingSkeleton';
import {
  HardHat,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Edit3,
  Camera,
  X,
  Send,
  Search,
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useNotification();

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Status update modal state
  const [updatingIssue, setUpdatingIssue] = useState(null);
  const [nextStatus, setNextStatus] = useState('In Progress');
  const [workNote, setWorkNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assigned issues
  const {
    data: issuesData,
    loading,
    error,
    refetch,
    setData,
  } = useFetch('/staff/issues', {
    params: {
      status: statusFilter !== 'All' ? statusFilter : undefined,
      search: search || undefined,
      limit: 50,
    },
  });

  const issues = Array.isArray(issuesData) ? issuesData : issuesData?.data || [];

  // Listen to live updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => refetch();
    socket.on('issue:updated', handleUpdate);
    socket.on('issue:list_update', handleUpdate);
    return () => {
      socket.off('issue:updated', handleUpdate);
      socket.off('issue:list_update', handleUpdate);
    };
  }, [socket, refetch]);

  // Proof file selection
  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  // Submit status update
  const handleSubmitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!updatingIssue) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', nextStatus);
      if (workNote.trim()) formData.append('note', workNote.trim());
      if (proofFile) formData.append('proofImage', proofFile);

      const res = await api.patch(`/staff/issues/${updatingIssue._id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast({
          title: 'Ticket Progress Updated',
          message: `Ticket "${updatingIssue.title}" status changed to ${nextStatus}`,
          type: 'status_change',
        });
        setUpdatingIssue(null);
        setProofFile(null);
        setProofPreview('');
        setWorkNote('');
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedCount = issues.filter((i) => i.status === 'Assigned').length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Field Worker Workstation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Assigned Municipal Tasks
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Officer {user?.name}: manage on-site repairs, log work notes, and upload resolution proof.
          </p>
        </div>

        <div className="text-xs font-medium text-charcoal-500">
          Queue: <strong className="text-charcoal-800 dark:text-sand-100">{issues.length}</strong> active tickets
        </div>
      </div>

      {/* KPI Cards */}
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
                <p className="text-xs font-medium text-charcoal-500">New Assignments</p>
                <p className="font-serif text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {assignedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500">Work in Progress</p>
                <p className="font-serif text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {inProgressCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500">Resolved by You</p>
                <p className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {resolvedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned tickets by title or location..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-sand-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-sand-300 hover:bg-sand-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No assigned tickets in queue"
          description="You currently have no tasks assigned matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 bg-sand-100 dark:bg-charcoal-700">
                  <img
                    src={
                      issue.images?.[0] ||
                      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
                    }
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <CategoryBadge category={issue.category} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={issue.status} size="xs" />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <Link to={`/issues/${issue._id}`}>
                    <h3 className="font-serif font-bold text-sm text-charcoal-900 dark:text-sand-50 hover:text-brand-600 line-clamp-2">
                      {issue.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                    <span className="truncate">{issue.address}</span>
                  </div>

                  <p className="text-xs text-charcoal-600 dark:text-charcoal-300 line-clamp-2 mt-1">
                    {issue.description}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-3 border-t border-sand-100 dark:border-charcoal-700/60 flex items-center justify-between gap-2">
                <Link
                  to={`/issues/${issue._id}`}
                  className="text-xs font-semibold text-charcoal-600 dark:text-sand-300 hover:underline flex items-center gap-1"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUpdatingIssue(issue);
                    setNextStatus(issue.status === 'Assigned' ? 'In Progress' : 'Resolved');
                    setWorkNote('');
                    setProofFile(null);
                    setProofPreview('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Work</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Update Progress & Upload Proof */}
      {updatingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-charcoal-700">
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50">
                Update Ticket Resolution Progress
              </h3>
              <button
                onClick={() => setUpdatingIssue(null)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-500 mt-2 line-clamp-1">
              Ticket: <strong className="text-charcoal-800 dark:text-sand-200">{updatingIssue.title}</strong>
            </p>

            <form onSubmit={handleSubmitStatusUpdate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Status Transition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNextStatus('In Progress')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      nextStatus === 'In Progress'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'border-sand-300 dark:border-charcoal-700 text-charcoal-600 hover:bg-sand-50'
                    }`}
                  >
                    In Progress (Crew On-Site)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNextStatus('Resolved')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      nextStatus === 'Resolved'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-sand-300 dark:border-charcoal-700 text-charcoal-600 hover:bg-sand-50'
                    }`}
                  >
                    Resolved (Completed)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Work Log Notes / Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="e.g. Cleared 2 tons of debris; pathway washed with disinfectant."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100"
                />
              </div>

              {/* Proof image upload */}
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Attach Proof of Work Photo (Recommended for Resolved)
                </label>

                {proofPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-sand-300 dark:border-charcoal-700">
                    <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setProofFile(null);
                        setProofPreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-24 rounded-xl border-2 border-dashed border-sand-300 dark:border-charcoal-700 flex flex-col items-center justify-center text-charcoal-500 hover:border-brand-500 hover:text-brand-600 cursor-pointer transition-colors bg-sand-50/50 dark:bg-charcoal-900/50">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Click to upload completion photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-sand-100 dark:border-charcoal-700">
                <button
                  type="button"
                  onClick={() => setUpdatingIssue(null)}
                  className="px-4 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 text-charcoal-700 dark:text-sand-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving Progress...' : 'Submit Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
