import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { TableRowSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { Search, Shield, User, UserX, UserCheck, HardHat } from 'lucide-react';

export const AdminManageUsers = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useNotification();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const {
    data: usersData,
    loading,
    error,
    refetch,
    setData,
  } = useFetch('/admin/users', {
    params: {
      role: roleFilter !== 'All' ? roleFilter : undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      search: search || undefined,
      limit: 50,
    },
  });

  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

  // Handle role change
  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/role`, { role: newRole });
      if (res.data.success) {
        addToast({
          title: 'Role Updated',
          message: `${targetUser.name}'s role changed to ${newRole}`,
          type: 'info',
        });
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    }
  };

  // Handle activation toggle
  const handleToggleStatus = async (targetUser) => {
    const nextState = !targetUser.isActive;
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/status`, {
        isActive: nextState,
      });
      if (res.data.success) {
        addToast({
          title: 'Account Status Updated',
          message: `${targetUser.name} is now ${nextState ? 'Active' : 'Deactivated'}`,
          type: 'info',
        });
        refetch();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle account status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Access Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-sand-50 mt-0.5">
            Manage User Accounts & Permissions
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Grant field staff permissions, promote administrators, and manage active accounts.
          </p>
        </div>

        <div className="text-xs font-medium text-charcoal-500">
          Total Users: <strong className="text-charcoal-800 dark:text-sand-100">{users.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or phone..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-900 dark:text-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-800 dark:text-sand-200"
          >
            <option value="All">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="staff">Field Staff</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-sand-300 dark:border-charcoal-700 bg-sand-50/50 dark:bg-charcoal-900/50 text-charcoal-800 dark:text-sand-200"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sand-100/70 dark:bg-charcoal-700/60 border-b border-sand-200 dark:border-charcoal-700 text-charcoal-500 dark:text-charcoal-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100 dark:divide-charcoal-700/60">
              {loading ? (
                <>
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="No user records found"
                      description="Try clearing your search query or role filter."
                    />
                  </td>
                </tr>
              ) : (
                users.map((targetUser) => {
                  const isSelf = targetUser._id === currentUser?._id;

                  return (
                    <tr
                      key={targetUser._id}
                      className="hover:bg-sand-50/60 dark:hover:bg-charcoal-700/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {targetUser.avatar ? (
                            <img
                              src={targetUser.avatar}
                              alt={targetUser.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-sand-200 dark:bg-charcoal-700 text-charcoal-700 dark:text-sand-300 flex items-center justify-center font-bold text-xs">
                              {targetUser.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-charcoal-900 dark:text-sand-100 block">
                              {targetUser.name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] text-brand-600 font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-600 dark:text-charcoal-300">
                        {targetUser.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          disabled={isSelf}
                          value={targetUser.role}
                          onChange={(e) => handleRoleChange(targetUser, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-sand-300 dark:border-charcoal-700 bg-sand-50 dark:bg-charcoal-900 text-charcoal-800 dark:text-sand-200 text-xs font-medium focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="staff">Staff (Field Worker)</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            targetUser.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              targetUser.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{targetUser.isActive ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-400">
                        {new Date(targetUser.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(targetUser)}
                            className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                              targetUser.isActive
                                ? 'border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'border border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {targetUser.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;
