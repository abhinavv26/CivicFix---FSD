import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { TableRowSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  UserCheck,
  Trash2,
  ExternalLink,
  Edit,
  ArrowUpDown,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = ['All', 'Pothole', 'Garbage', 'Streetlight', 'Water Leakage', 'Other'];
const STATUSES = ['All', 'Reported', 'Assigned', 'In Progress', 'Resolved'];

export const AdminManageIssues = () => {
  const { socket } = useSocket();
  const { addToast } = useNotification();

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Assignment Modal
  const [assigningIssue, setAssigningIssue] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Status Override Modal
  const [statusModalIssue, setStatusModalIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('Reported');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Deletion Modal
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch active staff list for assignment dropdown
  const { data: staffList = [] } = useFetch('/admin/staff-list');

  // Fetch issues
  const {
    data: issuesData,
    loading,
    error,
    refetch,
    setData,
  } = useFetch('/issues', {
    params: {
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      search: search || undefined,
      page,
      limit: 25,
    },
  });

  const issues = Array.isArray(issuesData) ? issuesData : issuesData?.data || [];
  const total = issuesData?.total || issues.length;

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;
    const handleListUpdate = () => refetch();
    socket.on('issue:list_update', handleListUpdate);
    return () => socket.off('issue:list_update', handleListUpdate);
  }, [socket, refetch]);

  // Handle staff assignment
  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaffId || !assigningIssue) return;

    setIsAssigning(true);
    try {
      const res = await api.patch(`/admin/issues/${assigningIssue._id}/assign`, {
        assignedTo: selectedStaffId,
        note: assignmentNote,
      });

      if (res.data.success) {
        addToast({
          title: 'Staff Assigned',
          message: `Ticket successfully assigned to ${res.data.data.assignedTo?.name}`,
          type: 'info',
        });
        setAssigningIssue(null);
        setSelectedStaffId('');
        setAssignmentNote('');
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign staff');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle status override
  const handleStatusOverride = async (e) => {
    e.preventDefault();
    if (!statusModalIssue) return;

    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/issues/${statusModalIssue._id}/status`, {
        status: newStatus,
        note: statusNote,
      });

      if (res.data.success) {
        addToast({
          title: 'Status Updated',
          message: `Ticket status set to ${newStatus}`,
          type: 'info',
        });
        setStatusModalIssue(null);
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!issueToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/issues/${issueToDelete._id}`);
      if (res.data.success) {
        addToast({
          title: 'Issue Deleted',
          message: 'The ticket has been deleted by administrator.',
          type: 'info',
        });
        setIssueToDelete(null);
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Workforce Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Manage Civic Issues & Tickets
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Dispatch municipal field staff, review resolution timeline updates, and manage active tickets.
          </p>
        </div>

        <div className="text-xs text-charcoal-500 dark:text-charcoal-400 self-start sm:self-auto font-medium">
          Total: <strong className="text-charcoal-800 dark:text-sand-100">{total}</strong> tickets
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by title, description or address..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-800 dark:text-sand-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-800 dark:text-sand-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Issues Table */}
      <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sand-100/70 dark:bg-charcoal-700/60 border-b border-sand-200 dark:border-charcoal-700 text-charcoal-500 dark:text-charcoal-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Issue Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Crew</th>
                <th className="py-3.5 px-4">Reported By</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100 dark:divide-charcoal-700/60">
              {loading ? (
                <>
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                </>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="No tickets match this filter"
                      description="Try clearing search queries or changing status filters."
                    />
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr
                    key={issue._id}
                    className="hover:bg-sand-50/60 dark:hover:bg-charcoal-700/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-semibold text-charcoal-900 dark:text-sand-100 hover:text-brand-600 block line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-[11px] text-charcoal-400 truncate mt-0.5">
                        {issue.address}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={issue.category} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {issue.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-medium text-charcoal-800 dark:text-sand-200">
                            {issue.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-500 dark:text-charcoal-400">
                      {issue.reportedBy?.name || 'Citizen'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign button */}
                        <button
                          type="button"
                          onClick={() => {
                            setAssigningIssue(issue);
                            setSelectedStaffId(issue.assignedTo?._id || '');
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Assign to staff"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>

                        {/* Status override button */}
                        <button
                          type="button"
                          onClick={() => {
                            setStatusModalIssue(issue);
                            setNewStatus(issue.status);
                          }}
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                          title="Change status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Detail view */}
                        <Link
                          to={`/issues/${issue._id}`}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 dark:hover:text-sand-200"
                          title="Open ticket"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => setIssueToDelete(issue)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Assign to Staff */}
      {assigningIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50 mb-1">
              Assign Ticket to Field Staff
            </h3>
            <p className="text-xs text-charcoal-500 mb-4 line-clamp-1">
              {assigningIssue.title}
            </p>

            <form onSubmit={handleAssignStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Select Staff Member
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-sand-100"
                >
                  <option value="">-- Choose field worker --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Assignment Note / Instruction
                </label>
                <textarea
                  rows={3}
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="e.g. High priority: please dispatch asphalt crew before evening rush."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-sand-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningIssue(null)}
                  className="px-4 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 text-charcoal-700 dark:text-sand-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedStaffId}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Status Override */}
      {statusModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-sand-50 mb-1">
              Override Ticket Status
            </h3>
            <p className="text-xs text-charcoal-500 mb-4 line-clamp-1">
              {statusModalIssue.title}
            </p>

            <form onSubmit={handleStatusOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-sand-100"
                >
                  <option value="Reported">Reported</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-sand-300 mb-1">
                  Reason / Audit Log Note
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Status changed manually by administrator"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-sand-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalIssue(null)}
                  className="px-4 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 text-charcoal-700 dark:text-sand-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Issue Deletion */}
      <ConfirmationModal
        isOpen={Boolean(issueToDelete)}
        onClose={() => setIssueToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Issue Ticket?"
        message={`Are you sure you want to delete "${issueToDelete?.title}"? All associated activity logs and comments will be permanently erased.`}
        confirmText="Confirm Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminManageIssues;
